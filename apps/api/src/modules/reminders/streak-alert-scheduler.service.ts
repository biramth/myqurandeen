import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { pushSubscriptions, streakAlertSettings, userStreaks, users } from "../../database/schema";
import { WebPushProvider } from "../notifications/web-push.provider";
import { GRACE_MINUTES, localClock, minutesSince } from "./reminder-scheduler.service";

const ALERT_TITLES: Record<string, string> = {
  fr: "Garde ta série !",
  en: "Keep your streak!",
  de: "Bleib dran!",
  es: "¡Mantén tu racha!",
  id: "Jaga streak-mu!",
  ru: "Не потеряй серию!",
  tr: "Serini koru!",
  ur: "اپنی سیریز برقرار رکھیں!",
};

const ALERT_BODIES: Record<string, (count: number) => string> = {
  fr: (c) => `Tu en es à ${c} jour${c > 1 ? "s" : ""}. Lis un verset avant minuit pour garder ta série.`,
  en: (c) => `You're at ${c} day${c > 1 ? "s" : ""}. Read a verse before midnight to keep your streak.`,
  de: (c) => `Du bist bei ${c} Tag${c > 1 ? "en" : ""}. Lies einen Vers vor Mitternacht, um deine Serie zu halten.`,
  es: (c) => `Llevas ${c} día${c > 1 ? "s" : ""}. Lee un versículo antes de medianoche para mantener la racha.`,
  id: (c) => `Kamu mencapai ${c} hari. Baca satu ayat sebelum tengah malam untuk menjaga streak-mu.`,
  ru: (c) => `У тебя ${c} дн${c % 10 === 1 && c % 100 !== 11 ? "ь" : "я"}. Прочитай аят до полуночи, чтобы сохранить серию.`,
  tr: (c) => `Bugün ${c}. günündesin. Serini korumak için gece yarısından önce bir ayet oku.`,
  ur: (c) => `آپ ${c} دن تک پہنچ گئے ہیں۔ سیریز برقرار رکھنے کے لیے آدھی رات سے پہلے ایک آیت پڑھیں۔`,
};

function alertTitle(locale: string): string {
  return ALERT_TITLES[locale] ?? ALERT_TITLES.fr;
}

function alertBody(locale: string, count: number): string {
  const bodyFactory = ALERT_BODIES[locale] ?? ALERT_BODIES.fr;
  return bodyFactory(count);
}

/**
 * Alerte "garde ta serie" : une fois par jour a l'heure choisie par
 * l'utilisateur (dans SON fuseau horaire), si celui-ci a une serie en cours
 * mais n'a encore rien lu aujourd'hui, on envoie une notification push qui
 * ouvre l'app au clic. Ne se declenche que si la serie est vivante (>= 1) et
 * uniquement si aucun envoi n'a deja eu lieu ce jour calendaire local.
 * Deploiement mono-instance : meme note que ReminderSchedulerService.
 */
@Injectable()
export class StreakAlertSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StreakAlertSchedulerService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly webPush: WebPushProvider,
  ) {}

  async onApplicationBootstrap() {
    await this.tick();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (!this.webPush.isConfigured) return;
    try {
      await this.process();
    } catch (error) {
      this.logger.error(`Echec du tick d'alerte de serie : ${(error as Error).message}`);
    }
  }

  private async process() {
    const rows = await this.db
      .select({
        setting: streakAlertSettings,
        locale: users.locale,
        currentStreak: userStreaks.currentStreak,
        lastActiveDate: userStreaks.lastActiveDate,
      })
      .from(streakAlertSettings)
      .innerJoin(users, eq(users.id, streakAlertSettings.userId))
      .leftJoin(userStreaks, eq(userStreaks.userId, streakAlertSettings.userId))
      .where(eq(streakAlertSettings.isActive, true));

    for (const { setting, locale, currentStreak, lastActiveDate } of rows) {
      const clock = localClock(setting.timezone);
      if (!clock) continue;
      // Pas de serie a proteger, deja actif aujourd'hui, ou pas encore l'heure.
      if (!currentStreak || currentStreak < 1) continue;
      if (lastActiveDate === clock.dateKey) continue;
      const since = minutesSince(clock.hhmm, setting.timeOfDay);
      if (since < 0 || since > GRACE_MINUTES) continue;
      if (setting.lastSentAt && localClock(setting.timezone, setting.lastSentAt)?.dateKey === clock.dateKey) {
        continue; // deja alerte aujourd'hui
      }

      // Le clic sur la notification ouvre simplement l'app : l'objectif est
      // une action minimale (lire un verset) avant la fin de la journee.
      const sent = await this.notifyUser(setting.userId, {
        title: alertTitle(locale),
        body: alertBody(locale, currentStreak),
        url: "/",
      });
      if (sent) {
        await this.db
          .update(streakAlertSettings)
          .set({ lastSentAt: new Date() })
          .where(eq(streakAlertSettings.userId, setting.userId));
      }
    }
  }

  /** Envoie a tous les abonnements push de l'utilisateur ; nettoie ceux revoques (404/410). Renvoie true si au moins un envoi a reussi. */
  private async notifyUser(userId: string, payload: { title: string; body: string; url: string }): Promise<boolean> {
    const subs = await this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    if (subs.length === 0) return false;

    let anySent = false;
    for (const sub of subs) {
      const result = await this.webPush.send(sub, payload);
      if (result === "sent") anySent = true;
      if (result === "gone") {
        await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
    }
    return anySent;
  }
}