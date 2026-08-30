import { Inject, Injectable } from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  userAchievements,
  userDailyActions,
  userGamification,
  userStats,
  userStreaks,
} from "../../database/schema";
import type { GamificationEventType } from "@qurandeen/shared";

/** Compteurs d'action cumulés renvoyés au client. */
export interface StatCounters {
  versesRead: number;
  hadithsRead: number;
  duasRead: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  notesCreated: number;
  bookmarksAdded: number;
}

export interface AchievementDef {
  key: string;
  xpReward: number;
  icon: string;
  group: "streak" | "reading" | "learning" | "creation";
  condition: (ctx: { stats: StatCounters; streak: { current: number; longest: number }; hour?: number }) => boolean;
}

/** XP rapporté par chaque type d'action (source de "peps" : lire = gagner). */
const EVENT_XP: Record<GamificationEventType, number> = {
  verse_read: 5,
  hadith_read: 3,
  dua_read: 2,
  lesson_completed: 25,
  quiz_completed: 15,
  note_created: 10,
  bookmark_added: 5,
};

const STAT_DEFAULT: StatCounters = {
  versesRead: 0,
  hadithsRead: 0,
  duasRead: 0,
  lessonsCompleted: 0,
  quizzesCompleted: 0,
  notesCreated: 0,
  bookmarksAdded: 0,
};

/**
 * Seuils d'XP cumulée pour chaque niveau (un "débutant" monte vite au début,
 * le rythme ralentit ensuite pour donner un objectif à moyen terme).
 */
const LEVEL_THRESHOLDS = [0, 60, 160, 320, 560, 900, 1350, 1900, 2550, 3300, 4150, 5100, 6150, 7300, 8550, 9900];

const streak = (c: { current: number; longest: number }) => Math.max(c.current, c.longest);

/**
 * Registre central des succès : les conditions sont évaluées côté serveur à
 * chaque événement (jamais directement déclarées débloquées par le client).
 * Les textes (nom/description) et les seuils de condition sont alignés avec
 * `gamification.achievements.<key>` dans les locales frontend.
 */
const ACHIEVEMENTS: AchievementDef[] = [
  { key: "streak_3", xpReward: 30, icon: "flame", group: "streak", condition: (c) => streak(c.streak) >= 3 },
  { key: "streak_7", xpReward: 80, icon: "flame", group: "streak", condition: (c) => streak(c.streak) >= 7 },
  { key: "streak_30", xpReward: 300, icon: "flame", group: "streak", condition: (c) => streak(c.streak) >= 30 },
  { key: "streak_100", xpReward: 1200, icon: "flame", group: "streak", condition: (c) => streak(c.streak) >= 100 },
  { key: "verses_10", xpReward: 20, icon: "bookOpen", group: "reading", condition: (c) => c.stats.versesRead >= 10 },
  { key: "verses_50", xpReward: 60, icon: "bookOpen", group: "reading", condition: (c) => c.stats.versesRead >= 50 },
  { key: "verses_250", xpReward: 150, icon: "bookOpen", group: "reading", condition: (c) => c.stats.versesRead >= 250 },
  { key: "verses_1000", xpReward: 400, icon: "bookOpen", group: "reading", condition: (c) => c.stats.versesRead >= 1000 },
  { key: "hadiths_25", xpReward: 40, icon: "heartHandshake", group: "reading", condition: (c) => c.stats.hadithsRead >= 25 },
  { key: "duas_25", xpReward: 40, icon: "heartHandshake", group: "reading", condition: (c) => c.stats.duasRead >= 25 },
  { key: "early_bird", xpReward: 50, icon: "sunrise", group: "reading", condition: (c) => c.hour !== undefined && c.hour < 6 },
  { key: "night_reader", xpReward: 50, icon: "moonStar", group: "reading", condition: (c) => c.hour !== undefined && (c.hour >= 22 || c.hour < 4) },
  { key: "lessons_1", xpReward: 20, icon: "graduationCap", group: "learning", condition: (c) => c.stats.lessonsCompleted >= 1 },
  { key: "lessons_10", xpReward: 100, icon: "graduationCap", group: "learning", condition: (c) => c.stats.lessonsCompleted >= 10 },
  { key: "lessons_25", xpReward: 250, icon: "graduationCap", group: "learning", condition: (c) => c.stats.lessonsCompleted >= 25 },
  { key: "quiz_10", xpReward: 120, icon: "brain", group: "learning", condition: (c) => c.stats.quizzesCompleted >= 10 },
  { key: "notes_5", xpReward: 30, icon: "penLine", group: "creation", condition: (c) => c.stats.notesCreated >= 5 },
  { key: "notes_20", xpReward: 120, icon: "penLine", group: "creation", condition: (c) => c.stats.notesCreated >= 20 },
  { key: "bookmarks_10", xpReward: 30, icon: "bookmark", group: "creation", condition: (c) => c.stats.bookmarksAdded >= 10 },
];

/** Objectif du jour : nombre d'actions significatives à faire pour "compléter" sa journée. */
const DAILY_GOAL_TARGET = 5;

function levelFor(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

function levelInfo(xp: number) {
  const level = levelFor(xp);
  const levelBase = LEVEL_THRESHOLDS[level - 1];
  const nextLevelBase = LEVEL_THRESHOLDS[level] ?? levelBase;
  return {
    level,
    current: xp - levelBase,
    target: Math.max(nextLevelBase - levelBase, 1),
  };
}

/** Date calendaire "murale" UTC (fallback : le client envoie sa date locale quand c'est pertinent). */
function serverDateKey(at: Date = new Date()): string {
  return at.toISOString().slice(0, 10);
}

@Injectable()
export class GamificationService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /**
   * Enregistre une action significative : incrémente le compteur et l'objectif
   * du jour, ajoute l'XP, débloque les succès atteints (et leur bonus d'XP).
   * Tout se passe dans une transaction pour rester cohérent.
   */
  async recordEvent(
    userId: string,
    type: GamificationEventType,
    input: { hour?: number; localDate?: string } = {},
  ) {
    const dateKey = input.localDate ?? serverDateKey();
    const xpGain = EVENT_XP[type];

    const result = await this.db.transaction(async (tx) => {
      // Compteur d'action (incrément SQL, jamais de lecture-modification-écriture).
      switch (type) {
        case "verse_read":
          await tx.insert(userStats).values({ userId, versesRead: 1 }).onConflictDoUpdate({
            target: userStats.userId,
            set: { versesRead: sql`${userStats.versesRead} + 1`, updatedAt: new Date() },
          });
          break;
        case "hadith_read":
          await tx.insert(userStats).values({ userId, hadithsRead: 1 }).onConflictDoUpdate({
            target: userStats.userId,
            set: { hadithsRead: sql`${userStats.hadithsRead} + 1`, updatedAt: new Date() },
          });
          break;
        case "dua_read":
          await tx.insert(userStats).values({ userId, duasRead: 1 }).onConflictDoUpdate({
            target: userStats.userId,
            set: { duasRead: sql`${userStats.duasRead} + 1`, updatedAt: new Date() },
          });
          break;
        case "lesson_completed":
          await tx.insert(userStats).values({ userId, lessonsCompleted: 1 }).onConflictDoUpdate({
            target: userStats.userId,
            set: { lessonsCompleted: sql`${userStats.lessonsCompleted} + 1`, updatedAt: new Date() },
          });
          break;
        case "quiz_completed":
          await tx.insert(userStats).values({ userId, quizzesCompleted: 1 }).onConflictDoUpdate({
            target: userStats.userId,
            set: { quizzesCompleted: sql`${userStats.quizzesCompleted} + 1`, updatedAt: new Date() },
          });
          break;
        case "note_created":
          await tx.insert(userStats).values({ userId, notesCreated: 1 }).onConflictDoUpdate({
            target: userStats.userId,
            set: { notesCreated: sql`${userStats.notesCreated} + 1`, updatedAt: new Date() },
          });
          break;
        case "bookmark_added":
          await tx.insert(userStats).values({ userId, bookmarksAdded: 1 }).onConflictDoUpdate({
            target: userStats.userId,
            set: { bookmarksAdded: sql`${userStats.bookmarksAdded} + 1`, updatedAt: new Date() },
          });
          break;
      }

      // Objectif du jour.
      await tx.insert(userDailyActions).values({ userId, dateKey, count: 1 }).onConflictDoUpdate({
        target: [userDailyActions.userId, userDailyActions.dateKey],
        set: { count: sql`${userDailyActions.count} + 1` },
      });

      // XP de l'action.
      await tx.insert(userGamification).values({ userId, xp: xpGain }).onConflictDoUpdate({
        target: userGamification.userId,
        set: { xp: sql`${userGamification.xp} + ${xpGain}`, updatedAt: new Date() },
      });

      const [progressRow] = await tx.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
      const prevLevel = progressRow?.level ?? 1;
      let xpTotal = progressRow?.xp ?? xpGain;
      let level = levelFor(xpTotal);

      // Succès : évaluation post-incrément.
      const unlockedRows = await tx
        .select({ key: userAchievements.key })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));
      const unlockedSet = new Set(unlockedRows.map((r) => r.key));

      const [statsRow] = await tx.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
      const stats: StatCounters = statsRow
        ? {
            versesRead: statsRow.versesRead,
            hadithsRead: statsRow.hadithsRead,
            duasRead: statsRow.duasRead,
            lessonsCompleted: statsRow.lessonsCompleted,
            quizzesCompleted: statsRow.quizzesCompleted,
            notesCreated: statsRow.notesCreated,
            bookmarksAdded: statsRow.bookmarksAdded,
          }
        : { ...STAT_DEFAULT };

      const [streakRow] = await tx
        .select({ current: userStreaks.currentStreak, longest: userStreaks.longestStreak })
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1);

      const newlyUnlocked: AchievementDef[] = [];
      for (const def of ACHIEVEMENTS) {
        if (unlockedSet.has(def.key)) continue;
        if (!def.condition({ stats, streak: { current: streakRow?.current ?? 0, longest: streakRow?.longest ?? 0 }, hour: input.hour })) {
          continue;
        }
        newlyUnlocked.push(def);
        await tx.insert(userAchievements).values({ userId, key: def.key });
      }

      // Bonus d'XP des succès fraîchement débloqués.
      let rewardXp = 0;
      if (newlyUnlocked.length > 0) {
        rewardXp = newlyUnlocked.reduce((sum, d) => sum + d.xpReward, 0);
        await tx
          .update(userGamification)
          .set({ xp: sql`${userGamification.xp} + ${rewardXp}`, updatedAt: new Date() })
          .where(eq(userGamification.userId, userId));
        xpTotal += rewardXp;
        level = levelFor(xpTotal);
      }

      if (level !== prevLevel) {
        await tx.update(userGamification).set({ level, updatedAt: new Date() }).where(eq(userGamification.userId, userId));
      }

      const [todayRow] = await tx
        .select({ count: userDailyActions.count })
        .from(userDailyActions)
        .where(and(eq(userDailyActions.userId, userId), eq(userDailyActions.dateKey, dateKey)))
        .limit(1);

      const progress = levelInfo(xpTotal);
      return {
        xpGained: xpGain + rewardXp,
        xpTotal,
        level,
        leveledUp: level > prevLevel,
        progress,
        newlyUnlocked: newlyUnlocked.map((d) => ({ key: d.key, xpReward: d.xpReward, icon: d.icon })),
        dailyGoal: { count: todayRow?.count ?? 1, target: DAILY_GOAL_TARGET, complete: (todayRow?.count ?? 1) >= DAILY_GOAL_TARGET },
      };
    });

    return result;
  }

  /** État complet du profil gamification d'un utilisateur (carte du profil + succès). */
  async getProfile(userId: string, localDate?: string) {
    const dateKey = localDate ?? serverDateKey();

    const [progressRow] = await this.db.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
    const [statsRow] = await this.db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
    const [streakRow] = await this.db
      .select({ current: userStreaks.currentStreak, longest: userStreaks.longestStreak })
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);
    const unlockedRows = await this.db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
    const unlockedByKey = new Map(unlockedRows.map((r) => [r.key, r.unlockedAt]));
    const [todayRow] = await this.db
      .select({ count: userDailyActions.count })
      .from(userDailyActions)
      .where(and(eq(userDailyActions.userId, userId), eq(userDailyActions.dateKey, dateKey)))
      .limit(1);

    const xp = progressRow?.xp ?? 0;
    const level = progressRow?.level ?? 1;
    const stats: StatCounters = statsRow
      ? {
          versesRead: statsRow.versesRead,
          hadithsRead: statsRow.hadithsRead,
          duasRead: statsRow.duasRead,
          lessonsCompleted: statsRow.lessonsCompleted,
          quizzesCompleted: statsRow.quizzesCompleted,
          notesCreated: statsRow.notesCreated,
          bookmarksAdded: statsRow.bookmarksAdded,
        }
      : { ...STAT_DEFAULT };

    return {
      xp,
      level,
      progress: levelInfo(xp),
      stats,
      streak: { current: streakRow?.current ?? 0, longest: streakRow?.longest ?? 0 },
      dailyGoal: { count: todayRow?.count ?? 0, target: DAILY_GOAL_TARGET, complete: (todayRow?.count ?? 0) >= DAILY_GOAL_TARGET },
      achievements: ACHIEVEMENTS.map((def) => ({
        key: def.key,
        icon: def.icon,
        group: def.group,
        xpReward: def.xpReward,
        unlocked: unlockedByKey.has(def.key),
        unlockedAt: unlockedByKey.get(def.key)?.toISOString() ?? null,
      })),
    };
  }
}