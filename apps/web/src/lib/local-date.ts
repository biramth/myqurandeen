/**
 * Date calendaire du jour dans le fuseau horaire local du navigateur, au
 * format YYYY-MM-DD. Ne pas utiliser `new Date().toISOString()` ici : elle
 * convertit en UTC et peut renvoyer la mauvaise date pres de minuit selon le
 * fuseau de l'utilisateur (ex. 23h locale = deja le lendemain en UTC+).
 * Utilise pour la serie d'activite quotidienne (streak).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
