import { Info, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTajweedToggle } from "./useTajweedToggle";
import { TAJWEED_RULES_ORDER, TAJWEED_RULE_COLOR_VAR } from "./TajweedText";

/**
 * Interrupteur "coloration tajwid" (ROADMAP.md 3.1) + legende des couleurs -
 * place a cote du selecteur de traduction/tafsir sur la page de sourate,
 * meme emplacement que ArabicFontSizeControl. Sans legende accessible, la
 * coloration serait un mur de couleurs illisible pour qui n'a pas deja
 * memorise un code couleur de mushaf.
 */
export function TajweedControl() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useTajweedToggle();

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant={enabled ? "secondary" : "outline"}
        size="sm"
        onClick={() => setEnabled(!enabled)}
      >
        <Palette className="h-4 w-4" />
        {enabled ? t("quran.tajweedOn") : t("quran.tajweedOff")}
      </Button>

      {enabled && (
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={t("quran.tajweedLegendTitle")}>
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("quran.tajweedLegendTitle")}
            </p>
            <ul className="space-y-1.5">
              {TAJWEED_RULES_ORDER.map((rule) => (
                <li key={rule} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: `hsl(var(${TAJWEED_RULE_COLOR_VAR[rule]}))` }}
                    aria-hidden="true"
                  />
                  {t(`quran.tajweedRules.${rule}`)}
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
