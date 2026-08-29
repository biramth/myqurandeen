import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { pushSubscriptions } from "../../database/schema";
import { WebPushProvider } from "./web-push.provider";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly webPush: WebPushProvider,
  ) {}

  health() {
    return { ready: this.webPush.isConfigured, vapidPublicKey: this.webPush.publicKey };
  }

  async subscribe(
    userId: string,
    input: { endpoint: string; p256dh: string; auth: string; userAgent?: string },
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
    return { subscribed: true };
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
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
