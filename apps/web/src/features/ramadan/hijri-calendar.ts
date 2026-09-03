/**
 * Calendrier hijri "tabulaire/civil" - calcul arithmetique pur, sans donnee
 * externe ni bibliotheque tierce (voir ROADMAP.md, phase 4 : "bibliotheque
 * de conversion gregorien/hijri a introduire... ou calcul manuel" - retenu
 * ici pour les memes raisons que le moteur de tajwid maison : aucune
 * dependance a un fichier de donnees, aucune question de licence).
 *
 * Formules verifiees contre l'implementation de reference de l'extension
 * PHP `ext/calendar` (epoque civile/"vendredi", JDN 1948440 pour le 1
 * Muharram an 1 - https://github.com/fisharebest/ext-calendar), elles-memes
 * la reprise de l'algorithme "koweitien" standard utilise depuis des
 * decennies dans les logiciels de calendrier. Verifie manuellement : JDN
 * 1948440 -> {1,1,1} (epoque), et 2026-02-18 -> {1447,9,1} (date de debut
 * du Ramadan 1447 AH largement publiee).
 *
 * **Limite assumee et documentee dans l'UI** : ce calendrier est une
 * approximation arithmetique (30 ans, 11 annees bissextiles), PAS une
 * observation reelle du croissant lunaire - le debut/la fin effectifs du
 * Ramadan sont annonces localement par les autorites religieuses de chaque
 * pays et peuvent differer de +-1 jour par rapport a ce calcul. D'ou le
 * reglage d'activation manuelle (voir useRamadanMode.ts) plutot qu'une
 * detection automatique implicite et non modifiable.
 */

export interface HijriDate {
  year: number;
  /** 1 (Muharram) a 12 (Dhu al-Hijjah). */
  month: number;
  day: number;
}

/** Ramadan est le 9e mois du calendrier hijri. */
export const RAMADAN_MONTH = 9;

/** Nombre total de versets du Coran (utilise pour le calcul de l'objectif de khatm quotidien). */
export const TOTAL_QURAN_VERSES = 6236;

/** Jour julien (JDN) d'une date du calendrier gregorien (algorithme de Fliegel & Van Flandern). */
export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/** Date hijri (calendrier tabulaire/civil) correspondant a un jour julien. */
export function jdnToHijri(jdn: number): HijriDate {
  const year = Math.floor((30 * (jdn - 1948440) + 10646) / 10631);
  const month = Math.floor((11 * (jdn - year * 354 - Math.floor((3 + 11 * year) / 30) - 1948086) + 330) / 325);
  const day = jdn - 29 * (month - 1) - Math.floor((6 * month - 1) / 11) - year * 354 - Math.floor((3 + 11 * year) / 30) - 1948085;
  return { year, month, day };
}

/** Jour julien (JDN) d'une date hijri (calendrier tabulaire/civil) - reciproque de `jdnToHijri`. */
export function hijriToJdn(year: number, month: number, day: number): number {
  return day + 29 * (month - 1) + Math.floor((6 * month - 1) / 11) + year * 354 + Math.floor((3 + 11 * year) / 30) + 1948085;
}

/**
 * Date hijri du jour calendaire UTC d'un `Date` donne - meme convention que
 * `todayUtcKey()` du module `daily` (une seule date de reference pour tout
 * le monde, independante du fuseau du visiteur ; cf. limite d'approximation
 * documentee en tete de fichier, qui rend de toute facon illusoire une
 * precision au fuseau pres).
 */
export function getHijriDate(date: Date = new Date()): HijriDate {
  const jdn = gregorianToJdn(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  return jdnToHijri(jdn);
}

export function isRamadan(hijri: HijriDate): boolean {
  return hijri.month === RAMADAN_MONTH;
}

/**
 * Numero du jour de Ramadan (1-30) pour un `Date` donne, ou `null` hors
 * Ramadan. Le mois de Ramadan (9e, impair) compte toujours 30 jours dans le
 * calendrier tabulaire, contrairement a Dhu al-Hijjah (12e) dont la
 * longueur varie selon les annees bissextiles - aucun cas particulier a
 * gerer ici.
 */
export function getRamadanDay(date: Date = new Date()): number | null {
  const hijri = getHijriDate(date);
  return isRamadan(hijri) ? hijri.day : null;
}

/** Nombre de jours restants dans le Ramadan en cours (le jour courant inclus), ou `null` hors Ramadan. */
export function daysRemainingInRamadan(date: Date = new Date()): number | null {
  const day = getRamadanDay(date);
  return day === null ? null : 30 - day + 1;
}

/**
 * Bornes (dates UTC a minuit) du Ramadan d'une annee hijri donnee -
 * utilisable pour afficher "prochain Ramadan : du ... au ..." avant qu'il ne
 * commence, independamment de la date du jour.
 */
export function getRamadanBounds(hijriYear: number): { start: Date; end: Date } {
  const startJdn = hijriToJdn(hijriYear, RAMADAN_MONTH, 1);
  const endJdn = hijriToJdn(hijriYear, RAMADAN_MONTH, 30);
  return { start: jdnToGregorianDate(startJdn), end: jdnToGregorianDate(endJdn) };
}

/** Date gregorienne (UTC minuit) correspondant a un jour julien - reciproque de `gregorianToJdn`. */
export function jdnToGregorianDate(jdn: number): Date {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((b * 146097) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return new Date(Date.UTC(year, month - 1, day));
}
