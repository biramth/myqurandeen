import { useTranslation } from "react-i18next";
import { Check, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppearance } from "@/components/shared/appearance-provider";
import { ACCENT_COLOR_KEYS, ACCENT_COLORS } from "@/components/shared/accent-colors";
import { DISPLAY_FONT_KEYS, DISPLAY_FONTS } from "@/components/shared/display-fonts";
import { cn } from "@/lib/utils";

/**
 * Menu de personnalisation visuelle (couleur d'accent, motif de fond, cadres
 * decoratifs, police d'affichage) - accessible sans compte, a cote du
 * ThemeToggle. Voir AppearanceProvider pour la persistance (localStorage).
 */
export function PersonalizationMenu() {
  const { t } = useTranslation();
  const {
    accentColor,
    setAccentColor,
    backgroundPattern,
    setBackgroundPattern,
    decorativeBorders,
    setDecorativeBorders,
    displayFont,
    setDisplayFont,
    resetAppearance,
  } = useAppearance();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("appearance.menuLabel")}>
          <Palette className="h-5 w-5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{t("appearance.menuLabel")}</p>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={resetAppearance}>
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            {t("appearance.reset")}
          </Button>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t("appearance.accentColor")}</p>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLOR_KEYS.map((key) => {
              const def = ACCENT_COLORS[key];
              const active = key === accentColor;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAccentColor(key)}
                  aria-label={t(def.labelKey)}
                  aria-pressed={active}
                  title={t(def.labelKey)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 ring-offset-popover transition-transform hover:scale-105",
                    active && "ring-2 ring-foreground",
                  )}
                  style={{ backgroundColor: `hsl(${def.swatch})` }}
                >
                  {active && <Check className="h-4 w-4 text-white drop-shadow" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setBackgroundPattern(!backgroundPattern)}
            aria-pressed={backgroundPattern}
            className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-sm hover:bg-accent"
          >
            <span>{t("appearance.backgroundPattern")}</span>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                backgroundPattern && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {backgroundPattern && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDecorativeBorders(!decorativeBorders)}
            aria-pressed={decorativeBorders}
            className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-sm hover:bg-accent"
          >
            <span>{t("appearance.decorativeBorders")}</span>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                decorativeBorders && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {decorativeBorders && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
          </button>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t("appearance.displayFont")}</p>
          <div className="space-y-1">
            {DISPLAY_FONT_KEYS.map((key) => {
              const def = DISPLAY_FONTS[key];
              const active = key === displayFont;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDisplayFont(key)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-3 py-1.5 text-sm hover:bg-accent",
                    def.previewClassName,
                    active && "border-primary bg-primary/5",
                  )}
                >
                  <span>{t(def.labelKey)}</span>
                  {active && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
