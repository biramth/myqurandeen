import * as React from "react";

const STORAGE_KEY = "qurandeen-tajweed-enabled";

function readInitial(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false; // localStorage indisponible (navigation privee, permissions) - defaut desactive.
  }
}

// Store externe partage (module-level) plutot qu'un useState local par
// composant : TajweedControl (bouton) et SurahDetailPage/VersePage (texte
// colore) sont des instances de composant DIFFERENTES qui appellent chacune
// useTajweedToggle() - avec un useState local, cliquer le bouton ne mettait
// a jour QUE l'etat React de TajweedControl (et localStorage), jamais celui
// de la page qui decide d'afficher TajweedText ou le texte brut : le bouton
// passait bien a "Tajwid active" mais aucune coloration n'apparaissait
// jamais. useSyncExternalStore (React 18) est le mecanisme prevu pour
// exactement ce cas : un etat partage hors React, avec re-rendu de TOUS les
// abonnes des qu'il change.
let currentValue = readInitial();
const listeners = new Set<() => void>();

function setValue(next: boolean): void {
  currentValue = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Persistance best-effort - le reglage reste actif pour la session en cours.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): boolean {
  return currentValue;
}

/**
 * Reglage "coloration tajwid" (voir ROADMAP.md 3.1) - partage entre tous les
 * composants qui l'utilisent (bouton d'activation, page de sourate, page de
 * verset isole) via un store externe, pas un useState local par composant.
 */
export function useTajweedToggle(): [boolean, (next: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSnapshot, () => false);
  return [enabled, setValue];
}
