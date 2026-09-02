import * as React from "react";

/**
 * Paliers de taille disponibles (multiplicateur applique aux tailles de base
 * de chaque page de lecture, voir `arabicFontSizeStyle()`). 5 paliers assez
 * espaces pour etre perceptibles sans aller jusqu'a un slider continu -
 * inutile pour ce besoin (cf. ROADMAP.md, 1.4).
 */
const SCALE_STEPS = [0.85, 1, 1.15, 1.3, 1.5] as const;
const DEFAULT_SCALE_INDEX = 1; // 1.0 = taille actuelle inchangee

const STORAGE_KEY = "qurandeen-arabic-font-scale";
const CSS_VARIABLE = "--arabic-font-scale";

/**
 * Calcule la valeur CSS `font-size` a appliquer sur un element de lecture
 * Arabe, a partir de sa taille de base actuelle (en rem) et de l'echelle
 * globale courante (lue via la variable CSS `--arabic-font-scale`, posee sur
 * `<html>` par `ArabicFontSizeProvider`). Chaque page garde ainsi sa propre
 * proportion (verset isole plus grand qu'une liste de versets, par exemple)
 * tout en suivant le meme reglage global.
 */
export function arabicFontSizeStyle(baseRem: number): React.CSSProperties {
  return { fontSize: `calc(${baseRem}rem * var(${CSS_VARIABLE}, 1))` };
}

function getInitialIndex(): number {
  if (typeof window === "undefined") return DEFAULT_SCALE_INDEX;
  const stored = Number(window.localStorage.getItem(STORAGE_KEY));
  const index = SCALE_STEPS.indexOf(stored as (typeof SCALE_STEPS)[number]);
  return index >= 0 ? index : DEFAULT_SCALE_INDEX;
}

interface ArabicFontSizeContextValue {
  scale: number;
  canDecrease: boolean;
  canIncrease: boolean;
  decrease: () => void;
  increase: () => void;
}

const ArabicFontSizeContext = React.createContext<ArabicFontSizeContextValue | undefined>(undefined);

/**
 * Reglage global (persiste, applique des le chargement) de la taille du
 * texte arabe sur les pages de lecture (sourate, verset isole, resultats de
 * recherche, hadith). Meme pattern que ThemeProvider : une variable CSS
 * posee sur `<html>`, lue par les elements concernes via
 * `arabicFontSizeStyle()` plutot que par une classe Tailwind globale - une
 * classe partagee `font-arabic` sert aussi a des libelles courts (noms de
 * savants, etc.) qui ne doivent pas grossir avec ce reglage.
 */
export function ArabicFontSizeProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = React.useState<number>(getInitialIndex);
  const scale = SCALE_STEPS[index];

  React.useEffect(() => {
    document.documentElement.style.setProperty(CSS_VARIABLE, String(scale));
    window.localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scale]);

  const decrease = React.useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const increase = React.useCallback(() => setIndex((i) => Math.min(SCALE_STEPS.length - 1, i + 1)), []);

  const value = React.useMemo<ArabicFontSizeContextValue>(
    () => ({ scale, canDecrease: index > 0, canIncrease: index < SCALE_STEPS.length - 1, decrease, increase }),
    [scale, index, decrease, increase],
  );

  return <ArabicFontSizeContext.Provider value={value}>{children}</ArabicFontSizeContext.Provider>;
}

export function useArabicFontSize(): ArabicFontSizeContextValue {
  const ctx = React.useContext(ArabicFontSizeContext);
  if (!ctx) throw new Error("useArabicFontSize doit etre utilise dans ArabicFontSizeProvider");
  return ctx;
}
