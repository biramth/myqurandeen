export type AccentColorKey =
  | "teal"
  | "emerald"
  | "azure"
  | "indigo"
  | "violet"
  | "rose"
  | "amber"
  | "terracotta"
  | "slate";

interface AccentVars {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
}

interface AccentColorDef {
  labelKey: string;
  /** Teinte HSL representative (pour l'echantillon de couleur affiche dans le menu). */
  swatch: string;
  /**
   * `null` pour la couleur par defaut (sarcelle) : les valeurs de `index.css`
   * (`:root`/`.dark`) s'appliquent deja nativement, aucune surcharge CSS
   * n'est necessaire - evite de dupliquer ces valeurs a deux endroits.
   */
  light: AccentVars | null;
  dark: AccentVars | null;
}

function makeVars(hue: number, lightL: number, lightS: number, darkS: number, darkL: number): { light: AccentVars; dark: AccentVars } {
  return {
    light: {
      primary: `${hue} ${lightS}% ${lightL}%`,
      primaryForeground: "0 0% 100%",
      accent: `${hue} 45% 94%`,
      accentForeground: `${hue} 60% 20%`,
      ring: `${hue} ${lightS}% ${lightL}%`,
    },
    dark: {
      primary: `${hue} ${darkS}% ${darkL}%`,
      primaryForeground: "222 25% 8%",
      accent: `${hue} 30% 18%`,
      accentForeground: `${hue} 45% 80%`,
      ring: `${hue} ${darkS}% ${darkL}%`,
    },
  };
}

/**
 * Palette d'accents proposee a la personnalisation (Header > PersonalizationMenu).
 * "teal" est la couleur par defaut du site (voir index.css) - la seule entree
 * sans surcharge, les 8 autres redefinissent primary/accent/ring en gardant
 * la meme structure de palette (secondary/muted restent neutres).
 */
export const ACCENT_COLORS: Record<AccentColorKey, AccentColorDef> = {
  teal: { labelKey: "appearance.accentTeal", swatch: "175 60% 28%", light: null, dark: null },
  emerald: { labelKey: "appearance.accentEmerald", swatch: "150 60% 28%", ...makeVars(150, 28, 60, 45, 55) },
  azure: { labelKey: "appearance.accentAzure", swatch: "205 65% 32%", ...makeVars(205, 32, 65, 50, 58) },
  indigo: { labelKey: "appearance.accentIndigo", swatch: "243 55% 45%", ...makeVars(243, 45, 55, 50, 65) },
  violet: { labelKey: "appearance.accentViolet", swatch: "265 55% 42%", ...makeVars(265, 42, 55, 50, 65) },
  rose: { labelKey: "appearance.accentRose", swatch: "345 60% 42%", ...makeVars(345, 42, 60, 50, 65) },
  amber: { labelKey: "appearance.accentAmber", swatch: "38 75% 38%", ...makeVars(38, 38, 75, 70, 55) },
  terracotta: { labelKey: "appearance.accentTerracotta", swatch: "18 55% 38%", ...makeVars(18, 38, 55, 50, 58) },
  slate: { labelKey: "appearance.accentSlate", swatch: "215 20% 32%", ...makeVars(215, 32, 20, 15, 58) },
};

export const ACCENT_COLOR_KEYS = Object.keys(ACCENT_COLORS) as AccentColorKey[];
