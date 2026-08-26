import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { isRtlLanguage } from "@/lib/rtl";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import tr from "./locales/tr.json";
import ur from "./locales/ur.json";
import id from "./locales/id.json";
import ru from "./locales/ru.json";

export const SUPPORTED_LANGUAGES = ["fr", "en", "es", "de", "tr", "ur", "id", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "qurandeen-ui-language";

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored as SupportedLanguage;
  }
  return "fr";
}

function applyDocumentDirection(language: string) {
  document.documentElement.lang = language;
  document.documentElement.dir = isRtlLanguage(language) ? "rtl" : "ltr";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    de: { translation: de },
    tr: { translation: tr },
    ur: { translation: ur },
    id: { translation: id },
    ru: { translation: ru },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (language) => {
  window.localStorage.setItem(STORAGE_KEY, language);
  applyDocumentDirection(language);
});

applyDocumentDirection(i18n.language);

export default i18n;
