import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { khatmProgress, pushSubscriptions, ramadanAlertSettings, users } from "../../database/schema";
import { WebPushProvider } from "../notifications/web-push.provider";
import { getHijriDate, isRamadan, TOTAL_QURAN_VERSES } from "./hijri-calendar";
import { alreadySentToday, GRACE_MINUTES, localClock, minutesSince } from "./scheduling-logic";
import { SchedulerLockService } from "./scheduler-lock.service";

/** Cle arbitraire du verrou consultatif Postgres pour ce planificateur (voir SchedulerLockService). */
const LOCK_KEY = 483920005;

const ALERT_TITLES: Record<string, string> = {
  fr: "Ramadan Moubarak !",
  en: "Ramadan Mubarak!",
  de: "Ramadan Mubarak!",
  es: "¡Ramadán Mubarak!",
  id: "Ramadan Mubarak!",
  ru: "Рамадан Мубарак!",
  tr: "Ramazan Mübarek Olsun!",
  ur: "رمضان مبارک!",
};

/** `versesLeftToday` : null si pas de khatm en cours (message generique), sinon l'objectif calcule pour aujourd'hui. */
const ALERT_BODIES: Record<string, (day: number, versesLeftToday: number | null) => string> = {
  fr: (d, v) =>
    v === null
      ? `Jour ${d} du Ramadan. Profite de ce jour béni pour lire, invoquer et faire le bien.`
      : `Jour ${d} du Ramadan. Il te reste ${v} verset${v > 1 ? "s" : ""} à lire aujourd'hui pour terminer le Coran ce mois-ci.`,
  en: (d, v) =>
    v === null
      ? `Day ${d} of Ramadan. Make the most of this blessed day - read, pray, and do good.`
      : `Day ${d} of Ramadan. You have ${v} verse${v > 1 ? "s" : ""} left to read today to finish the Quran this month.`,
  de: (d, v) => (v === null ? `Tag ${d} des Ramadan. Nutze diesen gesegneten Tag.` : `Tag ${d} des Ramadan. Noch ${v} Verse heute für dein Khatm.`),
  es: (d, v) => (v === null ? `Día ${d} del Ramadán. Aprovecha este día bendito.` : `Día ${d} del Ramadán. Te quedan ${v} versículos hoy para tu khatm.`),
  id: (d, v) => (v === null ? `Hari ke-${d} Ramadan. Manfaatkan hari yang penuh berkah ini.` : `Hari ke-${d} Ramadan. Tersisa ${v} ayat hari ini untuk khatam bulan ini.`),
  ru: (d, v) => (v === null ? `${d}-й день Рамадана. Используй этот благословенный день.` : `${d}-й день Рамадана. Осталось ${v} аятов сегодня для завершения Корана.`),
  tr: (d, v) => (v === null ? `Ramazan'ın ${d}. günü. Bu mübarek günü değerlendir.` : `Ramazan'ın ${d}. günü. Bu ay hatim için bugün ${v} ayet kaldı.`),
  ur: (d, v) => (v === null ? `رمضان کا ${d} واں دن۔ اس بابرکت دن سے فائدہ اٹھائیں۔` : `رمضان کا ${d} واں دن۔ آج ${v} آیات باقی ہیں۔`),
};

function alertTitle(locale: string): string {
  return ALERT_TITLES[locale] ?? ALERT_TITLES.fr;
}

function alertBody(locale: string, day: number, versesLeftToday: number | null): string {
  const bodyFactory = ALERT_BODIES[locale] ?? ALERT_BODIES.fr;
  return bodyFactory(day, versesLeftToday);
}

/** Jour du Ramadan (1-30) dans le calendrier local d'un fuseau donne, ou null hors Ramadan. Voir la limite d'approximation documentee dans hijri-calendar.ts. */
function ramadanDayForTimezone(timezone: string, at: Date): number | null {
  const clock = localClock(timezone, at);
  if (!clock) return null;
  const [y, m, d] = clock.dateKey.split("-").map(Number);
  const hijri = getHijriDate(new Date(Date.UTC(y, m - 1, d)));
  return isRamadan(hijri) ? hijri.day : null;
}

/**
 * Notification quotidienne pendant le Ramadan (ROADMAP.md, phase 4) - meme
 * squelette exact que StreakAlertSchedulerService : verrou consultatif
 * Postgres, dedoublonnage par jour calendaire local, declenche aussi via
 * `POST /reminders/run` (instance Render gratuite, voir
 * scheduler-run.controller.ts).
 */
@Injectable()
export class RamadanAlertSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RamadanAlertSchedulerService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly webPush: WebPushProvider,
    private readonly schedulerLock: SchedulerLockService,
  ) {}

  async onApplicationBootstrap() {
    await this.tick();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (!this.webPush.isConfigured) return;
    await this.schedulerLock.withLock(LOCK_KEY, async () => {
      try {
        await this.process();
      } catch (error) {
        this.logger.error(`Echec du tick d'alerte Ramadan : ${(error as Error).message}`);
      }
    });
  }

  private async process() {
    const rows = await this.db
      .select({ setting: ramadanAlertSettings, locale: users.locale })
      .from(ramadanAlertSettings)
      .innerJoin(users, eq(users.id, ramadanAlertSettings.userId))
      .where(eq(ramadanAlertSettings.isActive, true));

    for (const { setting, locale } of rows) {
      try {
        const clock = localClock(setting.timezone);
        if (!clock) continue;

        const ramadanDay = ramadanDayForTimezone(setting.timezone, new Date());
        if (ramadanDay === null) continue; // hors Ramadan dans le fuseau de l'utilisateur

        const since = minutesSince(clock.hhmm, setting.timeOfDay);
        if (since < 0 || since > GRACE_MINUTES) continue;
        if (setting.lastSentAt && alreadySentToday(setting.timezone, setting.lastSentAt, setting.timeOfDay, clock)) {
          continue;
        }

        const versesLeftToday = await this.versesLeftForToday(setting.userId);
        const sent = await this.notifyUser(setting.userId, {
          title: alertTitle(locale),
          body: alertBody(locale, ramadanDay, versesLeftToday),
          url: "/ramadan",
        });
        if (sent) {
          await this.db
            .update(ramadanAlertSettings)
            .set({ lastSentAt: new Date() })
            .where(eq(ramadanAlertSettings.userId, setting.userId));
        }
      } catch (error) {
        this.logger.error(`Echec de l'alerte Ramadan pour l'utilisateur ${setting.userId} : ${(error as Error).message}`);
      }
    }
  }

  /** Objectif du jour (versets restants / jours restants) si un khatm est en cours pour cet utilisateur, sinon null (message generique). */
  private async versesLeftForToday(userId: string): Promise<number | null> {
    const [progress] = await this.db.select().from(khatmProgress).where(eq(khatmProgress.userId, userId)).limit(1);
    if (!progress || progress.completedAt) return null;
    const currentHijriYear = getHijriDate().year;
    if (progress.hijriYear !== currentHijriYear) return null; // ancien cycle, pas de khatm actif cette annee
    return Math.max(0, TOTAL_QURAN_VERSES - progress.versesCompleted);
  }

  /** Envoie a tous les abonnements push de l'utilisateur ; nettoie ceux revoques (404/410). Renvoie true si au moins un envoi a reussi. */
  private async notifyUser(userId: string, payload: { title: string; body: string; url: string }): Promise<boolean> {
    const subs = await this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    if (subs.length === 0) return false;

    let anySent = false;
    for (const sub of subs) {
      const result = await this.webPush.sendAndCleanup(sub, payload);
      if (result === "sent") anySent = true;
    }
    return anySent;
  }
}
