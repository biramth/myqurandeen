import { getHijriDate, getRamadanDay, isRamadan } from "./hijri-calendar";

export interface RamadanModeState {
  /** Vrai uniquement pendant la periode reelle du Ramadan - aucune activation manuelle possible. */
  active: boolean;
  /** Jour du Ramadan (1-30), null si `active` est faux. */
  day: number | null;
  hijriYear: number;
}

/**
 * Detection du mode Ramadan - purement automatique, basee sur la date du
 * jour (voir hijri-calendar.ts, calendrier tabulaire/civil). Volontairement
 * AUCUNE activation manuelle possible : le mode ne doit s'afficher qu'en
 * periode reelle de Ramadan, jamais en avance (retire suite a une demande
 * explicite - une premiere version proposait un reglage "forcer active"
 * pour tester/anticiper, mais ce n'est pas le comportement souhaite).
 */
export function useRamadanMode(): RamadanModeState {
  const hijri = getHijriDate();
  return { active: isRamadan(hijri), day: getRamadanDay(), hijriYear: hijri.year };
}
