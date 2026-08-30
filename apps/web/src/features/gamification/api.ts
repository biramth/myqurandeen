import { apiClient } from "@/lib/api-client";
import type { GamificationEventType } from "@qurandeen/shared";

export interface StatCounters {
  versesRead: number;
  hadithsRead: number;
  duasRead: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  notesCreated: number;
  bookmarksAdded: number;
}

export interface AchievementEntry {
  key: string;
  icon: string;
  group: "streak" | "reading" | "learning" | "creation";
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface ProgressInfo {
  level: number;
  current: number;
  target: number;
}

export interface DailyGoal {
  count: number;
  target: number;
  complete: boolean;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  progress: ProgressInfo;
  stats: StatCounters;
  streak: { current: number; longest: number };
  dailyGoal: DailyGoal;
  achievements: AchievementEntry[];
}

export interface NewlyUnlocked {
  key: string;
  xpReward: number;
  icon: string;
}

export interface RecordEventResult {
  xpGained: number;
  xpTotal: number;
  level: number;
  leveledUp: boolean;
  progress: ProgressInfo;
  newlyUnlocked: NewlyUnlocked[];
  dailyGoal: DailyGoal;
}

export const gamificationApi = {
  profile: () => apiClient.get<GamificationProfile>("/gamification"),
  record: (type: GamificationEventType, input: { hour?: number; localDate?: string }) =>
    apiClient.post<RecordEventResult>("/gamification/events", { type, ...input }),
};