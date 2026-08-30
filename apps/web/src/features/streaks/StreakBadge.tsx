import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreakStatus } from "./useStreak";

/**
 * Pastille "serie d'activite" affichee dans l'en-tete : etoile pleine et
 * doree (avec un leger halo) quand l'utilisateur a deja ete actif
 * aujourd'hui, etoile en contour terne sinon (rappel discret) - masquee tant
 * qu'aucune serie n'a demarre pour ne pas relancer un nouvel utilisateur.
 */
export function StreakBadge() {
  const { data } = useStreakStatus();
  const { t } = useTranslation();

  if (!data || data.currentStreak <= 0) return null;

  return (
    <Link
      to="/profile"
      aria-label={t("streak.badgeLabel", { count: data.currentStreak })}
      title={t("streak.badgeLabel", { count: data.currentStreak })}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-semibold transition-colors",
        data.activeToday
          ? "border-amber-400/50 bg-amber-400/10 text-amber-600 dark:text-amber-300"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      <Star
        className={cn("h-4 w-4", data.activeToday && "drop-shadow-[0_0_4px_rgba(251,191,36,0.7)]")}
        fill={data.activeToday ? "currentColor" : "none"}
        aria-hidden="true"
      />
      {data.currentStreak}
    </Link>
  );
}
