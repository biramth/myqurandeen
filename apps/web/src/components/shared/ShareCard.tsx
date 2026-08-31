import * as React from "react";
import { BookOpen } from "lucide-react";
import { SITE_URL } from "./PageMeta";

export interface ShareCardProps {
  title: string;
  body?: string;
  arabicText?: string;
  transliteration?: string;
  source?: string;
}

/**
 * Paliers de taille du plus grand au plus petit - voir le mecanisme
 * d'auto-ajustement plus bas. Descendre les paliers rétrécit le texte sans
 * jamais le tronquer : le contenu partagé doit rester lisible dans son
 * intégralité (arabe + translitteration + traduction), pas une version
 * coupée. Seul un contenu vraiment demesure (voir SAFETY_CAP) est encore
 * coupe, en tout dernier recours.
 */
const TIERS = [
  { arabic: "text-3xl leading-loose", transliteration: "text-lg italic leading-relaxed", body: "text-xl leading-relaxed" },
  { arabic: "text-2xl leading-loose", transliteration: "text-base italic leading-relaxed", body: "text-lg leading-relaxed" },
  { arabic: "text-xl leading-relaxed", transliteration: "text-sm italic leading-relaxed", body: "text-base leading-relaxed" },
  { arabic: "text-lg leading-relaxed", transliteration: "text-sm italic leading-relaxed", body: "text-sm leading-relaxed" },
  { arabic: "text-base leading-relaxed", transliteration: "text-xs italic leading-relaxed", body: "text-sm leading-relaxed" },
  { arabic: "text-sm leading-relaxed", transliteration: "text-xs italic leading-relaxed", body: "text-xs leading-relaxed" },
  { arabic: "text-xs leading-relaxed", transliteration: "text-[10px] italic leading-relaxed", body: "text-[11px] leading-relaxed" },
] as const;

/** Filet de securite pour un contenu vraiment demesure (pas le comportement normal) - coupe a la limite de mot. */
const SAFETY_CAP = 1200;
function safetyTruncate(text: string): string {
  if (text.length <= SAFETY_CAP) return text;
  const cut = text.slice(0, SAFETY_CAP);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Carte visuelle 9:16 (format "story") capturee en image pour le partage -
 * voir ShareButton. Rendue a taille reduite (360x640, ratio identique a la
 * cible 1080x1920) et capturee avec un facteur d'echelle x3, plutot que
 * layoutee directement en pleine taille.
 *
 * Auto-ajustement de la taille du texte : le contenu (arabe + translitteration
 * + traduction) doit rester ENTIER, jamais coupe - on mesure la hauteur reelle
 * du bloc de texte apres rendu et on redescend d'un palier de taille tant que
 * ca deborde, plutot que de tronquer par nombre de caracteres (heuristique
 * peu fiable : la largeur d'un caractere arabe/latin varie trop pour bien
 * deviner sans mesurer). `useLayoutEffect` : le reglage se stabilise avant la
 * peinture du navigateur, aucun scintillement visible entre paliers.
 *
 * CSS volontairement limite a flexbox + fond en degrade (pas de
 * backdrop-filter/grid complexe) : points de fragilite connus de la famille
 * de librairies de capture DOM-vers-image (foreignObject SVG) sur Safari/iOS.
 */
export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { title, body, arabicText, transliteration, source },
  ref,
) {
  const safeArabic = arabicText ? safetyTruncate(arabicText) : undefined;
  const safeTransliteration = transliteration ? safetyTruncate(transliteration) : undefined;
  const safeBody = body ? safetyTruncate(body) : undefined;
  const hasAnyText = safeArabic || safeTransliteration || safeBody;

  const contentRef = React.useRef<HTMLDivElement>(null);
  const [tierIndex, setTierIndex] = React.useState(0);

  // La police arabe (sous-ensemble custom, @font-face brut dans index.css)
  // peut ne pas encore etre chargee au premier rendu : mesurer avant qu'elle
  // arrive utiliserait les metriques de la police de repli (generalement
  // plus etroite), sous-estimant l'espace reellement necessaire. On
  // re-declenche donc une mesure des que les polices sont pretes.
  const [fontsReady, setFontsReady] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    Promise.all([document.fonts.load("700 32px Amiri"), document.fonts.load("500 16px Inter"), document.fonts.ready])
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFontsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reinitialise au plus grand palier des que le contenu partage change
  // (autre page/dua) - sinon un reglage etroit reste de la fois precedente.
  React.useLayoutEffect(() => {
    setTierIndex(0);
  }, [safeArabic, safeTransliteration, safeBody]);

  // Ne retrecit jamais que d'un cran par re-mesure : on ne "regrandit" pas
  // une fois retreci (evite tout risque d'oscillation), ce qui est sans
  // consequence pratique ici (seul un depassement reel declenche un cran).
  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (el.scrollHeight > el.clientHeight && tierIndex < TIERS.length - 1) {
      setTierIndex((i) => i + 1);
    }
  }, [tierIndex, safeArabic, safeTransliteration, safeBody, fontsReady]);

  const tier = TIERS[tierIndex];

  return (
    <div
      ref={ref}
      className="flex h-[640px] w-[360px] flex-col justify-between overflow-hidden p-8 text-white"
      style={{ background: "linear-gradient(160deg, #1d726b 0%, #123f3b 100%)" }}
    >
      <div ref={contentRef} className="flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden text-center">
        {safeArabic && (
          <p dir="rtl" lang="ar" className={`font-arabic font-bold ${tier.arabic}`}>
            {safeArabic}
          </p>
        )}
        {safeTransliteration && <p className={`text-white/80 ${tier.transliteration}`}>{safeTransliteration}</p>}
        {safeBody && <p className={`font-medium text-white/90 ${tier.body}`}>{safeBody}</p>}
        {!hasAnyText && <p className="text-2xl font-semibold leading-loose">{title}</p>}
      </div>

      <div className="flex flex-col items-center gap-4">
        {source && (
          <>
            <div className="h-px w-16 bg-white/25" />
            <p className="px-4 text-center text-xs font-medium text-white/70">{source}</p>
          </>
        )}
        <div className="flex items-center gap-1.5 text-white/90">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-semibold">myQurandeen</span>
        </div>
        <p className="text-[11px] text-white/50">{SITE_URL.replace(/^https?:\/\//, "")}</p>
      </div>
    </div>
  );
});
