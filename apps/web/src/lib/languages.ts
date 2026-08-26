const LANGUAGE_LABELS: Record<string, string> = {
  ar: "Arabe",
  en: "Anglais",
  fr: "Francais",
  es: "Espagnol",
  de: "Allemand",
  tr: "Turc",
  ur: "Ourdou",
  id: "Indonesien",
  ru: "Russe",
};

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code.toLowerCase()] ?? code.toUpperCase();
}

/** Nom de la langue dans sa propre langue (pour le selecteur de langue de l'interface). */
const LANGUAGE_AUTONYMS: Record<string, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  tr: "Türkçe",
  ur: "اردو",
  id: "Indonesia",
  ru: "Русский",
};

export function languageAutonym(code: string): string {
  return LANGUAGE_AUTONYMS[code.toLowerCase()] ?? code.toUpperCase();
}
