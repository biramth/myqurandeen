import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { prayerAlertSettings, pushSubscriptions, users } from "../../database/schema";
import { WebPushProvider } from "../notifications/web-push.provider";
import { formatHhmm, PrayerName, twoPrayerTimes } from "./prayer-times";
import { alreadySentToday, GRACE_MINUTES, localClock, minutesSince } from "./reminder-scheduler.service";
import { SchedulerLockService } from "./scheduler-lock.service";

/** Cle arbitraire du verrou consultatif Postgres pour ce planificateur (voir SchedulerLockService). */
const LOCK_KEY = 483920004;

/** Nom affiche de chaque priere - non traduit (comme les noms de sourates), identique dans toutes les langues. */
const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

/** Corps localise de la notification : seul le texte autour du nom de la priere est traduit. */
const ALERT_BODIES: Record<string, (prayer: string) => string> = {
  fr: (p) => `C'est l'heure de la priere de ${p}.`,
  en: (p) => `It's time for ${p} prayer.`,
  de: (p) => `Es ist Zeit für das ${p}-Gebet.`,
  es: (p) => `Es hora de la oración de ${p}.`,
  id: (p) => `Saatnya salat ${p}.`,
  ru: (p) => `Время молитвы ${p}.`,
  tr: (p) => `${p} namazı vakti geldi.`,
  ur: (p) => `${p} کی نماز کا وقت ہو گیا ہے۔`,
};

function alertBody(locale: string, prayer: PrayerName): string {
  const factory = ALERT_BODIES[locale] ?? ALERT_BODIES.fr;
  return factory(PRAYER_LABELS[prayer]);
}

const SENT_AT_COLUMN: Record<PrayerName, keyof typeof prayerAlertSettings.$inferSelect> = {
  fajr: "fajrSentAt",
  dhuhr: "dhuhrSentAt",
  asr: "asrSentAt",
  maghrib: "maghribSentAt",
  isha: "ishaSentAt",
};

/**
 * Notifications aux 5 heures de priere (Fajr/Dhuhr/Asr/Maghrib/Isha),
 * calculees avec adhan (position + methode choisies par l'utilisateur) -
 * distinct du planificateur "duas du matin/soir" (DuaSchedulerService), qui
 * envoie un contenu different (invocations Hisn al-Muslim) a Fajr/Isha
 * uniquement. `enabledPrayers` permet de ne s'abonner qu'a certaines
 * prieres. Meme squelette que les 3 autres planificateurs du module
 * (verrou, fenetre de grace, anti-doublon par jour calendaire local).
 * Deploiement mono-instance : meme note que ReminderSchedulerService.
 */
@Injectable()
export class PrayerAlertSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PrayerAlertSchedulerService.name);

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
        this.logger.error(`Echec du tick d'alerte de priere : ${(error as Error).message}`);
      }
    });
  }

  private async process() {
    const rows = await this.db
      .select({ setting: prayerAlertSettings, locale: users.locale })
      .from(prayerAlertSettings)
      .innerJoin(users, eq(users.id, prayerAlertSettings.userId))
      .where(eq(prayerAlertSettings.isActive, true));

    for (const { setting, locale } of rows) {
      const clock = localClock(setting.timezone);
      if (!clock) continue;

      const times = twoPrayerTimes(
        setting.timezone,
        setting.latitude,
        setting.longitude,
        new Date(),
        setting.calculationMethod as Parameters<typeof twoPrayerTimes>[4],
      );
      if (!times) continue;

      const enabled = new Set(setting.enabledPrayers as PrayerName[]);
      const schedule: Record<PrayerName, Date> = {
        fajr: times.fajr,
        dhuhr: times.dhuhr,
        asr: times.asr,
        maghrib: times.maghrib,
        isha: times.isha,
      };

      for (const prayer of Object.keys(schedule) as PrayerName[]) {
        if (!enabled.has(prayer)) continue;
        // Chaque priere est isolee dans son propre try/catch : un echec sur
        // l'une ne doit pas empecher les autres pour le meme utilisateur, ni
        // interrompre la boucle pour les autres utilisateurs.
        try {
          await this.trySendPrayer(setting, locale, prayer, schedule[prayer], clock);
        } catch (error) {
          this.logger.error(
            `Echec de l'alerte ${prayer} pour l'utilisateur ${setting.userId} : ${(error as Error).message}`,
          );
        }
      }
    }
  }

  private async trySendPrayer(
    setting: typeof prayerAlertSettings.$inferSelect,
    locale: string,
    prayer: PrayerName,
    prayerTime: Date,
    clock: ReturnType<typeof localClock>,
  ) {
    if (!clock) return;
    const targetHhmm = formatHhmm(prayerTime.toISOString(), setting.timezone);
    if (!targetHhmm) return;

    const since = minutesSince(clock.hhmm, targetHhmm);
    if (since < 0 || since > GRACE_MINUTES) return; // pas encore l'heure / fenetre depassee

    const sentAt = setting[SENT_AT_COLUMN[prayer]] as Date | null;
    if (sentAt && alreadySentToday(setting.timezone, sentAt, targetHhmm, clock)) {
      return; // deja envoye aujourd'hui a (ou apres) l'heure cible courante
    }

    const sent = await this.notifyUser(setting.userId, {
      title: PRAYER_LABELS[prayer],
      body: alertBody(locale, prayer),
      url: "/prayer-times",
    });
    if (sent) {
      await this.db
        .update(prayerAlertSettings)
        .set({ [SENT_AT_COLUMN[prayer]]: new Date(), updatedAt: new Date() })
        .where(eq(prayerAlertSettings.userId, setting.userId));
    }
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
