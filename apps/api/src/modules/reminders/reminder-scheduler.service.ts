import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { pushSubscriptions, quranSurahs, readingRotationSettings, reminders, users } from "../../database/schema";
import { WebPushProvider } from "../notifications/web-push.provider";
import { SchedulerLockService } from "./scheduler-lock.service";

/** Cle arbitraire du verrou consultatif Postgres pour ce planificateur (voir SchedulerLockService). */
const LOCK_KEY = 483920001;

interface LocalClock {
  hhmm: string;
  dayOfWeek: number;
  dateKey: string;
}

/**
 * Heure/jour/date "muraux" dans un fuseau IANA donne, sans dependre d'une
 * librairie de dates : `Intl.DateTimeFormat` fait deja tout le travail de
 * conversion et connait les regles DST a jour. `formatToParts` plutot que le
 * formattage en chaine + parsing, pour rester robuste aux locales.
 */
export function localClock(timeZone: string, at: Date = new Date()): LocalClock | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    }).formatToParts(at);
    const map: Record<string, string> = {};
    for (const part of parts) map[part.type] = part.value;
    // ICU rend parfois minuit "24" plutot que "00" avec hour12:false.
    const hour = map.hour === "24" ? "00" : map.hour;
    const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      hhmm: `${hour}:${map.minute}`,
      dayOfWeek: weekdayIndex[map.weekday] ?? 0,
      dateKey: `${map.year}-${map.month}-${map.day}`,
    };
  } catch {
    // Fuseau invalide/inconnu : ce rappel est ignore plutot que de faire echouer tout le tick.
    return null;
  }
}

/** Minutes ecoulees entre "maintenant" (hh:mm) et une cible "hh:mm" ; negatif si la cible est dans le futur. */
export function minutesSince(nowHhmm: string, targetHhmm: string): number {
  const [nh, nm] = nowHhmm.split(":").map(Number);
  const [th, tm] = targetHhmm.split(":").map(Number);
  return nh * 60 + nm - (th * 60 + tm);
}

/**
 * Fenetre de tolerantance pour les notifications : si l'instance s'est
 * reveillee tard (service endormi, deploiement...), on envoie quand meme les
 * rappels dont l'heure est passee de moins de GRACE_MINUTES. Au-dela, on
 * saute (un rappel de 6h arrive a 8h n'a plus de sens).
 */
const GRACE_MINUTES = 45;
export { GRACE_MINUTES };

const DUA_BODY: Record<string, string> = {
  fr: "C'est l'heure de cette invocation.",
  en: "It's time for this invocation.",
  de: "Es ist Zeit für diese Anrufung.",
  es: "Es hora de esta invocación.",
  id: "Ini waktunya untuk doa ini.",
  ru: "Время для этого дуа.",
  tr: "Bu dua için vakit geldi.",
  ur: "اس دعا کا وقت ہو گیا ہے۔",
};
const DUA_CATEGORY_BODY: Record<string, string> = {
  fr: "C'est l'heure de vos invocations.",
  en: "It's time for your invocations.",
  de: "Es ist Zeit für Ihre Anrufungen.",
  es: "Es hora de tus invocaciones.",
  id: "Ini waktunya untuk doa-doa Anda.",
  ru: "Время для ваших дуа.",
  tr: "Dualarınız için vakit geldi.",
  ur: "آپ کی دعاؤں کا وقت ہو گیا ہے۔",
};
const SURAH_BODY: Record<string, string> = {
  fr: "Il est temps de lire cette sourate.",
  en: "It's time to read this surah.",
  de: "Es ist Zeit, diese Sure zu lesen.",
  es: "Es hora de leer esta sura.",
  id: "Saatnya membaca surah ini.",
  ru: "Время читать эту суру.",
  tr: "Bu sureyi okuma vakti geldi.",
  ur: "اس سورت کو پڑھنے کا وقت ہو گیا ہے۔",
};

function bodyFor(targetType: "dua" | "dua_category" | "surah", locale: string): string {
  const table = targetType === "surah" ? SURAH_BODY : targetType === "dua_category" ? DUA_CATEGORY_BODY : DUA_BODY;
  return table[locale] ?? table.fr;
}

/**
 * Planificateur des notifications push (rappels dua/lecture + rotation
 * automatique de sourates). Tourne chaque minute ; totalement inerte si les
 * cles VAPID ne sont pas configurees (voir WebPushProvider.isConfigured).
 *
 * Deploiement mono-instance (Render) : pas de verrou distribue necessaire.
 * Si l'app tournait un jour sur plusieurs instances, ce cron s'executerait
 * en double sur chacune - a revoir avec un verrou (ex. advisory lock
 * Postgres) avant de scaler horizontalement.
 */
@Injectable()
export class ReminderSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly webPush: WebPushProvider,
    private readonly schedulerLock: SchedulerLockService,
  ) {}

  /**
   * Catch-up au demarrage : si l'instance dormait (tier gratuit Render) au
   * moment du rappel et vient d'etre reveillee par une visite, on envoie les
   * rappels dus recemment au lieu d'attendre la minute exacte suivante.
   */
  async onApplicationBootstrap() {
    await this.tick();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (!this.webPush.isConfigured) return;
    this.webPush.lastTickAt = new Date();
    await this.schedulerLock.withLock(LOCK_KEY, async () => {
      try {
        await this.processReminders();
        await this.processRotation();
      } catch (error) {
        this.logger.error(`Echec du tick de rappels : ${(error as Error).message}`);
      }
    });
  }

  private async processReminders() {
    const active = await this.db
      .select({ reminder: reminders, locale: users.locale })
      .from(reminders)
      .innerJoin(users, eq(users.id, reminders.userId))
      .where(eq(reminders.isActive, true));

    for (const { reminder, locale } of active) {
      try {
        const clock = localClock(reminder.timezone);
        if (!clock || !reminder.daysOfWeek.includes(clock.dayOfWeek)) continue;
        const since = minutesSince(clock.hhmm, reminder.timeOfDay);
        if (since < 0 || since > GRACE_MINUTES) continue;
        if (reminder.lastSentAt && localClock(reminder.timezone, reminder.lastSentAt)?.dateKey === clock.dateKey) {
          continue; // deja envoye aujourd'hui (evite un double envoi si le tick chevauche)
        }

        const sent = await this.notifyUser(reminder.userId, {
          title: reminder.label,
          body: bodyFor(reminder.targetType as "dua" | "dua_category" | "surah", locale),
          url: reminder.href,
        });
        if (sent) {
          await this.db.update(reminders).set({ lastSentAt: new Date() }).where(eq(reminders.id, reminder.id));
        }
      } catch (error) {
        // Isole l'echec a cet utilisateur : sans ce try/catch, une exception
        // ici interromprait le reste de la boucle pour tous les autres.
        this.logger.error(`Echec du rappel pour l'utilisateur ${reminder.userId} : ${(error as Error).message}`);
      }
    }
  }

  private async processRotation() {
    const active = await this.db
      .select({ setting: readingRotationSettings, locale: users.locale })
      .from(readingRotationSettings)
      .innerJoin(users, eq(users.id, readingRotationSettings.userId))
      .where(eq(readingRotationSettings.isActive, true));

    for (const { setting, locale } of active) {
      try {
        const clock = localClock(setting.timezone);
        if (!clock || !setting.daysOfWeek.includes(clock.dayOfWeek)) continue;
        const since = minutesSince(clock.hhmm, setting.timeOfDay);
        if (since < 0 || since > GRACE_MINUTES) continue;
        if (setting.lastSentAt && localClock(setting.timezone, setting.lastSentAt)?.dateKey === clock.dateKey) {
          continue;
        }

        const nextNumber = ((setting.lastSurahNumber ?? 0) % 114) + 1;
        const [surah] = await this.db
          .select({ number: quranSurahs.number, name: quranSurahs.nameTransliterated })
          .from(quranSurahs)
          .where(eq(quranSurahs.number, nextNumber))
          .limit(1);
        if (!surah) continue;

        const sent = await this.notifyUser(setting.userId, {
          title: surah.name,
          body: bodyFor("surah", locale),
          url: `/quran/${surah.number}`,
        });
        if (sent) {
          await this.db
            .update(readingRotationSettings)
            .set({ lastSurahNumber: surah.number, lastSentAt: new Date() })
            .where(eq(readingRotationSettings.id, setting.id));
        }
      } catch (error) {
        this.logger.error(`Echec de la rotation de sourate pour l'utilisateur ${setting.userId} : ${(error as Error).message}`);
      }
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
