import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from "adhan";

/**
 * Cles de methode de calcul exposees a l'utilisateur (sous-ensemble curated
 * des methodes disponibles dans `adhan`). Doit rester synchronise avec
 * PRAYER_CALCULATION_METHODS cote backend
 * (apps/api/src/modules/reminders/prayer-times.ts), valide par
 * UpsertPrayerAlertSettingsDto.
 */
export const PRAYER_CALCULATION_METHODS = [
  "MuslimWorldLeague",
  "Egyptian",
  "UmmAlQura",
  "NorthAmerica",
  "Karachi",
  "Turkey",
] as const;

export type PrayerCalculationMethod = (typeof PRAYER_CALCULATION_METHODS)[number];

export const DEFAULT_PRAYER_CALCULATION_METHOD: PrayerCalculationMethod = "MuslimWorldLeague";

/** Les 5 prieres obligatoires, dans l'ordre chronologique du jour. */
export const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export interface DailyPrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

/**
 * Calcule les 5 horaires de priere (+ lever du soleil, affiche a titre
 * indicatif mais jamais notifiable - ce n'est pas une priere) pour un jour et
 * un lieu donnes. Calcul 100% cote client : aucun aller-retour serveur
 * necessaire pour l'affichage.
 */
export function computePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  method: PrayerCalculationMethod = DEFAULT_PRAYER_CALCULATION_METHOD,
): DailyPrayerTimes {
  const coordinates = new Coordinates(latitude, longitude);
  const params = CalculationMethod[method]();
  const times = new PrayerTimes(coordinates, date, params);
  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

/** Direction de la Qibla (cap en degres depuis le nord vrai, 0-360) depuis un lieu donne. */
export function computeQiblaDirection(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}

export interface NextPrayer {
  name: PrayerName;
  time: Date;
}

/**
 * Prochaine priere (jamais le lever du soleil, qui n'en est pas une) a
 * partir des horaires du jour. Si toutes les prieres du jour sont deja
 * passees (apres Isha), recalcule pour demain a la meme position/methode.
 */
export function nextPrayer(
  latitude: number,
  longitude: number,
  method: PrayerCalculationMethod,
  now: Date = new Date(),
): NextPrayer {
  const today = computePrayerTimes(latitude, longitude, now, method);
  for (const name of PRAYER_NAMES) {
    if (today[name].getTime() > now.getTime()) return { name, time: today[name] };
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = computePrayerTimes(latitude, longitude, tomorrow, method);
  return { name: "fajr", time: nextDay.fajr };
}
