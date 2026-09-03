/** Helpers purs de generation XML de sitemap, sortis du service pour etre testables sans base de donnees. */

/** Base publique du site (pas une variable d'env dediee : voir le meme choix pour SITE_URL cote frontend, PageMeta.tsx). */
export const SITE_URL = "https://myqurandeen.vercel.app";

/** Chemin des sous-sitemaps, dans l'ordre où ils doivent apparaitre dans l'index. */
export const SITEMAP_PART_PATHS = [
  "/sitemap-data/static.xml",
  "/sitemap-data/quran.xml",
  "/sitemap-data/hadith.xml",
];

export interface SitemapUrl {
  loc: string;
  lastmod?: string | null;
}

export function formatDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/** Slugs/identifiants venant de la base (editoriaux, pas de saisie utilisateur libre) - echappe quand meme par prudence. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Serialise une liste d'URLs en sitemap XML valide. */
export function toXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const loc = escapeXml(`${SITE_URL}${u.loc}`);
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
      return `  <url><loc>${loc}</loc>${lastmod}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

/** Serialise un sitemap index (liste de sous-sitemaps). */
export function toIndexXml(parts: string[]): string {
  const body = parts.map((p) => `  <sitemap><loc>${escapeXml(`${SITE_URL}${p}`)}</loc></sitemap>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
