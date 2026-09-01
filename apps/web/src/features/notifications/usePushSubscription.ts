import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import { notificationsApi } from "./api";

/**
 * Web Push exige la cle serveur en Uint8Array, pas en base64url brut.
 * `new Uint8Array(length)` (rempli manuellement) plutot que
 * `Uint8Array.from(...)` : ce dernier est type `Uint8Array<ArrayBufferLike>`
 * par lib.dom, incompatible avec `BufferSource` attendu par
 * `applicationServerKey` (qui exige specifiquement `ArrayBuffer`).
 */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Position WGS84 optionnelle pour le calcul des horaires de priere (dua du
 * matin a l'aube, dua du soir a l'Isha). Best effort : jamais bloquant, jamais
 * remonte en erreur. Si la geolocalisation est indisponible ou refusee, le
 * serveur utilise le repli du fuseau horaire.
 */
function getCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    const timeout = window.setTimeout(() => resolve(null), 5000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timeout);
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {
        window.clearTimeout(timeout);
        resolve(null);
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000 },
    );
  });
}

export type PushSupport = "unsupported" | "unconfigured" | "ready";

/**
 * Etat + actions pour les notifications push : enregistre le service worker
 * au montage (si le navigateur les supporte), expose l'etat d'abonnement
 * courant, et gere l'aller-retour permission navigateur <-> backend.
 * Reste totalement inerte (support = "unconfigured") si le serveur n'a pas
 * de cles VAPID - meme principe que l'assistant IA (useAiEnabled).
 */
export function usePushSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  /**
   * iOS (et PWA en general) n'affiche la notification QUE si l'app est
   * ouverte en mode installe (standalone) : bouton "Ajouter a l'ecran
   * d'accueil" / icone du home screen. Detecte via navigator.standalone
   * (iOS) ou display-mode: standalone (Android/desktop).
   */
  const isStandalone = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      (navigator as Navigator & { standalone?: boolean }).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches
    );
  }, []);

  const { data: health } = useQuery({
    queryKey: ["notifications", "health"],
    queryFn: notificationsApi.health,
    staleTime: 5 * 60 * 1000,
  });

  const { data: subscribedData } = useQuery({
    queryKey: ["notifications", "subscribed"],
    queryFn: notificationsApi.isSubscribed,
    enabled: Boolean(user) && Boolean(health?.ready),
  });

  React.useEffect(() => {
    if (!health?.ready || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Environnement sans HTTPS/localhost (rare) - le reste de l'app fonctionne quand meme.
    });
  }, [health?.ready]);

  const support: PushSupport =
    typeof Notification === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)
      ? "unsupported"
      : !health?.ready
        ? "unconfigured"
        : "ready";

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!health?.vapidPublicKey) throw new Error("Notifications non configurees");
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        throw new Error("PERMISSION_DENIED");
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(health.vapidPublicKey),
        }));

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        // Cas rare (navigateur retourne un abonnement partiel) : on echoue
        // explicitement plutot que de resoudre silencieusement, sinon l'UI
        // affiche "abonne" sans jamais avoir appele le backend.
        throw new Error("INCOMPLETE_SUBSCRIPTION");
      }
      const coords = await getCoordinates();
      await notificationsApi.subscribe({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", "subscribed"] }),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await notificationsApi.unsubscribe(endpoint).catch(() => undefined);
      }
      // Même si le navigateur n'avait plus d'abonnement local (permission
      // révoquée côté OS ou contexte différent), on nettoie TOUT côté
      // serveur : sinon le bouton "Désactiver" semble ne rien faire.
      await notificationsApi.unsubscribeAll();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", "subscribed"] }),
  });

  return {
    support,
    permission,
    isStandalone,
    isSubscribed: subscribedData?.subscribed ?? false,
    subscribe: () => subscribeMutation.mutateAsync(),
    unsubscribe: () => unsubscribeMutation.mutateAsync(),
    isPending: subscribeMutation.isPending || unsubscribeMutation.isPending,
  };
}
