import { next } from "@vercel/functions";

const BACKEND_ORIGIN = "https://myqurandeen-api.onrender.com";
const OG_PAGE_ENDPOINT = `${BACKEND_ORIGIN}/og-page`;

/**
 * Detection des crawlers d'apercu de lien (share preview) qui n'executent pas
 * le JS de la SPA : ils doivent recevoir le vrai head Open Graph par contenu,
 * pas le shell statique (index.html) qui renvoie toujours l'icone.
 *
 * On ne cible QUE ces robots de partage (WhatsApp, X, Discord, Slack,
 * Facebook, LinkedIn, Telegram, Reddit, Pinterest...) et PAS Googlebot et cie,
 * pour ne pas degrader l'indexation du contenu reel (la SPA + ses balises de
 * repli data-rh-fallback suffisent pour le SEO classique).
 */
const PREVIEW_BOT_REGEX =
  /(whatsapp\/|discordbot|slackbot|twitterbot|facebookexternalhit|facebookcatalog|linkedinbot|telegrambot|redditbot|pinterest|vkShare|tumblr|snapchat|Pinterestbot|Pingdom)/i;

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const url = new URL(request.url);

  if (PREVIEW_BOT_REGEX.test(userAgent)) {
    const prerenderUrl = new URL(OG_PAGE_ENDPOINT);
    prerenderUrl.searchParams.set("path", url.pathname);
    try {
      const upstream = await fetch(prerenderUrl.toString());
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": upstream.headers.get("cache-control") ?? "public, max-age=86400",
        },
      });
    } catch (error) {
      // En cas d'echec du backend, on laisse passer vers la SPA plutot que de
      // casser le partage.
      console.error("og-page fetch failed", error);
      return next();
    }
  }

  return next();
}

export const config = {
  matcher: [
    "/quran/:surah/:verse",
    "/hadith/:collection/:number",
    "/duas/:slug",
    "/history/event/:slug",
    "/concepts/:slug",
    "/scholars/:slug",
  ],
};
