/**
 * Service worker minimal, uniquement pour les notifications push (rappels
 * dua/lecture). Pas de cache offline ici - myQurandeen reste une app en
 * ligne, ce service worker ne sert qu'a recevoir les push et ouvrir la
 * bonne page au clic, meme si aucun onglet n'est ouvert.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const { title, body, url } = payload;
  event.waitUntil(
    self.registration.showNotification(title || "myQurandeen", {
      body: body || "",
      data: { url: url || "/" },
      tag: url, // une nouvelle notif pour la meme cible remplace l'ancienne plutot que de s'empiler
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Reutilise un onglet myQurandeen deja ouvert (et navigue vers la
      // cible) plutot que d'en empiler un nouveau a chaque notification.
      for (const client of clients) {
        if ("focus" in client) {
          client.postMessage({ type: "notification-navigate", url: targetUrl });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
