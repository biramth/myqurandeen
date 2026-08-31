import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/**
 * Base publique du site - constante en dur plutot qu'une variable d'env :
 * aucune VITE_SITE_URL n'existe aujourd'hui, et cette valeur ne change
 * jamais selon l'environnement de build (contrairement a VITE_API_URL).
 * Meme domaine que WEB_URL cote API (voir apps/api/.env).
 */
export const SITE_URL = "https://myqurandeen.vercel.app";

const DEFAULT_DESCRIPTION =
  "myQurandeen - plateforme open-source d'étude du Coran, du hadith, du tafsir, du fiqh et de l'histoire de l'Islam.";

/**
 * Construit l'URL de l'image OG/Twitter dynamique (endpoint /api/og, reecrit
 * par Vercel vers le backend NestJS qui genere la carte cote serveur avec
 * satori+sharp) pour un contenu donne - la version "carte visuelle" que les
 * crawleurs d'apercu de lien (WhatsApp, X, Discord, Slack...) verront quand
 * on colle le lien, au lieu de l'icone statique.
 * Les champs sont encodes en query string ; vide si aucun contenu (champ
 * optionnel, PageMeta retombe alors sur l'icone de marque).
 */
export function buildOgImage(params: {
  title?: string;
  arabicText?: string;
  transliteration?: string;
  body?: string;
  source?: string;
}): string {
  const search = new URLSearchParams();
  if (params.title) search.set("title", params.title);
  if (params.arabicText) search.set("arabic", params.arabicText);
  if (params.transliteration) search.set("transliteration", params.transliteration);
  if (params.body) search.set("body", params.body);
  if (params.source) search.set("source", params.source);
  return `${SITE_URL}/api/og?${search.toString()}`;
}

/**
 * Marque une URL partagee avec des parametres UTM - sans ca, impossible de
 * distinguer dans les statistiques le trafic venu d'un partage (in-app,
 * façon Spotify) du reste. `medium` distingue la surface (contenu, serie,
 * succes...) pour affiner l'analyse plus tard.
 */
export function withShareUtm(url: string, medium: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("utm_source", "share");
  parsed.searchParams.set("utm_medium", medium);
  parsed.searchParams.set("utm_campaign", "content_share");
  return parsed.toString();
}

interface PageMetaProps {
  /** Titre de la page (sans le suffixe " · myQurandeen", ajoute automatiquement). */
  title?: string | null;
  /** Description meta/OG - repli sur une description generique si omise (jamais vide, voir DEFAULT_DESCRIPTION). */
  description?: string;
  /** URL absolue de l'image OG/Twitter - par defaut l'image de marque statique. */
  image?: string;
  /** URL canonique absolue - par defaut deduite du chemin courant. */
  url?: string;
  /** Pages privees (auth, admin, profil...) : empeche l'indexation. */
  noindex?: boolean;
}

/**
 * Remplace useDocumentTitle : pose aussi la description, le canonical, les
 * tags Open Graph/Twitter Card et la langue du document - pas seulement le
 * titre d'onglet. S'appuie sur react-helmet-async (HelmetProvider pose dans
 * AppProviders). A rendre au maximum une seule instance active a la fois
 * dans l'arbre (typiquement une par page) : un <PageMeta/> permanent monte
 * en parallele d'un autre entrait en conflit sous React.StrictMode (les deux
 * jeux de balises coexistaient au lieu que le second remplace le premier).
 *
 * Le filet de securite sitewide (pour un crawler qui n'execute pas de JS, ou
 * le tout premier paint avant que React ne monte) vit dans les balises
 * statiques marquees `data-rh-fallback` d'index.html - ce composant les
 * retire au premier montage : sinon elles resteraient les PREMIERES du
 * <head> (Helmet ajoute les siennes ensuite, ne retire jamais du HTML
 * statique), et Google ne retient que la premiere balise description/OG
 * rencontree - la version generique gagnerait alors toujours.
 */
export function PageMeta({ title, description, image, url, noindex }: PageMetaProps) {
  const { i18n } = useTranslation();
  const location = useLocation();

  React.useEffect(() => {
    document.querySelectorAll('[data-rh-fallback="true"]').forEach((el) => el.remove());
  }, []);

  const resolvedTitle = title ? `${title} · myQurandeen` : "myQurandeen";
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION;
  const resolvedUrl = url ?? `${SITE_URL}${location.pathname}`;
  // Repli sur l'icone de l'app (deja presente, carree 512x512) plutot qu'une
  // bannniere 1200x630 dediee - cette derniere n'existe pas encore (asset a
  // designer separement, pas quelque chose qu'on genere en code). Un logo en
  // og:image reste largement mieux que rien, et remplacable sans toucher au code.
  const resolvedImage = image ?? `${SITE_URL}/icon-512.png`;

  return (
    <Helmet htmlAttributes={{ lang: i18n.language }}>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={resolvedUrl} />
      <meta property="og:site_name" content="myQurandeen" />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
