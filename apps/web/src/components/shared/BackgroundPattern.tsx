import { useAppearance } from "@/components/shared/appearance-provider";

const TILE = 64;
const MARGIN = 10;
const SQUARE_SIZE = TILE - MARGIN * 2;
const HALF_DIAGONAL = SQUARE_SIZE / 2;
const CENTER = TILE / 2;

/**
 * Motif geometrique islamique discret, optionnel (voir PersonalizationMenu).
 * Construit a partir de deux carres superposes - l'un aligne sur les axes,
 * l'autre tourne de 45 degres et dimensionne pour que ses sommets touchent
 * le milieu des cotes du premier - formant l'etoile a huit branches classique
 * de ce motif (les memes proportions que le symbole "rub' al-hizb" utilise
 * pour marquer les divisions du Coran). Construction purement geometrique
 * (coordonnees calculees), donc garantie de se raccorder parfaitement en
 * mosaique, sans discontinuite visuelle aux jointures.
 */
export function BackgroundPattern() {
  const { backgroundPattern } = useAppearance();
  if (!backgroundPattern) return null;

  const diamondPoints = [
    `${CENTER},${CENTER - HALF_DIAGONAL}`,
    `${CENTER + HALF_DIAGONAL},${CENTER}`,
    `${CENTER},${CENTER + HALF_DIAGONAL}`,
    `${CENTER - HALF_DIAGONAL},${CENTER}`,
  ].join(" ");

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full text-foreground/[0.05]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="qurandeen-bg-pattern" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          <rect x={MARGIN} y={MARGIN} width={SQUARE_SIZE} height={SQUARE_SIZE} fill="none" stroke="currentColor" strokeWidth={1} />
          <polygon points={diamondPoints} fill="none" stroke="currentColor" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#qurandeen-bg-pattern)" />
    </svg>
  );
}
