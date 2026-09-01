import { CalculationMethod, Coordinates, PrayerTimes } from "adhan";
import { TIMEZONE_COORDINATES } from "./timezone-coordinates";

/**
 * Methodes de calcul exposees a l'utilisateur (sous-ensemble curated des
 * methodes disponibles dans `adhan` - la liste complete est trop longue pour
 * un simple menu deroulant). Cles partagees telles quelles avec le frontend
 * (UpsertPrayerAlertSettingsDto valide contre ce meme tableau).
 */
export const PRAYER_CALCULATION_METHODS = [
  "MuslimWorldLeague",
  "Egyptian",
  "UmmAlQura",
  "NorthAmerica",
  "Karachi",
  "Turkey",
] as const;

export type PrayerCalculationMethodKey = (typeof PRAYER_CALCULATION_METHODS)[number];

export const DEFAULT_PRAYER_CALCULATION_METHOD: PrayerCalculationMethodKey = "MuslimWorldLeague";

export function isPrayerCalculationMethod(value: string): value is PrayerCalculationMethodKey {
  return (PRAYER_CALCULATION_METHODS as readonly string[]).includes(value);
}

/** Les 5 prieres obligatoires, utilisees comme cle pour les reglages de notification. */
export const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

/** Formate un timestamp ISO en "hh:mm" dans un fuseau IANA (tolere "24" -> "00"). */
export function formatHhmm(iso: string, timeZone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(iso));
    const map: Record<string, string> = {};
    for (const part of parts) map[part.type] = part.value;
    const hour = map.hour === "24" ? "00" : map.hour;
    return `${hour}:${map.minute}`;
  } catch {
    return null;
  }
}

interface LocalClockLike {
  year: number;
  month: number;
  day: number;
}

/**
 * Composants locaux (annee/mois/jour) de "l'horloge murale" d'un fuseau IANA,
 * utilises comme jour de reference pour le calcul des horaires de priere.
 */
function localDateParts(timeZone: string, at: Date = new Date()): LocalClockLike | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(at);
    const map: Record<string, string> = {};
    for (const part of parts) map[part.type] = part.value;
    return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
  } catch {
    return null;
  }
}

/**
 * Horaires de priere (Fajr, Isha, ...) d'un utilisateur pour "aujourd'hui"
 * dans son fuseau local, calcules avec adhan (methode Muslim World League
 * 18°/17° par defaut - voir `method` pour les autres methodes disponibles).
 *
 * La date calendaire locale est utilisee comme jour de reference (adhan lit
 * les composants locaux du Date passe). Les dates absolues (ISO) renvoyees
 * par adhan sont reformatees en "hh:mm" dans le fuseau de l'utilisateur.
 *
 * `coords` null => repli sur la ville principale du fuseau IANA
 * (TIMEZONE_COORDINATES). Renvoie null si aucune coordonnee n'est calculable
 * (fuseau inconnu sans repli), auquel cas le creneau concerned est ignore.
 */
export function twoPrayerTimes(
  timeZone: string,
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  at: Date = new Date(),
  method: PrayerCalculationMethodKey = DEFAULT_PRAYER_CALCULATION_METHOD,
): PrayerTimes | null {
  const parts = localDateParts(timeZone, at);
  if (!parts) return null;

  let coords: Coordinates;
  if (typeof latitude === "number" && typeof longitude === "number" && !Number.isNaN(latitude) && !Number.isNaN(longitude)) {
    coords = new Coordinates(latitude, longitude);
  } else {
    const fallback = TIMEZONE_COORDINATES[timeZone];
    if (!fallback) return null;
    coords = new Coordinates(fallback[0], fallback[1]);
  }

  return new PrayerTimes(coords, new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0), CalculationMethod[method]());
}

/** "hh:mm" local du Fajr et de l'Isha pour un utilisateur aujourd'hui. */
export function duaPrayerTimes(
  timeZone: string,
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  at: Date = new Date(),
): { fajr: string | null; isha: string | null } {
  const times = twoPrayerTimes(timeZone, latitude, longitude, at);
  if (!times) return { fajr: null, isha: null };
  return {
    fajr: formatHhmm(times.fajr.toISOString(), timeZone),
    isha: formatHhmm(times.isha.toISOString(), timeZone),
  };
}