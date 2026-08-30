import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { duaCategories, duaScheduleSettings, duas, pushSubscriptions, users } from "../../database/schema";
import { WebPushProvider } from "../notifications/web-push.provider";
import { GRACE_MINUTES, localClock, minutesSince } from "./reminder-scheduler.service";

/** Corps localise du rappel, par creneau (matin / soir). */
const DUA_BODIES: Record<"matin" | "soir", Record<string, string>> = {
  matin: {
    fr: "C'est l'heure des invocations du matin (Hisn al-Muslim).",
    en: "It's time for the morning adhkar (Hisn al-Muslim).",
    de: "Es ist Zeit für die morgendlichen Adhkar (Hisn al-Muslim).",
    es: "Es la hora de los adhkar de la mañana (Hisn al-Muslim).",
    id: "Saatnya adhkar pagi (Hisn al-Muslim).",
    ru: "Время утренних зикров (Хисн аль-Муслим).",
    tr: "Sabah zikirleri zamanı (Hisn al-Muslim).",
    ur: "صبح کے اذکار کا وقت (حصن المسلم)۔",
  },
  soir: {
    fr: "C'est l'heure des invocations du soir (Hisn al-Muslim).",
    en: "It's time for the evening adhkar (Hisn al-Muslim).",
    de: "Es ist Zeit für die abendlichen Adhkar (Hisn al-Muslim).",
    es: "Es la hora de los adhkar de la noche (Hisn al-Muslim).",
    id: "Saatnya adhkar sore (Hisn al-Muslim).",
    ru: "Время вечерних зикров (Хисн аль-Муслим).",
    tr: "Akşam zikirleri zamanı (Hisn al-Muslim).",
    ur: "شام کے اذکار کا وقت (حصن المسلم)۔",
  },
};

function duaBody(slot: "matin" | "soir", locale: string): string {
  return DUA_BODIES[slot][locale] ?? DUA_BODIES[slot].fr;
}

/**
 * "Duas automatiques" : active par defaut des le premier abonnement push.
 * Deux envois par jour (matin ~07:00, soir ~19:00, dans le fuseau local de
 * l'utilisateur) tirant un dua reel de la base (categories "matin"/"soir").
 * Comme les autres planificateurs : un seul envoi par creneau et par jour
 * calendaire local (morningSentAt/eveningSentAt), fenetre de grace de 45 min.
 * Deploiement mono-instance : meme note que ReminderSchedulerService.
 */
@Injectable()
export class DuaSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DuaSchedulerService.name);

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
      this.logger.error(`Echec du tick de duas automatiques : ${(error as Error).message}`);
    }
  }

  private async process() {
    const rows = await this.db
      .select({ setting: duaScheduleSettings, locale: users.locale })
      .from(duaScheduleSettings)
      .innerJoin(users, eq(users.id, duaScheduleSettings.userId))
      .where(eq(duaScheduleSettings.isActive, true));

    for (const { setting, locale } of rows) {
      await this.trySendSlot(setting, locale, "matin", setting.morningTime);
      await this.trySendSlot(setting, locale, "soir", setting.eveningTime);
    }
  }

  private async trySendSlot(
    setting: typeof duaScheduleSettings.$inferSelect,
    locale: string,
    slot: "matin" | "soir",
    timeOfDay: string,
  ) {
    const clock = localClock(setting.timezone);
    if (!clock) return;

    const since = minutesSince(clock.hhmm, timeOfDay);
    if (since < 0 || since > GRACE_MINUTES) return; // pas encore l'heure / fenetre depassee

    const sentAt = slot === "matin" ? setting.morningSentAt : setting.eveningSentAt;
    if (sentAt && localClock(setting.timezone, sentAt)?.dateKey === clock.dateKey) {
      return; // deja envoye aujourd'hui
    }

    const dua = await this.randomDua(slot);
    if (!dua) return; // categorie vide : pas d'envoi

    const sent = await this.notifyUser(setting.userId, {
      title: dua.title,
      body: duaBody(slot, locale),
      url: `/duas/${slot}`,
    });
    if (sent) {
      const column = slot === "matin" ? "morningSentAt" : "eveningSentAt";
      await this.db
        .update(duaScheduleSettings)
        .set({ [column]: new Date(), updatedAt: new Date() })
        .where(eq(duaScheduleSettings.userId, setting.userId));
    }
  }

  /** Tire un dua au hasard dans la categorie du creneau (matin/soir). */
  private async randomDua(categorySlug: "matin" | "soir") {
    const rows = await this.db
      .select({ id: duas.id, title: duas.title })
      .from(duas)
      .innerJoin(duaCategories, eq(duaCategories.id, duas.categoryId))
      .where(eq(duaCategories.slug, categorySlug));
    if (rows.length === 0) return null;
    return rows[Math.floor(Math.random() * rows.length)];
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