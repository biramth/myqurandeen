import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Bookmark,
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  HeartHandshake,
  MoonStar,
  PenLine,
  Sunrise,
  Target,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useGamificationStatus } from "./useGamification";
import type { AchievementEntry } from "./api";

const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  bookOpen: BookOpen,
  heartHandshake: HeartHandshake,
  sunrise: Sunrise,
  moonStar: MoonStar,
  graduationCap: GraduationCap,
  brain: Brain,
  penLine: PenLine,
  bookmark: Bookmark,
};

/**
 * Carte "Gamification" du profil : niveau + barre d'XP, objectif du jour et
 * grille des succès (débloqués / à débloquer). Masquée tant que le serveur
 * n'a pas encore la table (déploiement progressif).
 */
export function GamificationCard() {
  const { data, isLoading } = useGamificationStatus();
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = React.useState<AchievementEntry | null>(null);

  if (isLoading || !data) return null;

  const progressPct = Math.min(100, Math.round((data.progress.current / data.progress.target) * 100));
  const dailyPct = Math.min(100, Math.round((data.dailyGoal.count / data.dailyGoal.target) * 100));
  const unlockedCount = data.achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("gamification.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-primary/30 text-xl font-bold text-primary">
            {data.level}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t(`gamification.levels.${data.level}`)}</p>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("gamification.xpProgress", { current: data.progress.current, target: data.progress.target })}
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-medium">
              <Target className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {t("gamification.dailyGoal")}
            </span>
            <span className="text-muted-foreground">
              {t("gamification.dailyGoalProgress", { count: data.dailyGoal.count, target: data.dailyGoal.target })}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                data.dailyGoal.complete ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          {data.dailyGoal.complete && <p className="mt-1.5 text-xs font-medium text-emerald-600">{t("gamification.dailyGoalDone")}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">{t("gamification.achievementsTitle")}</p>
            <span className="text-xs text-muted-foreground">
              {t("gamification.achievementsCount", { current: unlockedCount, total: data.achievements.length })}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {data.achievements.map((achievement) => {
              const Icon = ICONS[achievement.icon] ?? Trophy;
              return (
                <button
                  key={achievement.key}
                  type="button"
                  onClick={() => setSelected(achievement)}
                  title={t(`gamification.achievements.${achievement.key}.name`, {
                    defaultValue: achievement.key,
                  })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border p-2 transition-colors",
                    achievement.unlocked
                      ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                      : "border-border text-muted-foreground/50 hover:bg-accent",
                  )}
                >
                  <Icon className={cn("h-5 w-5", !achievement.unlocked && "opacity-40")} aria-hidden="true" />
                  <span className="text-[10px] leading-tight">{t(`gamification.achievements.${achievement.key}.name`, { defaultValue: achievement.key })}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = ICONS[selected.icon] ?? Trophy;
                    return <Icon className="h-5 w-5 text-primary" aria-hidden="true" />;
                  })()}
                  {t(`gamification.achievements.${selected.key}.name`, { defaultValue: selected.key })}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {t(`gamification.achievements.${selected.key}.description`, { defaultValue: "" })}
                </p>
                <p className={cn("font-medium", selected.unlocked ? "text-primary" : "text-muted-foreground")}>
                  +{selected.xpReward} XP
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected.unlocked
                    ? t("gamification.unlockedAt", {
                        date: new Date(selected.unlockedAt!).toLocaleDateString(i18n.language),
                      })
                    : t("gamification.locked")}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}