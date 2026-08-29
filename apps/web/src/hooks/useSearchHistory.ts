import * as React from "react";

const STORAGE_KEY = "myqurandeen:search-history";
const MAX_ENTRIES = 8;

function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    // localStorage indisponible (navigation privee, quota, etc.) - degrade sans historique.
    return [];
  }
}

function writeHistory(entries: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Rien a faire : l'historique reste seulement en memoire pour cette session.
  }
}

/**
 * Historique de recherche local au navigateur (pas de compte requis, ne
 * quitte jamais l'appareil). Les dernieres recherches distinctes
 * (insensible a la casse) sont gardees, plus recente en premier.
 *
 * add()/remove()/clear() ecrivent dans localStorage de maniere synchrone et
 * directe (pas depuis l'interieur du callback de setState) : un clic sur une
 * suggestion declenche a la fois cet appel ET une navigation React Router
 * dans le meme gestionnaire d'evenement, ce qui demonte ce composant avant
 * que React ne traite la mise a jour d'etat - si l'ecriture disque
 * dependait de ce callback, elle etait silencieusement perdue.
 */
export function useSearchHistory() {
  const [history, setHistory] = React.useState<string[]>(() => readHistory());

  const add = React.useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const next = [trimmed, ...readHistory().filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(
      0,
      MAX_ENTRIES,
    );
    writeHistory(next);
    setHistory(next);
  }, []);

  const remove = React.useCallback((query: string) => {
    const next = readHistory().filter((q) => q !== query);
    writeHistory(next);
    setHistory(next);
  }, []);

  const clear = React.useCallback(() => {
    writeHistory([]);
    setHistory([]);
  }, []);

  return { history, add, remove, clear };
}
