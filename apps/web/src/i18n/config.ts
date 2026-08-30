import i18n from "i18next";
import type { BackendModule, ReadCallback } from "i18next";
import { initReactI18next } from "react-i18next";
import { isRtlLanguage } from "@/lib/rtl";

/**
 * Les traductions sont chargees en lazy (une seule langue au demarrage) pour
 * ne pas emporter les ~200 ko des 8 fichiers JSON dans le bundle initial.
 * `en` reste importe statiquement : c'est la langue de repli (`fallbackLng`),
 * donc l'interface ne peut jamais rester vide meme si un JSON ne charge pas.
 */
import en from "./locales/en.json";

export const SUPPORTED_LANGUAGES = ["fr", "en", "es", "de", "tr", "ur", "id", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Chaque entree devient un petit chunk Vite dedie (fr.json, es.json, ...) :
 * seules les langues reellement utilisees sont telechargees.
 */
const localeLoaders: Record<SupportedLanguage, () => Promise<{ default: Record<string, unknown> }>> = {
  fr: () => import("./locales/fr.json"),
  en: () => import("./locales/en.json"),
  es: () => import("./locales/es.json"),
  de: () => import("./locales/de.json"),
  tr: () => import("./locales/tr.json"),
  ur: () => import("./locales/ur.json"),
  id: () => import("./locales/id.json"),
  ru: () => import("./locales/ru.json"),
};

/** Backend i18next minimal : resout chaque langue via son import dynamique. */
class JsonLocaleBackend implements BackendModule {
  type = "backend" as const;

  init(): void {
    // Aucune configuration necessaire : tout est dans `localeLoaders`.
  }

  read(language: string, _namespace: string, callback: ReadCallback): void {
    const loader = localeLoaders[language as SupportedLanguage];
    if (!loader) {
      callback(new Error(`Locale inconnue : ${language}`), null);
      return;
    }
    loader()
      .then(({ default: bundle }) => callback(null, bundle))
      .catch((error) => callback(error, null));
  }
}

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

const i18nReady: Promise<unknown> = i18n
  .use(initReactI18next)
  .use(JsonLocaleBackend)
  .init({
    resources: {
      // Seule la langue de repli est fournie statiquement (voir plus haut).
      en: { translation: en },
    },
    lng: getInitialLanguage(),
    fallbackLng: "en",
    load: "currentOnly",
    interpolation: { escapeValue: false },
  });

i18n.on("languageChanged", (language) => {
  window.localStorage.setItem(STORAGE_KEY, language);
  applyDocumentDirection(language);
});

applyDocumentDirection(i18n.language);

export { i18nReady };
export default i18n;