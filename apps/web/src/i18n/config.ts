import i18n from "i18next";
import type { BackendModule, ReadCallback } from "i18next";
import { initReactI18next } from "react-i18next";
import { isRtlLanguage } from "@/lib/rtl";

/**
 * Les traductions sont chargees en lazy (une seule langue au demarrage) pour
 * ne pas emporter les ~200 ko des 8 fichiers JSON dans le bundle initial.
 * Aucune langue n'est fournie via `resources` : i18next fait TOUJOURS appel au
 * backend ci-dessous (sinon il court-circuite le backend et seule `en`
 * resterait disponible, ce qui rendait le changement de langue inoperant).
 */
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

const initial = getInitialLanguage();

const i18nReady: Promise<unknown> = i18n
  .use(initReactI18next)
  .use(new JsonLocaleBackend())
  .init({
    lng: initial,
    fallbackLng: "en",
    load: "currentOnly",
    interpolation: { escapeValue: false },
  });

i18n.on("languageChanged", (language) => {
  window.localStorage.setItem(STORAGE_KEY, language);
  applyDocumentDirection(language);
});

// Etat de depart fiable (i18n.language n'est pas encore resolu au moment de
// l'import : sans `resources`, i18next ne le pose qu'a la fin de l'init).
applyDocumentDirection(initial);

export { i18nReady };
export default i18n;