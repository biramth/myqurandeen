import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useStreakStatus } from "./useStreak";

/** Carte "serie d'activite" affichee en haut du profil : grande etoile + jours d'affilee + record + message adapte a l'etat. */
export function StreakCard() {
  const { data, isLoading } = useStreakStatus();
  const { t } = useTranslation();

  if (isLoading || !data) return null;

  const { currentStreak, longestStreak, activeToday } = data;
  const message =
    currentStreak === 0
      ? t("streak.startMessage")
      : activeToday
        ? t("streak.activeTodayMessage")
        : t("streak.reminderMessage");

  return (
    <Card className="mt-4">
      <CardContent className="flex items-center gap-4 py-5">
        <Star
          className={cn(
            "h-10 w-10 shrink-0",
            currentStreak > 0
              ? cn("text-amber-500", activeToday && "drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]")
              : "text-muted-foreground/40",
          )}
          fill={currentStreak > 0 ? "currentColor" : "none"}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight">{t("streak.days", { count: currentStreak })}</p>
          {longestStreak > 0 && (
            <p className="text-xs text-muted-foreground">{t("streak.longest", { count: longestStreak })}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
