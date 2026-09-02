import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { celebrations } from "./celebrations";

// canvas-confetti (~7 Ko gzip) charge a la demande : ce host est monte une
// fois dans AppLayout, donc sur chaque page, mais la grande majorite des
// visites ne declenchent jamais de celebration - inutile d'alourdir le
// bundle initial de toutes les pages pour ca. `confettiPromise` memorise
// l'import pour ne le declencher qu'une fois meme si plusieurs celebrations
// arrivent avant qu'il soit resolu.
type ConfettiFn = (options?: import("canvas-confetti").Options) => Promise<undefined> | null;

let confettiPromise: Promise<ConfettiFn> | null = null;
function loadConfetti(): Promise<ConfettiFn> {
  if (!confettiPromise) {
    // Le typage CJS "export =" de canvas-confetti ne fait pas apparaitre
    // `.default` sur le type d'un import() dynamique (contrairement a
    // l'import statique, qui beneficie de esModuleInterop) - le module
    // reste bien accessible tel quel a l'execution, juste mal type ici :
    // on gere les deux formes possibles plutot que de forcer un `.default`
    // qui pourrait etre absent selon le bundler.
    confettiPromise = import("canvas-confetti").then((mod) => {
      const candidate = mod as unknown as { default?: ConfettiFn } & ConfettiFn;
      return candidate.default ?? candidate;
    });
  }
  return confettiPromise;
}

/**
 * Monté une fois dans AppLayout : écoute les événements de célébration
 * émis par les hooks (streak, XP, nouveau niveau, succès débloqué) et les
 * traduit en confettis + toasts. n'affiche rien lui-même.
 */
export function CelebrationHost() {
  const { t } = useTranslation();

  React.useEffect(() => {
    return celebrations.subscribe(async (celebration) => {
      const confetti = await loadConfetti();
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