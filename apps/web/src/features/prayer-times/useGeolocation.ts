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

export type GeolocationStatus = "idle" | "loading" | "granted" | "denied" | "error" | "unsupported";

/**
 * Position de l'utilisateur pour le calcul des horaires de priere/Qibla.
 * Mise en cache dans localStorage (prive au navigateur) pour eviter de
 * redemander la permission a chaque visite - y compris pour un visiteur non
 * connecte, qui n'a pas de reglages persistes en base.
 */
export function useGeolocation() {
  const [coords, setCoords] = React.useState<Coordinates | null>(() => loadCached());
  const [status, setStatus] = React.useState<GeolocationStatus>(() => (loadCached() ? "granted" : "idle"));

  const request = React.useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Arrondi a 3 decimales (~110m) : largement suffisant pour un calcul
        // d'horaires de priere, evite de conserver une position exacte.
        const rounded: Coordinates = {
          latitude: Math.round(position.coords.latitude * 1000) / 1000,
          longitude: Math.round(position.coords.longitude * 1000) / 1000,
        };
        setCoords(rounded);
        saveCache(rounded);
        setStatus("granted");
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 10000 },
    );
  }, []);

  return { coords, status, request };
}
