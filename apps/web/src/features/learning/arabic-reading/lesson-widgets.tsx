import { LetterFormsTable } from "./LetterFormsTable";
import { ReadingDrill, type DrillItem } from "./ReadingDrill";
import {
  ALIF,
  ALL_28_LETTERS,
  GROUP_AYN_GHAYN_FA_QAF,
  GROUP_BA_TA_THA,
  GROUP_DAL_RA,
  GROUP_EMPHATIC,
  GROUP_FINAL,
  GROUP_JIM_HA_KHA,
  GROUP_SIN_SHIN,
  HAMZA,
} from "./arabic-letters-data";

/** Widgets pedagogiques (tableaux de formes de lettres, exercices de lecture) pour le cours "apprendre a lire l'arabe coranique" - branches sur LESSON_ILLUSTRATIONS comme les autres illustrations de lecon. */

export const AlifAndNonConnectingIntro = () => <LetterFormsTable letters={[ALIF]} />;
export const GroupBaTaThaTable = () => <LetterFormsTable letters={GROUP_BA_TA_THA} />;
export const GroupJimHaKhaTable = () => <LetterFormsTable letters={GROUP_JIM_HA_KHA} />;
export const GroupDalRaTable = () => <LetterFormsTable letters={GROUP_DAL_RA} />;
export const GroupSinShinTable = () => <LetterFormsTable letters={GROUP_SIN_SHIN} />;
export const GroupEmphaticTable = () => <LetterFormsTable letters={GROUP_EMPHATIC} />;
export const GroupAynGhaynFaQafTable = () => <LetterFormsTable letters={GROUP_AYN_GHAYN_FA_QAF} />;
export const GroupFinalTable = () => <LetterFormsTable letters={[...GROUP_FINAL, HAMZA]} />;
export const FullAlphabetTable = () => <LetterFormsTable letters={ALL_28_LETTERS} />;

const SHORT_VOWELS_DRILL: DrillItem[] = [
  { arabic: "بَ", transliteration: "ba" },
  { arabic: "بِ", transliteration: "bi" },
  { arabic: "بُ", transliteration: "bu" },
  { arabic: "تَ", transliteration: "ta" },
  { arabic: "تِ", transliteration: "ti" },
  { arabic: "تُ", transliteration: "tu" },
  { arabic: "دَ", transliteration: "da" },
  { arabic: "دِ", transliteration: "di" },
  { arabic: "دُ", transliteration: "du" },
  { arabic: "مَ", transliteration: "ma" },
  { arabic: "مِ", transliteration: "mi" },
  { arabic: "مُ", transliteration: "mu" },
];
export const ShortVowelsDrillWidget = () => <ReadingDrill title="Lettre + voyelle courte" items={SHORT_VOWELS_DRILL} />;

const SUKUN_DRILL: DrillItem[] = [
  { arabic: "مِنْ", transliteration: "min", meaning: "de, depuis" },
  { arabic: "عَنْ", transliteration: "an", meaning: "au sujet de" },
  { arabic: "هَلْ", transliteration: "hal", meaning: "est-ce que ?" },
  { arabic: "بَلْ", transliteration: "bal", meaning: "plutôt" },
  { arabic: "قَدْ", transliteration: "qad", meaning: "particule (déjà / peut-être)" },
  { arabic: "لَنْ", transliteration: "lan", meaning: "ne...jamais (futur)" },
];
export const SukunDrillWidget = () => <ReadingDrill title="Lettre suivie d'un soukoun" items={SUKUN_DRILL} />;

const SHADDA_DRILL: DrillItem[] = [
  { arabic: "رَبَّ", transliteration: "rabba", meaning: "seigneur (accusatif)" },
  { arabic: "حَقٌّ", transliteration: "haqqun", meaning: "vérité" },
  { arabic: "كُلٌّ", transliteration: "kullun", meaning: "tout, chaque" },
  { arabic: "ثُمَّ", transliteration: "thumma", meaning: "puis, ensuite" },
  { arabic: "إِنَّ", transliteration: "inna", meaning: "certes" },
];
export const ShaddaDrillWidget = () => <ReadingDrill title="Lettre doublée (chadda)" items={SHADDA_DRILL} />;

const CONCATENATION_DRILL: DrillItem[] = [
  { arabic: "هُوَ", transliteration: "huwa", meaning: "il" },
  { arabic: "هِيَ", transliteration: "hiya", meaning: "elle" },
  { arabic: "مَنْ", transliteration: "man", meaning: "qui" },
  { arabic: "مَا", transliteration: "ma", meaning: "quoi / ne...pas" },
  { arabic: "كَتَبَ", transliteration: "kataba", meaning: "il a écrit" },
  { arabic: "ذَهَبَ", transliteration: "dhahaba", meaning: "il est allé" },
  { arabic: "جَلَسَ", transliteration: "jalasa", meaning: "il s'est assis" },
  { arabic: "خَرَجَ", transliteration: "kharaja", meaning: "il est sorti" },
  { arabic: "دَخَلَ", transliteration: "dakhala", meaning: "il est entré" },
  { arabic: "رَكَعَ", transliteration: "raka'a", meaning: "il s'est incliné" },
  { arabic: "سَجَدَ", transliteration: "sajada", meaning: "il s'est prosterné" },
  { arabic: "عَبَدَ", transliteration: "'abada", meaning: "il a adoré" },
];
export const ConcatenationDrillWidget = () => <ReadingDrill title="Premiers mots (2-3 lettres)" items={CONCATENATION_DRILL} />;

const LONG_VOWELS_DRILL: DrillItem[] = [
  { arabic: "قَالَ", transliteration: "qala", meaning: "il a dit" },
  { arabic: "نُورٌ", transliteration: "nurun", meaning: "lumière" },
  { arabic: "دِينٌ", transliteration: "dinun", meaning: "religion" },
  { arabic: "يَقُولُ", transliteration: "yaqoolu", meaning: "il dit" },
  { arabic: "كَبِيرٌ", transliteration: "kabirun", meaning: "grand" },
];
export const LongVowelsDrillWidget = () => <ReadingDrill title="Voyelles longues" items={LONG_VOWELS_DRILL} />;

const TANWEEN_DRILL: DrillItem[] = [
  { arabic: "كِتَابٌ", transliteration: "kitabun", meaning: "un livre" },
  { arabic: "بَيْتًا", transliteration: "baytan", meaning: "une maison (accusatif)" },
  { arabic: "كِتَابًا", transliteration: "kitaban", meaning: "un livre (accusatif)" },
  { arabic: "بِسَلَامٍ", transliteration: "bisalamin", meaning: "avec paix" },
];
export const TanweenDrillWidget = () => <ReadingDrill title="Le tanwin" items={TANWEEN_DRILL} />;

const WASLA_TA_MARBUTA_DRILL: DrillItem[] = [
  { arabic: "ٱسْمٌ", transliteration: "ismun", meaning: "un nom" },
  { arabic: "ٱبْنٌ", transliteration: "ibnun", meaning: "un fils" },
  { arabic: "مَدْرَسَةٌ", transliteration: "madrasatun", meaning: "une école" },
  { arabic: "رَحْمَةٌ", transliteration: "rahmatun", meaning: "une miséricorde" },
  { arabic: "صَلَاةٌ", transliteration: "salatun", meaning: "une prière" },
];
export const WaslaTaMarbutaDrillWidget = () => <ReadingDrill title="Alif de liaison et ta marbouta" items={WASLA_TA_MARBUTA_DRILL} />;

const SHAMSIYYA_QAMARIYYA_DRILL: DrillItem[] = [
  { arabic: "ٱلشَّمْسُ", transliteration: "ash-shamsu", meaning: "le soleil (lam solaire)" },
  { arabic: "ٱلْقَمَرُ", transliteration: "al-qamaru", meaning: "la lune (lam lunaire)" },
  { arabic: "ٱلنُّورُ", transliteration: "an-nuru", meaning: "la lumière (lam solaire)" },
  { arabic: "ٱلْكِتَابُ", transliteration: "al-kitabu", meaning: "le livre (lam lunaire)" },
  { arabic: "ٱلرَّحْمَٰنُ", transliteration: "ar-rahmanu", meaning: "le Tout Miséricordieux (lam solaire)" },
];
export const ShamsiyyaQamariyyaDrillWidget = () => <ReadingDrill title="Lam solaire ou lunaire ?" items={SHAMSIYYA_QAMARIYYA_DRILL} />;
