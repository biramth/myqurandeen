import * as React from "react";

const STORAGE_KEY = "qurandeen-tajweed-enabled";

/**
 * Reglage "coloration tajwid" (voir ROADMAP.md 3.1) - persiste et partage
 * entre la page de sourate et la page de verset isole, meme principe que
 * ArabicFontSizeProvider mais sans variable CSS globale : ce reglage ne
 * change qu'un rendu local (quel composant utiliser pour le texte arabe),
 * pas une propriete visuelle appliquee a tout `<html>`.
 */
export function useTajweedToggle(): [boolean, (next: boolean) => void] {
  const [enabled, setEnabledState] = React.useState<boolean>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false; // localStorage indisponible (navigation privee, permissions) - defaut desactive.
    }
  });

  const setEnabled = React.useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // Persistance best-effort - le reglage reste actif pour la session en cours.
    }
  }, []);

  return [enabled, setEnabled];
}
