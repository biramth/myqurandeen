/**
 * Service worker : notifications push + un cache "network-first" minimise
 * pour un retour fluide sur le site :
 *  - app-shell (navigations) : network-first avec repli sur le shell cache,
 *    => le site s'ouvre meme hors-ligne une fois visite.
 *  - assets statiques hashes (JS/CSS/polices/images) : stale-while-revalidate,
 *    => fichiers immuables servis quasi instantanement au retour.
 * Les requetes cross-origin (API sur onrender.com) et non-GET sont laissees
 * telles quelles. Le cache est versionne : un changement de code ici doit
 * augmenter les versions pour eviter de servir du stale.
 */

const SHELL_CACHE = "myqurandeen-shell-v1";
const ASSET_CACHE = "myqurandeen-assets-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    // Precache de l'app-shell : sert de fallback offline pour les navigations.
    caches.open(SHELL_CACHE).then((cache) => cache.add("/")).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

/** Network d'abord, repli sur le shell cache si hors-ligne. */
async function navigationHandler(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      // Toujours sous la meme cle "/" : on rafraichit le shell sans le dupliquer.
      await cache.put("/", response.clone());
    }
    return response;
  } catch {
    return (await cache.match("/")) || new Response("Hors-ligne", { status: 503 });
  }
}

/** Stale-while-revalidate pour les assets immuables (noms hashes). */
async function assetHandler(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(request));
    return;
  }

  if (/\.(?:js|css|woff2?|ttf|eot|otf|svg|png|jpe?g|webp|gif|avif|ico)(?:\?.*)?$/i.test(url.pathname)) {
    event.respondWith(assetHandler(request));
  }
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
      icon: "/icon-192.png",
      badge: "/icon-192.png",
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