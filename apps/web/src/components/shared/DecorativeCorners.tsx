/**
 * Quatre fleurons d'angle (une seule illustration SVG, reprise 4 fois par
 * simple symetrie miroir - garantit une parfaite coherence visuelle entre les
 * coins). A inserer comme enfant d'un conteneur `position: relative` deja
 * muni de la classe `.decorative-frame` (double filet, voir index.css) - le
 * meme principe que l'enluminure de marge des manuscrits coraniques
 * classiques : double filet + petit motif courbe a chaque angle.
 */
function CornerMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} className={className} aria-hidden="true">
      <path d="M 1 15 A 14 14 0 0 1 15 1" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" />
      <path d="M 1 9 A 8 8 0 0 1 9 1" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" />
      <circle cx="4.5" cy="4.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function DecorativeCorners() {
  return (
    <>
      <CornerMotif className="pointer-events-none absolute left-1 top-1 text-primary/60" />
      <CornerMotif className="pointer-events-none absolute right-1 top-1 -scale-x-100 text-primary/60" />
      <CornerMotif className="pointer-events-none absolute bottom-1 left-1 -scale-y-100 text-primary/60" />
      <CornerMotif className="pointer-events-none absolute bottom-1 right-1 -scale-x-100 -scale-y-100 text-primary/60" />
    </>
  );
}
