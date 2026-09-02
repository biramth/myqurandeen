import * as React from "react";

/**
 * Enregistre le service worker independamment de la sante push : permet le
 * cache hors-ligne de la coquille et des assests memes quand les
 * notifications ne sont pas configurees cote serveur. Le SW est partage
 * (coquille + assests + gestion des notifications) : un seul enregistrement
 * pour tout.
 */
export function useOfflineServiceWorker() {
  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (import.meta.env.DEV) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Environnement sans HTTPS/localhost (rare) - le reste de l'app fonctionne quand meme.
    });
  }, []);
}
