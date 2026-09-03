/**
 * Detection des regles de tajwid par analyse directe du texte arabe deja
 * stocke (Uthmani, source Tanzil - voir apps/api/.../quran-import.ts),
 * plutot qu'un import d'un jeu de donnees externe pre-annote.
 *
 * Pourquoi pas un import (ROADMAP.md, 3.1) : le seul jeu de donnees libre
 * trouve avec une couverture complete verifiee (cpfair/quran-tajweed sur
 * GitHub, CC BY 4.0, 6236/6236 versets) a un bug de decalage connu et non
 * resolu (issue #2 du depot) entre ses positions - calculees sur une copie
 * 2017 du texte Tanzil "Uthmani + marques de pause/sajda" - et le texte
 * Tanzil actuel. Les utiliser telles quelles produirait une coloration
 * FAUSSE sur de vrais versets. L'alternative technique propre (texte deja
 * balise de Quran.com/Quran Foundation) a des conditions d'utilisation qui
 * interdisent le stockage en base sans accord commercial ecrit, en plus
 * d'exiger un compte developpeur. Calculer les regles nous-memes sur notre
 * propre texte (deja verifie, deja licencie, deja en base) elimine les deux
 * problemes a la fois : aucun risque de decalage (aucune dependance a un
 * fichier externe), aucun risque de licence (regles de grammaire tajwid
 * publiques, pas une redistribution de donnees tierces).
 *
 * Portee volontairement partielle pour cette premiere iteration - couvre
 * les regles les plus mecaniques et les plus fiables a detecter par simple
 * analyse de caracteres : noun/tanwin sakinah (idgham/iqlab/ikhfa/idhar),
 * mim sakinah (ikhfa/idgham shafawi), qalqalah, ghunna (chadda sur noun/mim)
 * et lam shamsiyya. Les regles de madd (allongement, plusieurs sous-types
 * selon le contexte au-dela des limites du mot voire du verset) ne sont PAS
 * couvertes ici : leur classification correcte demanderait de regarder au
 * dela de ce que cette fonction voit (un seul verset a la fois), avec un
 * vrai risque de classification fausse - a traiter dans une iteration
 * dediee plutot que d'etre approximee maintenant.
 *
 * Limite assumee : le decoupage se fait verset par verset (comme le reste
 * de l'app). Une regle noun/tanwin sakinah dont la lettre suivante serait le
 * premier mot du verset suivant n'est pas detectee (equivalent a une pause
 * de recitation a cet endroit, ce qui est de toute facon la situation la
 * plus frequente en pratique - la plupart des lectures marquent une pause
 * courte entre versets).
 */

export type TajweedRule =
  | "ghunna"
  | "qalqalah"
  | "lam_shamsiyyah"
  | "idgham_ghunna"
  | "idgham_no_ghunna"
  | "iqlab"
  | "ikhfa"
  | "ikhfa_shafawi"
  | "idgham_shafawi";

export interface TajweedSegment {
  text: string;
  rule: TajweedRule | null;
}

const SUKUN = "ْ";
const SHADDA = "ّ";
const TANWEEN = new Set(["ً", "ٌ", "ٍ"]); // tanwin fath/damm/kasr

// Lettres de base retenues pour la detection : les 28 lettres arabes +
// variantes de hamza + alef wasl (ٱ, utilise par Tanzil pour le hamza
// d'union du "ال" d'article defini et de certains mots). Exclut par
// construction toute diacritique (harakat, ً-ْ) et toute marque
// decorative (madda, alef/waw/yeh superscrits, marques de pause/waqf,
// tatweel, ٓ et au-dela) : aucune de ces marques ne peut donc jamais
// etre traitee comme une "lettre suivante".
const LETTER_RE = /[ء-غف-يٱ]/;

const THROAT_LETTERS = new Set([
  "ء", "أ", "ؤ", "إ", "ئ", // ء أ ؤ إ ئ
  "ه", "ع", "ح", "غ", "خ", // ه ع ح غ خ
]);
const IDGHAM_GHUNNA_LETTERS = new Set(["ي", "ن", "م", "و"]); // ي ن م و
const IDGHAM_NO_GHUNNA_LETTERS = new Set(["ل", "ر"]); // ل ر
const IQLAB_LETTER = "ب"; // ب
const QALQALAH_LETTERS = new Set(["ق", "ط", "ب", "ج", "د"]); // ق ط ب ج د
const SUN_LETTERS = new Set([
  "ت", "ث", "د", "ذ", "ر", "ز", "س", "ش",
  "ص", "ض", "ط", "ظ", "ل", "ن",
]); // ت ث د ذ ر ز س ش ص ض ط ظ ل ن
const NOON = "ن";
const MEEM = "م";
const LAM = "ل";
const ALEF_FORMS = new Set(["ا", "ٱ"]); // ا (et alef wasl ٱ)
// و/ي apres noun sakinah/tanwin ne declenchent l'idgham qu'entre deux mots
// distincts - a l'interieur d'un meme mot (ex. "الدنيا", "قنوان", "بنيان"),
// aucune regle particuliere ne s'applique (idhar). ي/و seuls parmi
// les 4 lettres d'idgham ghunna ont cette exception.
const IDGHAM_GHUNNA_SAME_WORD_EXCEPTION = new Set(["ي", "و"]);

interface Letter {
  /** Position du caractere de base dans le texte source. */
  index: number;
  char: string;
  hasSukun: boolean;
  hasShadda: boolean;
  hasTanween: boolean;
  /** Vrai specifiquement pour le tanwin fath (ً) - orthographie avec un alif de soutien muet (voir `realNextLetter`). */
  hasTanweenFath: boolean;
  /** Index du mot (groupe separe par des espaces) contenant cette lettre. */
  wordIndex: number;
  /** Vrai si cette lettre est la 1ere lettre de son mot. */
  isWordStart: boolean;
}

/** Releve toutes les lettres de base du texte avec leurs diacritiques et leur position dans les mots. */
function extractLetters(text: string): Letter[] {
  const letters: Letter[] = [];
  let wordIndex = -1;
  let wordJustStarted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " ") {
      wordJustStarted = false;
      continue;
    }
    if (!LETTER_RE.test(ch)) continue; // diacritique ou marque decorative : ignoree ici

    if (!wordJustStarted) {
      wordIndex++;
      wordJustStarted = true;
      letters.push(makeLetter(text, i, wordIndex, true));
    } else {
      letters.push(makeLetter(text, i, wordIndex, false));
    }
  }
  return letters;
}

function makeLetter(text: string, index: number, wordIndex: number, isWordStart: boolean): Letter {
  let hasSukun = false;
  let hasShadda = false;
  let hasTanween = false;
  let hasTanweenFath = false;
  for (let j = index + 1; j < text.length && !LETTER_RE.test(text[j]) && text[j] !== " "; j++) {
    const d = text[j];
    if (d === SUKUN) hasSukun = true;
    else if (d === SHADDA) hasShadda = true;
    else if (TANWEEN.has(d)) {
      hasTanween = true;
      if (d === "ً") hasTanweenFath = true;
    }
  }
  return { index, char: text[index], hasSukun, hasShadda, hasTanween, hasTanweenFath, wordIndex, isWordStart };
}

/**
 * Le tanwin fath (ً) s'ecrit avec un alif de soutien muet juste apres
 * (ex. "قَوْمًا") : cet alif ne doit jamais etre traite comme la "lettre
 * suivante" pour les regles noun/tanwin sakinah, sous peine de comparer la
 * regle a la mauvaise lettre. On saute cet alif s'il est bien la derniere
 * lettre du mot (l'alif de soutien n'existe jamais suivi d'une autre lettre
 * dans le meme mot).
 */
function realNextLetter(letters: Letter[], currentIndex: number, current: Letter): Letter | undefined {
  const next = letters[currentIndex + 1];
  if (!next) return undefined;
  if (current.hasTanweenFath && next.char === "ا" && next.wordIndex === current.wordIndex) {
    return letters[currentIndex + 2];
  }
  return next;
}

function classifyNoonOrTanween(current: Letter, next: Letter | undefined): TajweedRule | null {
  if (!next) return null; // fin de verset : lettre suivante inconnue (voir limite assumee en tete de fichier)
  const nextChar = next.char;

  if (nextChar === IQLAB_LETTER) return "iqlab";
  if (IDGHAM_NO_GHUNNA_LETTERS.has(nextChar)) return "idgham_no_ghunna";
  if (IDGHAM_GHUNNA_LETTERS.has(nextChar)) {
    const sameWord = next.wordIndex === current.wordIndex;
    if (sameWord && IDGHAM_GHUNNA_SAME_WORD_EXCEPTION.has(nextChar)) return null; // idhar (exception "الدنيا")
    return "idgham_ghunna";
  }
  if (THROAT_LETTERS.has(nextChar)) return null; // idhar halqi : rien de special, pas de couleur
  return "ikhfa"; // les 15 lettres restantes
}

function classifyMeemSakinah(next: Letter | undefined): TajweedRule | null {
  if (!next) return null;
  if (next.char === IQLAB_LETTER) return "ikhfa_shafawi"; // ب
  if (next.char === MEEM) return "idgham_shafawi";
  return null; // idhar shafawi : rien de special
}

/**
 * Calcule la regle de tajwid (s'il y en a une) associee a chaque lettre du
 * texte. Renvoie une Map indexee par la position de la lettre dans `text`
 * (memes indices que `extractLetters`) - usage interne, voir
 * `computeTajweedSegments` pour l'API publique (segments de texte prets a
 * afficher).
 */
function classifyLetters(letters: Letter[]): Map<number, TajweedRule> {
  const rules = new Map<number, TajweedRule>();

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const next = letters[i + 1];

    // Ghunna (chadda sur noun/mim) : prioritaire sur les autres regles noun/mim.
    if (letter.hasShadda && (letter.char === NOON || letter.char === MEEM)) {
      rules.set(letter.index, "ghunna");
      continue;
    }

    // Qalqalah : lettre de qalqalah avec soukoun (y compris en position
    // finale du verset, ou l'arret de lecture induit un soukoun meme si le
    // texte porte une autre voyelle - qalqalah dite "kubra").
    const isLastLetter = i === letters.length - 1;
    if (QALQALAH_LETTERS.has(letter.char) && (letter.hasSukun || isLastLetter)) {
      rules.set(letter.index, "qalqalah");
      continue;
    }

    // Lam shamsiyya : lam en 2e lettre d'un mot commencant par alef/alef
    // wasl, suivi (meme mot) d'une lettre solaire portant un chadda -
    // c'est le lam (silencieux) qui est mis en avant, pas la lettre solaire.
    if (
      letter.char === LAM &&
      !letter.isWordStart &&
      i > 0 &&
      ALEF_FORMS.has(letters[i - 1].char) &&
      letters[i - 1].isWordStart &&
      next &&
      next.wordIndex === letter.wordIndex &&
      SUN_LETTERS.has(next.char) &&
      next.hasShadda
    ) {
      rules.set(letter.index, "lam_shamsiyyah");
      continue;
    }

    if (letter.char === NOON && letter.hasSukun) {
      const rule = classifyNoonOrTanween(letter, next);
      if (rule) rules.set(letter.index, rule);
      continue;
    }
    if (letter.hasTanween) {
      const rule = classifyNoonOrTanween(letter, realNextLetter(letters, i, letter));
      if (rule) rules.set(letter.index, rule);
      continue;
    }
    if (letter.char === MEEM && letter.hasSukun) {
      const rule = classifyMeemSakinah(next);
      if (rule) rules.set(letter.index, rule);
      continue;
    }
  }

  return rules;
}

/**
 * Decoupe `text` en segments consecutifs {text, rule}, `rule` valant `null`
 * pour le texte sans regle particuliere. La concatenation de tous les
 * `segment.text` reconstitue exactement `text` (aucun caractere perdu ni
 * modifie - seule la segmentation change).
 */
export function computeTajweedSegments(text: string): TajweedSegment[] {
  const letters = extractLetters(text);
  const rules = classifyLetters(letters);

  const segments: TajweedSegment[] = [];
  let currentRule: TajweedRule | null = null;
  let segmentStart = 0;

  const flush = (end: number) => {
    if (end > segmentStart) segments.push({ text: text.slice(segmentStart, end), rule: currentRule });
  };

  // Chaque segment s'etend jusqu'au debut de la prochaine lettre a regle
  // differente : les diacritiques/marques decoratives qui suivent une lettre
  // restent naturellement groupees avec elle.
  for (const letter of letters) {
    const rule = rules.get(letter.index) ?? null;
    if (rule !== currentRule) {
      flush(letter.index);
      currentRule = rule;
      segmentStart = letter.index;
    }
  }
  flush(text.length);
  // Texte sans aucune lettre reconnue (improbable mais sûr) : un seul segment brut.
  if (segments.length === 0) segments.push({ text, rule: null });
  return segments;
}
