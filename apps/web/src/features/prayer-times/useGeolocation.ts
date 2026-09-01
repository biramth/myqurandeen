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

export type GeolocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable" | "timeout" | "unsupported";

/** Detecte si l'app est ouverte en mode standalone (PWA installee). */
function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

/** Detecte iOS (Safari ou navigateurs contraints sur iOS). */
function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * iOS standalone : le prompt natif de localisation peut ne jamais s'afficher
 * (bug connu - il "cible le mauvais onglet") et getCurrentPosition ne
 * declenche ALCUN callback, meme pas le timeout des PositionOptions.
 * Cette combinaison necessite une UI de guidage specifique.
 */
function detectIOSStandalone(): boolean {
  return detectIOS() && detectStandalone();
}

/**
 * Demande la position GPS via l'API Geolocation.
 * Retourne les coordonnes arrondies a 3 decimales (~110m).
 *
 * Garde-fou : sur iOS en PWA standalone, un appel peut rester SANS reponse
 * (ni succes, ni erreur, meme le timeout des PositionOptions ne se de-
 * clenche pas). On court-circuite ca avec un watchdog JavaScript : s'il
 * gagne la course, on echoue avec un code 3 (TIMEOUT) pour remonter un
 * etat exploitable par l'UI.
 */
function fetchPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const watchdog = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(Object.assign(new Error("Geolocation sans reponse (bug iOS PWA standalone)"), { code: 3 }));
    }, 12_000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(watchdog);
        resolve({
          latitude: Math.round(position.coords.latitude * 1000) / 1000,
          longitude: Math.round(position.coords.longitude * 1000) / 1000,
        });
      },
      (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(watchdog);
        reject(error);
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 10_000 },
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

  /**
   * Classe l'erreur Geolocation en statut exploitable par l'UI :
   *  - code 1 : permission refusee (a re-active via les reglages)
   *  - code 2 : position indisponible (services de localisation coupes)
   *  - code 3 : timeout / pas de reponse (bug iOS PWA standalone)
   */
  const classifyError = React.useCallback((error: unknown) => {
    const geolocationError = error as GeolocationPositionError | undefined;
    const code = geolocationError?.code;
    if (code === 1) {
      setStatus("denied");
    } else if (code === 2) {
      setStatus("unavailable");
    } else {
      setStatus("timeout");
    }
  }, []);

  const request = React.useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    fetchPosition()
      .then(applyCoords)
      .catch(classifyError);
  }, [applyCoords, classifyError]);

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
