import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { useGamificationStatus } from "./useGamification";

/**
 * Pastille "niveau" affichee dans l'en-tete a cote du streak : le numéro de
 * niveau lie a /profile. Masquee tant que l'utilisateur n'a aucun XP (ou si
 * le backend n'est pas encore deploye avec la table gamification).
 */
export function LevelBadge() {
  const { data, isLoading, isError } = useGamificationStatus();
  const { t } = useTranslation();

  if (isLoading || isError || !data || data.xp <= 0) return null;

  return (
    <Link
      to="/profile"
      aria-label={t("gamification.level", { level: data.level })}
      title={`${t("gamification.level", { level: data.level })} · ${t(`gamification.levels.${data.level}`)}`}
      className="inline-flex items-center gap-1 rounded-full border bg-primary/5 px-2.5 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      {data.level}
    </Link>
  );
}