/**
 * Helpers purs du planificateur de notifications (rappel, rotation, dua,
 * alerte serie) - extraits hors du service pour etre testables sans tirer
 * NestJS ni les imports ESM de node_modules. Aucune dependance externe.
 */

export interface LocalClock {
  hhmm: string;
  dayOfWeek: number;
  dateKey: string;
}

/**
 * Heure/jour/date "muraux" dans un fuseau IANA donne, sans dependre d'une
 * librairie de dates : `Intl.DateTimeFormat` fait deja tout le travail de
 * conversion et connait les regles DST a jour. `formatToParts` plutot que le
 * formattage en chaine + parsing, pour rester robuste aux locales.
 */
export function localClock(timeZone: string, at: Date = new Date()): LocalClock | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    }).formatToParts(at);
    const map: Record<string, string> = {};
    for (const part of parts) map[part.type] = part.value;
    // ICU rend parfois minuit "24" plutot que "00" avec hour12:false.
    const hour = map.hour === "24" ? "00" : map.hour;
    const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      hhmm: `${hour}:${map.minute}`,
      dayOfWeek: weekdayIndex[map.weekday] ?? 0,
      dateKey: `${map.year}-${map.month}-${map.day}`,
    };
  } catch {
    // Fuseau invalide/inconnu : ce rappel est ignore plutot que de faire echouer tout le tick.
    return null;
  }
}

/** Minutes ecoulees entre "maintenant" (hh:mm) et une cible "hh:mm" ; negatif si la cible est dans le futur. */
export function minutesSince(nowHhmm: string, targetHhmm: string): number {
  const [nh, nm] = nowHhmm.split(":").map(Number);
  const [th, tm] = targetHhmm.split(":").map(Number);
  return nh * 60 + nm - (th * 60 + tm);
}

/**
 * Anti-doublon "deja envoye" pour un creneau (rappel, rotation, dua matin/soir,
 * alerte serie) : renvoie vrai si le dernier envoi a eu lieu aujourd'hui (meme
 * jour calendaire local) ET apres l'heure cible actuelle du creneau.
 *
 * La simple comparaison du jour (dateKey) suffisait quand l'heure d'un creneau
 * etait immuable. Mais si l'utilisateur deplace l'heure du creneau vers plus
 * tard dans la meme journee (ex. matin de 06:00 a 08:05), l'ancien envoi de
 * 06:00 doit etre considere comme ne couvrant PAS la nouvelle cible 08:05 :
 * sans cette verif d'heure, le creneau restait marque "fait" pour toute la
 * journee et la notification n'etait jamais envoyee.
 */
export function alreadySentToday(
  timezone: string,
  lastSentAt: Date,
  targetHhmm: string,
  clock: LocalClock,
): boolean {
  const sentClock = localClock(timezone, lastSentAt);
  if (!sentClock || sentClock.dateKey !== clock.dateKey) return false;
  // La cible est "couverte" si l'envoi a eu lieu a l'heure cible ou apres :
  // dans ce cas, on ne re-envoie pas. Sinon (envoi avant la cible), on envoie.
  return minutesSince(sentClock.hhmm, targetHhmm) >= 0;
}

/**
 * Fenetre de tolerantance pour les notifications : si l'instance s'est
 * reveillee tard (service endormi, deploiement...), on envoie quand meme les
 * rappels dont l'heure est passee de moins de GRACE_MINUTES. Au-dela, on
 * saute (un rappel de 6h arrive a 8h n'a plus de sens).
 */
const GRACE_MINUTES = 45;
export { GRACE_MINUTES };
