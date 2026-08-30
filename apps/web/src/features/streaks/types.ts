export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeToday: boolean;
}
