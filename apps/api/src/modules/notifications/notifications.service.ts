import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { duaScheduleSettings, pushSubscriptions, streakAlertSettings, users } from "../../database/schema";
import { WebPushProvider } from "./web-push.provider";

const WELCOME_TITLES: Record<string, string> = {
  fr: "Bienvenue !",
  en: "Welcome!",
  de: "Willkommen!",
  es: "¡Bienvenido!",
  id: "Selamat datang!",
  ru: "Добро пожаловать!",
  tr: "Hoş geldin!",
  ur: "خوش آمدید!",
};

const WELCOME_BODIES: Record<string, string> = {
  fr: "Vos duas du matin et du soir sont activés automatiquement.",
  en: "Your morning and evening duas are now enabled automatically.",
  de: "Deine morgendlichen und abendlichen Duas sind jetzt automatisch aktiviert.",
  es: "Tus duas de la mañana y de la noche están activados automáticamente.",
  id: "Dua pagi dan sore kamu sekarang aktif secara otomatis.",
  ru: "Утренние и вечерние дуа теперь активированы автоматически.",
  tr: "Sabah ve akşam duaların otomatik olarak etkinleştirildi.",
  ur: "صبح اور شام کی دعائیں خودکار طور پر فعال ہو گئیں۔",
};

function welcomeTitle(locale: string): string {
  return WELCOME_TITLES[locale] ?? WELCOME_TITLES.fr;
}

function welcomeBody(locale: string): string {
  return WELCOME_BODIES[locale] ?? WELCOME_BODIES.fr;
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly webPush: WebPushProvider,
  ) {}

  health() {
    return { ready: this.webPush.isConfigured, vapidPublicKey: this.webPush.publicKey, lastTickAt: this.webPush.lastTickAt };
  }

  /**
   * Envoie immédiatement une notification de test à tous les abonnements de
   * l'utilisateur (bouton "Envoyer un test" de l'onglet Rappels). Sert aussi
   * de diagnostic : un "sent" ici prouve que la chaîne VAPID -> push service
   * fonctionne, et qu'un problème éventuel vient du planificateur.
   *
   * `devices` liste chaque abonnement cible (hôte du push service, navigateur,
   * configuration VAPID) : sur iOS ce doit etre `web.push.apple.com` depuis
   * la PWA installee - un autre hote signifie que l'abonnement vient d'un
   * contexte different (Safari, Android...) et son envoi ne sera pas affiche.
   */
  async sendTest(userId: string): Promise<{ sent: number; total: number; devices: unknown[] }> {
    const subs = await this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    let sent = 0;
    const devices: unknown[] = [];
    for (const sub of subs) {
      const result = await this.webPush.sendAndCleanup(sub, {
        title: "myQurandeen",
        body: "Test notification.",
        url: "/",
      });
      devices.push({
        host: new URL(sub.endpoint).host,
        userAgent: sub.userAgent ?? null,
        result,
        sentAt: result === "sent" ? new Date().toISOString() : null,
      });
      if (result === "sent") sent += 1;
    }
    return { sent, total: subs.length, devices };
  }

  async subscribe(
    userId: string,
    input: { endpoint: string; p256dh: string; auth: string; userAgent?: string; timezone?: string },
  ) {
    // Un meme endpoint peut deja exister si l'utilisateur s'etait deja
    // abonne (re-souscription silencieuse du navigateur) - on rafraichit
    // simplement les cles plutot que d'echouer sur la contrainte unique.
    await this.db
      .insert(pushSubscriptions)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: { userId, p256dh: input.p256dh, auth: input.auth, userAgent: input.userAgent, updatedAt: new Date() },
      });

    // Rention "zero configuration" : des le premier abonnement push, on active
    // automatiquement les duas du matin/soir et l'alerte "garde ta serie".
    await this.ensureDefaultSchedules(userId, input.timezone ?? "UTC");
    await this.sendWelcome(userId, input.endpoint);

    return { subscribed: true };
  }

  /**
   * Cree (si absent) le planning "dua du matin/du soir" actif par defaut avec
   * les horaires 07:00 / 19:00 ainsi que l'alerte "garde ta serie" a 20:00,
   * tous deux dans le fuseau horaire de l'utilisateur. `onConflictDoNothing`
   * rend la re-souscription idempotente (ne remet pas a zero des horaires
   * deja personnalises).
   */
  private async ensureDefaultSchedules(userId: string, timezone: string) {
    await this.db
      .insert(duaScheduleSettings)
      .values({ userId, timezone })
      .onConflictDoNothing({ target: duaScheduleSettings.userId });
    await this.db
      .insert(streakAlertSettings)
      .values({ userId, timeOfDay: "20:00", timezone, isActive: true })
      .onConflictDoNothing({ target: streakAlertSettings.userId });
  }

  /** Push de bienvenue immediat (localise via users.locale) qui prouve que la chaine fonctionne. */
  private async sendWelcome(userId: string, endpoint: string) {
    const [user] = await this.db.select({ locale: users.locale }).from(users).where(eq(users.id, userId)).limit(1);
    const [sub] = await this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).limit(1);
    if (!user || !sub) return;
    const locale = user.locale ?? "fr";
    await this.webPush.send(sub, { title: welcomeTitle(locale), body: welcomeBody(locale), url: "/" });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
    return { subscribed: false };
  }

  /**
   * Supprime tous les abonnements push de l'utilisateur. Utilisé par le
   * bouton "Désactiver" : sur iOS le navigateur peut avoir déjà supprimé
   * l'abonnement local (getSubscription() -> null) alors que la base dit
   * encore "abonné" - il faut donc forcer le nettoyage côté serveur.
   */
  async removeAll(userId: string) {
    await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    return { subscribed: false };
  }

  async isSubscribed(userId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId))
      .limit(1);
    return rows.length > 0;
  }
}
