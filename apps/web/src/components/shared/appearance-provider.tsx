import * as React from "react";
import { useTheme } from "@/components/shared/theme-provider";
import { ACCENT_COLORS, type AccentColorKey } from "@/components/shared/accent-colors";
import { DISPLAY_FONTS, type DisplayFontKey } from "@/components/shared/display-fonts";

const STORAGE_KEY = "qurandeen-appearance";

interface AppearanceState {
  accentColor: AccentColorKey;
  backgroundPattern: boolean;
  decorativeBorders: boolean;
  displayFont: DisplayFontKey;
}

const DEFAULT_STATE: AppearanceState = {
  accentColor: "teal",
  backgroundPattern: false,
  decorativeBorders: false,
  displayFont: "inter",
};

function isAccentColorKey(value: unknown): value is AccentColorKey {
  return typeof value === "string" && value in ACCENT_COLORS;
}

function isDisplayFontKey(value: unknown): value is DisplayFontKey {
  return typeof value === "string" && value in DISPLAY_FONTS;
}

function loadInitialState(): AppearanceState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppearanceState>;
    return {
      accentColor: isAccentColorKey(parsed.accentColor) ? parsed.accentColor : DEFAULT_STATE.accentColor,
      backgroundPattern: typeof parsed.backgroundPattern === "boolean" ? parsed.backgroundPattern : DEFAULT_STATE.backgroundPattern,
      decorativeBorders: typeof parsed.decorativeBorders === "boolean" ? parsed.decorativeBorders : DEFAULT_STATE.decorativeBorders,
      displayFont: isDisplayFontKey(parsed.displayFont) ? parsed.displayFont : DEFAULT_STATE.displayFont,
    };
  } catch {
    // JSON invalide (edition manuelle, ancienne version) - repart des reglages par defaut.
    return DEFAULT_STATE;
  }
}

interface AppearanceContextValue extends AppearanceState {
  setAccentColor: (key: AccentColorKey) => void;
  setBackgroundPattern: (value: boolean) => void;
  setDecorativeBorders: (value: boolean) => void;
  setDisplayFont: (key: DisplayFontKey) => void;
  resetAppearance: () => void;
}

const AppearanceContext = React.createContext<AppearanceContextValue | undefined>(undefined);

/**
 * Personnalisation visuelle du site (couleur d'accent, motif de fond, cadres
 * decoratifs, police d'affichage) - purement cote client (localStorage),
 * meme pattern que ThemeProvider/ArabicFontSizeProvider : aucun compte requis,
 * aucune donnee envoyee au serveur. Doit etre monte a l'interieur de
 * ThemeProvider (lit `useTheme()` pour savoir quelle variante clair/sombre
 * de la couleur d'accent appliquer).
 */
export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [state, setState] = React.useState<AppearanceState>(loadInitialState);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  React.useEffect(() => {
    const root = document.documentElement;
    const accent = ACCENT_COLORS[state.accentColor];
    const vars = theme === "dark" ? accent.dark : accent.light;
    const properties: Record<string, string | null> = vars
      ? {
          "--primary": vars.primary,
          "--primary-foreground": vars.primaryForeground,
          "--accent": vars.accent,
          "--accent-foreground": vars.accentForeground,
          "--ring": vars.ring,
        }
      : { "--primary": null, "--primary-foreground": null, "--accent": null, "--accent-foreground": null, "--ring": null };
    for (const [property, value] of Object.entries(properties)) {
      if (value) root.style.setProperty(property, value);
      else root.style.removeProperty(property);
    }
  }, [state.accentColor, theme]);

  React.useEffect(() => {
    const stack = DISPLAY_FONTS[state.displayFont].stack;
    if (stack) document.documentElement.style.setProperty("--font-sans", stack);
    else document.documentElement.style.removeProperty("--font-sans");
  }, [state.displayFont]);

  const value = React.useMemo<AppearanceContextValue>(
    () => ({
      ...state,
      setAccentColor: (accentColor) => setState((prev) => ({ ...prev, accentColor })),
      setBackgroundPattern: (backgroundPattern) => setState((prev) => ({ ...prev, backgroundPattern })),
      setDecorativeBorders: (decorativeBorders) => setState((prev) => ({ ...prev, decorativeBorders })),
      setDisplayFont: (displayFont) => setState((prev) => ({ ...prev, displayFont })),
      resetAppearance: () => setState(DEFAULT_STATE),
    }),
    [state],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const ctx = React.useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance doit etre utilise dans AppearanceProvider");
  return ctx;
}
