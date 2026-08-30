import * as React from "react";
import { isIos, isStandalone } from "@/lib/platform";

/**
 * Persistance locale du bandeau d'installation : re-affichage 7 jours apres
 * un "Plus tard", arret definitif apres "Ne plus afficher". localStorage
 * peut etre indisponible (navigation privee, quota) : on degrade simplement
 * sans historiser, le bandeau restera affichable.
 */
const LAST_DISMISSED_KEY = "pwa.install.lastDismissed";
const DISMISS_FOREVER_KEY = "pwa.install.never";
const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

type BeforeInstallPromptEvent = Omit<Event, "target"> & {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
};

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Navigation privee / quota plein : ignorable, le bandeau peut re-apparaitre.
  }
}

export type InstallPromptAction = "later" | "never";

/**
 * Logique du bandeau "Installer l'app" :
 *  - Android/desktop Chrome emet `beforeinstallprompt` quand le site est
 *    installable : on intercepte et on garde l'evenement pour pouvoir
 *    appeler `prompt()` au clic. L'evenement n'arrive jamais dans une app
 *    deja installee.
 *  - iOS : aucun evenement, on affiche directement un guide "Ajouter a
 *    l'ecran d'accueil" des qu'un iPhone/iPad non installe ouvre le site.
 *  - Deja installe (`standalone`) : jamais affiche.
 */
export function usePwaInstall() {
  const ios = React.useMemo(() => isIos(), []);
  const [installed, setInstalled] = React.useState(() => isStandalone());
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  const eligible = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    if (readStorage(DISMISS_FOREVER_KEY) === "1") return false;
    const last = readStorage(LAST_DISMISSED_KEY);
    if (last) {
      const ts = Number.parseInt(last, 10);
      if (!Number.isNaN(ts) && Date.now() - ts < REMIND_AFTER_MS) return false;
    }
    return true;
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onPrompt = (event: Event) => {
      // preventDefault retarde l'invite native : notre propre bouton decide.
      event.preventDefault();
      setDeferredPrompt(event as unknown as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const show = Boolean(eligible && !dismissed && !installed && (ios || deferredPrompt !== null));

  function dismiss(action: InstallPromptAction): void {
    if (action === "never") writeStorage(DISMISS_FOREVER_KEY, "1");
    else writeStorage(LAST_DISMISSED_KEY, String(Date.now()));
    setDismissed(true);
    setDeferredPrompt(null);
  }

  async function install(): Promise<void> {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome !== "accepted") {
      dismiss("later");
    }
  }

  return { show, ios, canInstallNative: deferredPrompt !== null, install, dismiss };
}