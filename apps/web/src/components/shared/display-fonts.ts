export type DisplayFontKey = "inter" | "merriweather" | "poppins";

interface DisplayFontDef {
  labelKey: string;
  /** Classe utilitaire (`font-*`) utilisee pour previsualiser la police dans le menu. */
  previewClassName: string;
  /**
   * `null` pour la police par defaut (Inter) : deja la valeur de `--font-sans`
   * dans `index.css`, aucune surcharge necessaire.
   */
  stack: string | null;
}

/**
 * Polices d'affichage proposees pour le texte general du site (hors texte
 * arabe, deja reglable separement via ArabicFontSizeProvider). Chaque police
 * est importee statiquement dans index.css (@fontsource) : le @font-face ne
 * declenche un telechargement que si la police est effectivement utilisee,
 * donc aucun cout pour les visiteurs qui ne changent jamais ce reglage.
 */
export const DISPLAY_FONTS: Record<DisplayFontKey, DisplayFontDef> = {
  inter: { labelKey: "appearance.fontInter", previewClassName: "font-sans", stack: null },
  merriweather: {
    labelKey: "appearance.fontMerriweather",
    previewClassName: "font-merriweather",
    stack: '"Merriweather", Georgia, "Times New Roman", serif',
  },
  poppins: {
    labelKey: "appearance.fontPoppins",
    previewClassName: "font-poppins",
    stack: '"Poppins", "Segoe UI", system-ui, sans-serif',
  },
};

export const DISPLAY_FONT_KEYS = Object.keys(DISPLAY_FONTS) as DisplayFontKey[];
