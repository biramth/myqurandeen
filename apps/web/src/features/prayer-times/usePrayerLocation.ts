import * as React from "react";

const STORAGE_KEY = "qurandeen:prayer-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

function loadCached(): Coordinates | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Coordinates>;
    if (typeof parsed.latitude !== "number" || typeof parsed.longitude !== "number") return null;
    return { latitude: parsed.latitude, longitude: parsed.longitude };
  } catch {
    return null;
  }
}

function saveCache(coords: Coordinates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // Stockage indisponible (navigation privee, quota...) - la position reste utilisable pour cette session.
  }
}

/**
 * Localisation pour le calcul des horaires de priere/Qibla.
 *
 * Aucune API de geolocalisation GPS : la position provient uniquement de la
 * ville choisie par l'utilisateur (recherche de ville), ce qui evite le
 * prompt de permission - pas de limitation iOS/OS, pas de blocage en PWA.
 * La position est mise en cache dans localStorage.
 */
export function usePrayerLocation() {
  const [coords, setCoordsState] = React.useState<Coordinates | null>(() => loadCached());

  const setCoords = React.useCallback((position: Coordinates) => {
    setCoordsState(position);
    saveCache(position);
  }, []);

  return { coords, setCoords };
}