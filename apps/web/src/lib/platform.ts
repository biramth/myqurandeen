/**
 * Caracteristiques plateforme / navigateur du client, partagees entre le
 * module notifications et le bandeau d'installation PWA.
 */

/** iOS (iPhone/iPad/iPod) : Safari ne propose aucune invite d'installation
 * native (pas de `beforeinstallprompt`) - il faut guider l'utilisateur vers
 * "Ajouter a l'ecran d'accueil". Le test MacIntel + maxTouchPoints couvre
 * aussi les iPad a partir de Safari 13, qui se declarent comme des Mac. */
export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** L'app tourne deja comme PWA installee (hors navigateur) : `navigator
 * .standalone` (iOS) ou `display-mode: standalone` (Android/desktop). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}