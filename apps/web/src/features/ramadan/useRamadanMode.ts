import * as React from "react";
import { getHijriDate, getRamadanDay, isRamadan } from "./hijri-calendar";

const OVERRIDE_STORAGE_KEY = "qurandeen-ramadan-mode-override";

export type RamadanModeOverride = "auto" | "on" | "off";

function loadOverride(): RamadanModeOverride {
  try {
    const raw = window.localStorage.getItem(OVERRIDE_STORAGE_KEY);
    return raw === "on" || raw === "off" ? raw : "auto";
  } catch {
    return "auto";
  }
}

export interface RamadanModeState {
  /** Vrai si le mode Ramadan doit s'afficher (detection reelle, ou reglage manuel "on"). */
  active: boolean;
  /** Jour du Ramadan (1-30), null si `active` est faux ou si force manuellement sans date reelle. */
  day: number | null;
  hijriYear: number;
  override: RamadanModeOverride;
  setOverride: (value: RamadanModeOverride) => void;
}

/**
 * Detection du mode Ramadan + reglage d'activation manuelle (ROADMAP.md,
 * phase 4 : "activation manuelle possible en reglage pour tester/
 * anticiper" - utile aussi bien pour un visiteur qui veut se preparer en
 * avance que pour verifier l'affichage hors saison). La detection reelle
 * est une approximation arithmetique (voir hijri-calendar.ts) : le reglage
 * manuel permet de la court-circuiter dans les deux sens.
 */
export function useRamadanMode(): RamadanModeState {
  const [override, setOverrideState] = React.useState<RamadanModeOverride>(() => loadOverride());

  const setOverride = React.useCallback((value: RamadanModeOverride) => {
    setOverrideState(value);
    try {
      window.localStorage.setItem(OVERRIDE_STORAGE_KEY, value);
    } catch {
      // Persistance best-effort - le reglage reste actif pour la session en cours.
    }
  }, []);

  return React.useMemo(() => {
    const hijri = getHijriDate();
    const realDay = getRamadanDay();
    if (override === "on") {
      return { active: true, day: realDay ?? 1, hijriYear: hijri.year, override, setOverride };
    }
    if (override === "off") {
      return { active: false, day: null, hijriYear: hijri.year, override, setOverride };
    }
    return { active: isRamadan(hijri), day: realDay, hijriYear: hijri.year, override, setOverride };
  }, [override, setOverride]);
}
