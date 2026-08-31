import * as React from "react";
import { BookOpen } from "lucide-react";
import { SITE_URL } from "./PageMeta";

export interface ShareCardProps {
  title: string;
  body?: string;
  arabicText?: string;
  source?: string;
}

/**
 * Coupe a la limite de mot la plus proche (jamais en plein milieu d'un mot -
 * evite aussi tout risque de couper une sequence de diacritiques arabes).
 */
function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Echelle typographique par paliers de longueur plutot qu'un `clamp()`
 * fluide : le comportement RTL/arabe sous scaling continu est imprevisible
 * avec ce type de capture DOM-vers-image (voir modern-screenshot). 4 paliers,
 * du dua court (gros texte) a la longue traduction de hadith (petit texte).
 */
function heroSizeClass(text: string): string {
  const len = text.length;
  if (len <= 40) return "text-4xl leading-loose";
  if (len <= 120) return "text-2xl leading-loose";
  if (len <= 280) return "text-lg leading-relaxed";
  return "text-base leading-relaxed";
}

function companionSizeClass(text: string): string {
  const len = text.length;
  if (len <= 60) return "text-lg leading-relaxed";
  if (len <= 160) return "text-base leading-relaxed";
  return "text-sm leading-relaxed";
}

/**
 * Carte visuelle 9:16 (format "story") capturee en image pour le partage -
 * voir ShareButton. Rendue a taille reduite (360x640, ratio identique a la
 * cible 1080x1920) et capturee avec un facteur d'echelle x3, plutot que
 * layoutee directement en pleine taille.
 *
 * CSS volontairement limite a flexbox + fond en degrade (pas de
 * backdrop-filter/grid complexe) : points de fragilite connus de la famille
 * de librairies de capture DOM-vers-image (foreignObject SVG) sur Safari/iOS.
 */
export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { title, body, arabicText, source },
  ref,
) {
  // Budget de longueur combine quand arabe + traduction coexistent (cas du
  // hadith) : la traduction est tronquee en premier (texte secondaire),
  // l'arabe seulement si le total reste trop long malgre tout.
  const hasBoth = Boolean(arabicText && body);
  const truncatedBody = body ? truncateAtWord(body, hasBoth ? 180 : 280) : undefined;
  const truncatedArabic = arabicText ? truncateAtWord(arabicText, 280) : undefined;

  return (
    <div
      ref={ref}
      className="flex h-[640px] w-[360px] flex-col justify-between overflow-hidden p-8 text-white"
      style={{ background: "linear-gradient(160deg, #1d726b 0%, #123f3b 100%)" }}
    >
      <div />

      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        {truncatedArabic && (
          <p dir="rtl" lang="ar" className={`font-arabic font-bold ${heroSizeClass(truncatedArabic)}`}>
            {truncatedArabic}
          </p>
        )}
        {truncatedBody && (
          <p className={`font-medium text-white/90 ${!truncatedArabic ? heroSizeClass(truncatedBody) : companionSizeClass(truncatedBody)}`}>
            {truncatedBody}
          </p>
        )}
        {!truncatedArabic && !truncatedBody && <p className="text-2xl font-semibold leading-loose">{title}</p>}
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
