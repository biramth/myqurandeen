/**
 * Les 28 lettres de l'alphabet arabe (+ la hamza, traitee a part comme dans
 * la plupart des methodes de lecture). Un seul caractere de base par lettre
 * suffit : les formes isolee/initiale/mediale/finale ne sont PAS des
 * caracteres Unicode differents a saisir a la main (les codepoints de
 * "presentation forms" existent mais sont deconseilles pour du texte
 * normal) - elles sont deduites en entourant la lettre de tatweel (ـ,
 * U+0640), qui force le moteur de rendu arabe du navigateur a choisir la
 * forme connectee correspondante, exactement comme le ferait un vrai mot.
 * Voir `deriveForms()` dans LetterFormsTable.tsx.
 */

export interface ArabicLetter {
  /** Caractere de base (forme isolee telle quelle). */
  char: string;
  /** Nom translitere, utilise dans le texte pedagogique et les tableaux. */
  name: string;
  /** Description courte et neutre du son (pas une translitteration phonetique stricte). */
  sound: string;
  /** Faux si la lettre ne s'attache jamais a la lettre suivante (donc seulement 2 formes reelles : isolee et finale). */
  connectsToNext: boolean;
}

export const NON_CONNECTING_LETTERS = new Set(["ا", "د", "ذ", "ر", "ز", "و"]);

function letter(char: string, name: string, sound: string): ArabicLetter {
  return { char, name, sound, connectsToNext: !NON_CONNECTING_LETTERS.has(char) };
}

export const ALIF: ArabicLetter = letter("ا", "Alif", "un \"a\" long, ou simple support d'une voyelle/de la hamza");

export const GROUP_BA_TA_THA: ArabicLetter[] = [
  letter("ب", "Ba", "\"b\""),
  letter("ت", "Ta", "\"t\""),
  letter("ث", "Tha", "\"th\" sourd, comme dans l'anglais think"),
];

export const GROUP_JIM_HA_KHA: ArabicLetter[] = [
  letter("ج", "Jim", "\"dj\", comme le \"j\" anglais de job"),
  letter("ح", "Ha (emphatique)", "un \"h\" rauque, expire profondement depuis la gorge"),
  letter("خ", "Kha", "\"kh\" raclee, comme la jota espagnole ou le \"ch\" allemand de Bach"),
];

export const GROUP_DAL_RA: ArabicLetter[] = [
  letter("د", "Dal", "\"d\""),
  letter("ذ", "Dhal", "\"dh\" sonore, comme le \"th\" anglais de this"),
  letter("ر", "Ra", "\"r\" roule, comme en espagnol"),
  letter("ز", "Zay", "\"z\""),
];

export const GROUP_SIN_SHIN: ArabicLetter[] = [letter("س", "Sin", "\"s\""), letter("ش", "Shin", "\"ch\", comme le \"sh\" anglais")];

export const GROUP_EMPHATIC: ArabicLetter[] = [
  letter("ص", "Sad", "un \"s\" emphatique, prononce avec le dos de la langue releve"),
  letter("ض", "Dad", "un \"d\" emphatique"),
  letter("ط", "Ta (emphatique)", "un \"t\" emphatique"),
  letter("ظ", "Za (emphatique)", "un \"z\"/\"dh\" emphatique"),
];

export const GROUP_AYN_GHAYN_FA_QAF: ArabicLetter[] = [
  letter("ع", "Ayn", "un son guttural produit dans la gorge, sans equivalent en francais"),
  letter("غ", "Ghayn", "\"gh\" grasseye, proche du \"r\" francais"),
  letter("ف", "Fa", "\"f\""),
  letter("ق", "Qaf", "un \"q\" profond, articule tout au fond de la gorge"),
];

export const GROUP_FINAL: ArabicLetter[] = [
  letter("ك", "Kaf", "\"k\""),
  letter("ل", "Lam", "\"l\""),
  letter("م", "Mim", "\"m\""),
  letter("ن", "Noun", "\"n\""),
  letter("ه", "Ha (legere)", "un \"h\" leger, aspire"),
  letter("و", "Waw", "\"w\", ou voyelle longue \"ou\""),
  letter("ي", "Ya", "\"y\", ou voyelle longue \"i\""),
];

export const HAMZA: ArabicLetter = { char: "ء", name: "Hamza", sound: "un arret bref de la voix (coup de glotte)", connectsToNext: false };

/** Les 28 lettres traditionnelles, dans l'ordre d'enseignement classique - pour le tableau recapitulatif. */
export const ALL_28_LETTERS: ArabicLetter[] = [
  ALIF,
  ...GROUP_BA_TA_THA,
  ...GROUP_JIM_HA_KHA,
  ...GROUP_DAL_RA,
  ...GROUP_SIN_SHIN,
  ...GROUP_EMPHATIC,
  ...GROUP_AYN_GHAYN_FA_QAF,
  ...GROUP_FINAL,
];
