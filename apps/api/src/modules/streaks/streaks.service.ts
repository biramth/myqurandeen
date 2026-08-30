import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { userStreaks } from "../../database/schema";

export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeToday: boolean;
}

const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Date calendaire (YYYY-MM-DD) : celle fournie par le client si valide, sinon repli sur la date UTC serveur. */
function resolveDate(localDate?: string): string {
  if (localDate && LOCAL_DATE_RE.test(localDate)) return localDate;
  return new Date().toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates YYYY-MM-DD (b - a), toutes deux interpretees a minuit UTC. */
function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / msPerDay);
}

/**
 * Serie de jours consecutifs d'activite ("streak"/flamme). N'est jamais
 * incrementable directement par le client : recordActivity() est appelee en
 * effet de bord d'actions significatives deja authentifiees et validees
 * ailleurs (lecon terminee, note creee, favori ajoute...) ou via le ping de
 * lecture de contenu (POST /streaks/ping), idempotent par jour calendaire
 * local - appeler plusieurs fois le meme jour ne change rien.
 */
@Injectable()
export class StreaksService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getStreak(userId: string, localDate?: string): Promise<StreakStatus> {
    const row = await this.db.query.userStreaks.findFirst({ where: eq(userStreaks.userId, userId) });
    if (!row) {
      return { currentStreak: 0, longestStreak: 0, lastActiveDate: null, activeToday: false };
    }
    const today = resolveDate(localDate);
    return {
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      lastActiveDate: row.lastActiveDate,
      activeToday: row.lastActiveDate === today,
    };
  }

  async recordActivity(userId: string, localDate?: string): Promise<StreakStatus> {
    const today = resolveDate(localDate);
    const existing = await this.db.query.userStreaks.findFirst({ where: eq(userStreaks.userId, userId) });

    if (!existing) {
      await this.db.insert(userStreaks).values({ userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today });
      return { currentStreak: 1, longestStreak: 1, lastActiveDate: today, activeToday: true };
    }

    if (existing.lastActiveDate === today) {
      return {
        currentStreak: existing.currentStreak,
        longestStreak: existing.longestStreak,
        lastActiveDate: existing.lastActiveDate,
        activeToday: true,
      };
    }

    const gap = existing.lastActiveDate ? daysBetween(existing.lastActiveDate, today) : null;

    // Decalage d'horloge / fuseau horaire cote client faisant apparaitre
    // "aujourd'hui" comme anterieur a la derniere date enregistree : on ne
    // touche a rien plutot que de risquer de casser la serie a tort.
    if (gap !== null && gap < 0) {
      return {
        currentStreak: existing.currentStreak,
        longestStreak: existing.longestStreak,
        lastActiveDate: existing.lastActiveDate,
        activeToday: true,
      };
    }

    const nextStreak = gap === 1 ? existing.currentStreak + 1 : 1;
    const nextLongest = Math.max(existing.longestStreak, nextStreak);

    await this.db
      .update(userStreaks)
      .set({ currentStreak: nextStreak, longestStreak: nextLongest, lastActiveDate: today })
      .where(eq(userStreaks.userId, userId));

    return { currentStreak: nextStreak, longestStreak: nextLongest, lastActiveDate: today, activeToday: true };
  }
}
