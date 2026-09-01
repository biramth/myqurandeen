/**
 * Le texte source (Tanzil, script outhmani) concatene la basmala directement
 * dans le verset 1 de chaque sourate, SAUF At-Tawba (#9, qui n'en comporte
 * pas) et Al-Fatiha (#1, ou la basmala EST le verset 1 lui-meme - a ne
 * surtout pas separer). Cette fonction isole les 4 premiers mots (separes
 * par des espaces) plutot que de comparer a un texte fige : les diacritiques
 * outhmani de la basmala varient legerement d'une sourate a l'autre (ex.
 * sourates 95 et 97, qui portent un chadda supplementaire), une comparaison
 * de chaine exacte echouerait sur ces cas.
 */
const BASMALA_WORD_COUNT = 4;

export interface SplitBasmalaResult {
  /** La basmala isolee, a afficher separement - null si ce verset n'en comporte pas. */
  basmala: string | null;
  /** Le texte du verset, basmala retiree. */
  text: string;
}

export function splitBasmala(surahNumber: number, numberInSurah: number, textArabic: string): SplitBasmalaResult {
  if (numberInSurah !== 1 || surahNumber === 1 || surahNumber === 9) {
    return { basmala: null, text: textArabic };
  }
  const words = textArabic.trim().split(/\s+/);
  if (words.length <= BASMALA_WORD_COUNT) return { basmala: null, text: textArabic };
  return {
    basmala: words.slice(0, BASMALA_WORD_COUNT).join(" "),
    text: words.slice(BASMALA_WORD_COUNT).join(" "),
  };
}
