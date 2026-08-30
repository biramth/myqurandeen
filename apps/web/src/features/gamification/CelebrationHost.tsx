import * as React from "react";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { celebrations } from "./celebrations";

/**
 * Monté une fois dans AppLayout : écoute les événements de célébration
 * émis par les hooks (streak, XP, nouveau niveau, succès débloqué) et les
 * traduit en confettis + toasts. n'affiche rien lui-même.
 */
export function CelebrationHost() {
  const { t } = useTranslation();

  React.useEffect(() => {
    return celebrations.subscribe((celebration) => {
      if (celebration.kind === "level") {
        confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 }, zIndex: 9999 });
        toast.success(
          t("gamification.levelUpToast", {
            level: celebration.level,
            title: celebration.levelTitle,
            defaultValue: "",
          }),
          { duration: 5000 },
        );
      } else if (celebration.kind === "achievement") {
        confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 }, zIndex: 9999 });
        const names = celebration.keys
          .map((key) => t(`gamification.achievements.${key}.name`, { defaultValue: key }))
          .join(", ");
        toast.success(t("gamification.achievementToast", { achievements: names, defaultValue: "" }), {
          duration: 5000,
        });
      } else if (celebration.kind === "streak") {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.85 },
          scalar: 0.7,
          zIndex: 9999,
        });
      }
    });
  }, [t]);

  return null;
}