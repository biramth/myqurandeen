/** Libelles courts (D L M M J V S en francais) dans la langue courante, index 0 = dimanche comme Date#getDay() (2023-01-01 est un dimanche). */
export function weekdayLabels(locale: string): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(2023, 0, 1 + i)),
  );
}
