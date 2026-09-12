import { useAppearance } from "@/components/shared/appearance-provider";

const TILE = 72;
const CENTER = TILE / 2;
const OUTER_RADIUS = TILE / 2 - 6;
const INNER_RADIUS = OUTER_RADIUS * 0.4;
const POINTS_COUNT = 8;

/**
 * Trace une etoile a N branches (octagramme pour N=8) : 2*N sommets alternant
 * rayon exterieur (pointes) et rayon interieur (creux), repartis a
 * intervalles reguliers - la construction parametrique classique de ce type
 * de motif, garantissant une etoile symetrique correcte quel que soit le
 * nombre de branches ou le rayon choisi.
 */
function starPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const coords: string[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    coords.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return coords.join(" ");
}

/**
 * Motif geometrique islamique discret, optionnel (voir PersonalizationMenu) :
 * une etoile a huit branches (octagramme) par carreau, le motif de mosaique
 * (zellige) le plus repandu dans l'architecture islamique classique - avec
 * un petit octogone concentrique et un point central, comme la rosace
 * gravee au coeur de la plupart de ces etoiles sur les vrais carreaux.
 * Construction entierement parametrique (coordonnees calculees via
 * `starPoints`), donc garantie de rester symetrique et de se raccorder
 * parfaitement en mosaique.
 */
export function BackgroundPattern() {
  const { backgroundPattern } = useAppearance();
  if (!backgroundPattern) return null;

  const star = starPoints(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, POINTS_COUNT);
  const innerOctagon = starPoints(CENTER, CENTER, INNER_RADIUS * 0.85, INNER_RADIUS * 0.85, POINTS_COUNT);

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full text-foreground/[0.06]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="qurandeen-bg-pattern" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          <polygon points={star} fill="none" stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
          <polygon points={innerOctagon} fill="none" stroke="currentColor" strokeWidth={0.75} />
          <circle cx={CENTER} cy={CENTER} r={1.25} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#qurandeen-bg-pattern)" />
    </svg>
  );
}
