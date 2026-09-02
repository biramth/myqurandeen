import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useArabicFontSize } from "./arabic-font-size-provider";

/**
 * Reglage de la taille du texte arabe (persiste, s'applique aussitot sur
 * toutes les pages de lecture - voir ArabicFontSizeProvider). Place sur la
 * page de sourate (la ou le besoin se fait le plus sentir) plutot que dans
 * un reglage de profil enfoui, cf. ROADMAP.md 1.4.
 */
export function ArabicFontSizeControl() {
  const { scale, canDecrease, canIncrease, decrease, increase } = useArabicFontSize();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-0.5 rounded-md border px-1" role="group" aria-label={t("quran.arabicFontSize")}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={decrease}
        disabled={!canDecrease}
        aria-label={t("quran.arabicFontDecrease")}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-9 text-center text-xs tabular-nums text-muted-foreground">{Math.round(scale * 100)}%</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={increase}
        disabled={!canIncrease}
        aria-label={t("quran.arabicFontIncrease")}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
