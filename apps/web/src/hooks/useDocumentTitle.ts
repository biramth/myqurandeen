import * as React from "react";

/**
 * Titre d'onglet par page - sans ca, toutes les pages partagent le meme
 * titre "myQurandeen" statique (index.html), ce qui rend l'historique du
 * navigateur, les onglets ouverts et les favoris illisibles des qu'on visite
 * plus d'une page. `title` peut etre `undefined` (ex. donnee pas encore
 * chargee) : le titre par defaut reste alors affiche le temps du chargement.
 */
export function useDocumentTitle(title?: string | null): void {
  React.useEffect(() => {
    document.title = title ? `${title} · myQurandeen` : "myQurandeen";
  }, [title]);
}
