import * as React from "react";
import { BookOpen, type LucideIcon } from "lucide-react";
import { SITE_URL } from "./PageMeta";

export interface StatShareCardProps {
  icon: LucideIcon;
  /** Gros texte principal - ex. "7 jours d'affilée !" ou le nom d'un succès. Chaine i18n courte et maitrisee. */
  headline: string;
  /** Texte secondaire court - ex. message de la StreakCard ou description d'un succes. */
  description?: string;
  /** Legende discrete en pied de carte - ex. record personnel ou date de deblocage. */
  source?: string;
}

/** Coupe a la limite de mot la plus proche - filet de securite, pas le mecanisme principal (voir commentaire plus bas). */
function safetyTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Carte "statistique" (serie de lecture, succes debloque...) - meme gabarit
 * visuel que ShareCard (fond degrade, 360x640, pied de marque identique),
 * dupliquee plutot qu'extraite en composant partage : la logique d'auto-
 * ajustement de ShareCard est trop entremelee avec son propre ref de mesure
 * pour une extraction a faible risque, et il n'y a que 2 cartes a ce stade -
 * pas encore de vraie duplication a factoriser (voir ShareCard.tsx).
 *
 * Pas de mecanisme d'auto-ajustement par palier ici : contrairement a
 * ShareCard (texte BDD/utilisateur de longueur tres variable), `headline`/
 * `description` sont ici des chaines i18n courtes et maitrisees (un nombre
 * de jours, le nom/la description d'un succes) - une taille fixe confortable
 * suffit, avec juste une troncature de securite genereuse sur `description`
 * en dernier recours.
 */
export const StatShareCard = React.forwardRef<HTMLDivElement, StatShareCardProps>(function StatShareCard(
  { icon: Icon, headline, description, source },
  ref,
) {
  const safeDescription = description ? safetyTruncate(description, 200) : undefined;

  return (
    <div
      ref={ref}
      className="flex h-[640px] w-[360px] flex-col justify-between overflow-hidden p-8 text-white"
      style={{ background: "linear-gradient(160deg, #1d726b 0%, #123f3b 100%)" }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <Icon className="h-16 w-16 text-amber-300" aria-hidden="true" />
        <p className="text-3xl font-bold leading-tight">{headline}</p>
        {safeDescription && <p className="text-base leading-relaxed text-white/85">{safeDescription}</p>}
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
