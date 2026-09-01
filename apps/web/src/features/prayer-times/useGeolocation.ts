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

/** Detecte si l'app est ouverte en mode standalone (PWA installee). */
function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

/** Detecte iOS (Safari ou navigueurs constraint sur iOS). */
function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * iOS standalone : la permission de localisation ne peut PAS etre demandee
 * via le prompt natif dans la PWA - elle est heritee de Safari (navigateur).
 * Cette combinaison necessite une UI de guidage specifique.
 */
function detectIOSStandalone(): boolean {
  return detectIOS() && detectStandalone();
}

/**
 * Demande la position GPS via l'API Geolocation.
 * Retourne les coordonnes arrondies a 3 decimales (~110m).
 */
function fetchPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Math.round(position.coords.latitude * 1000) / 1000,
          longitude: Math.round(position.coords.longitude * 1000) / 1000,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 10000 },
    );
  });
}

/**
 * Position de l'utilisateur pour le calcul des horaires de priere/Qibla.
 * Mise en cache dans localStorage (prive au navigateur) pour eviter de
 * redemander la permission a chaque visite - y compris pour un visiteur non
 * connecte, qui n'a pas de reglages persistes en base.
 *
 * La demande de localisation n'est JAMAIS automatisee lorsque la permission
 * est a l'etat "prompt" : elle passe par un geste utilisateur (bouton), car
 * un appel automatique au chargement peut etre refuse silencieusement par
 * le navigateur/OS sans afficher le prompt natif - surtout en PWA standalone
 * sur iOS - et verrouiller la permission a "denied" sans que l'utilisateur
 * n'ait eu la chance de l'accepter. Seule la permission deja "granted" est
 * consommee automatiquement (aucun prompt n'apparait dans ce cas).
 */
export function useGeolocation() {
  const [coords, setCoords] = React.useState<Coordinates | null>(() => loadCached());
  const [status, setStatus] = React.useState<GeolocationStatus>(() => (loadCached() ? "granted" : "idle"));
  const [permissionState, setPermissionState] = React.useState<PermissionState>("prompt");
  const isStandalone = React.useMemo(() => detectStandalone(), []);
  const isIOSStandalone = React.useMemo(() => detectIOSStandalone(), []);

  const applyCoords = React.useCallback((position: Coordinates) => {
    setCoords(position);
    saveCache(position);
    setStatus("granted");
  }, []);

  const request = React.useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    fetchPosition()
      .then(applyCoords)
      .catch((error: GeolocationPositionError) => {
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      });
  }, [applyCoords]);

  /** Classe l'erreur Geolocation en statut "denied" ou "error". */
  const classifyError = React.useCallback((error: unknown) => {
    const geolocationError = error as GeolocationPositionError | undefined;
    setStatus(geolocationError && geolocationError.code === geolocationError.PERMISSION_DENIED ? "denied" : "error");
  }, []);

  /** Applique une position saisie manuellement (aucune permission necessaire). */
  const setManualCoords = React.useCallback(
    (position: Coordinates) => {
      setCoords(position);
      saveCache(position);
      setStatus("granted");
    },
    [],
  );

  // Verification de l'etat de permission + tentative automatique au montage.
  React.useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    // Si deja en cache, pas besoin de re-demander.
    if (coords) return;

    let cancelled = false;

    // Tentative automatique UNIQUEMENT lorsque la permission est deja
    // accordee : dans ce cas aucun prompt ne s'affiche, on obtient la
    // position silencieusement.
    const attempt = async () => {
      setStatus("loading");
      try {
        const pos = await fetchPosition();
        if (!cancelled) applyCoords(pos);
      } catch (error) {
        if (!cancelled) classifyError(error);
      }
    };

    const decide = async () => {
      // API Permissions non supportee (notamment iOS) : impossible de
      // connaitre l'etat sans appeler getCurrentPosition, ce qui sur iOS
      // peut refuser SILENCIEUSEMENT sans afficher de prompt (et verrouille
      // alors la permission a "denied"). On reste donc en "idle" et on
      // laisse l'utilisateur declencher via le bouton (geste utilisateur),
      // qui fait afficher le prompt natif de facon fiable.
      if (!("permissions" in navigator)) {
        setStatus("idle");
        return;
      }

      try {
        const result = await navigator.permissions.query({ name: "geolocation" });
        if (cancelled) return;
        setPermissionState(result.state);

        if (result.state === "granted") return attempt();
        if (result.state === "denied") {
          setStatus("denied");
          return;
        }

        // state === "prompt" : on N'AUTOMATISE PAS la demande. Un appel
        // automatique au chargement peut etre refuse silencieusement par le
        // navigateur/OS (surtout en PWA standalone sur iOS) et verrouiller
        // la permission a "denied". On affiche le bouton, l'appel se fait
        // sur geste utilisateur -> le prompt natif s'affiche de facon fiable.
        setStatus("idle");
      } catch {
        if (!cancelled) setStatus("idle");
      }
    };

    void decide();
    return () => {
      cancelled = true;
    };
  }, [coords, applyCoords, classifyError]);

  return { coords, status, request, setManualCoords, isStandalone, isIOSStandalone, permissionState };
}
