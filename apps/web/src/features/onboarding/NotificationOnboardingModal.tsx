import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { track } from "@vercel/analytics";
import { Bell, BellRing, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/auth-context";
import { usePushSubscription } from "@/features/notifications/usePushSubscription";
import { usePwaInstall } from "@/features/pwa/usePwaInstall";
import { isStandalone } from "@/lib/platform";

const DISMISSED_AT_KEY = "qurandeen.onboarding.dismissedAt";
const NEVER_KEY = "qurandeen.onboarding.never";
const DONE_KEY = "qurandeen.onboarding.done";
const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

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
    // Navigation privee / quota plein : ignorable, la modale peut re-apparaitre.
  }
}

type Step = "intro" | "account" | "install" | "permission" | "done";

const AUTH_PAGES = ["/register", "/login"];

/**
 * Funnel de retention "zero configuration" a la premiere visite : invite a
 * prendre un compte gratuit, installer la PWA (mobile), puis a donner les
 * notifications en un appui - le backend active alors automatiquement les
 * duas du matin/soir et l'alerte "garde ta serie". "Plus tard" reclame 7
 * jours, "Ne plus afficher" definitif, jamais re-proposee une fois terminee
 * ou deja abonnement push actif.
 */
export function NotificationOnboardingModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { support, isSubscribed, isPending, subscribe } = usePushSubscription();
  const { ios, canInstallNative, install } = usePwaInstall();

  const isMobile = React.useMemo(() => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent), []);
  const [installed] = React.useState(() => isStandalone());
  const needsInstall = isMobile && !installed;

  const eligible = React.useMemo(() => {
    if (typeof window === "undefined" || support !== "ready" || isSubscribed) return false;
    if (readStorage(NEVER_KEY) === "1" || readStorage(DONE_KEY) === "1") return false;
    const last = readStorage(DISMISSED_AT_KEY);
    if (last) {
      const ts = Number.parseInt(last, 10);
      if (!Number.isNaN(ts) && Date.now() - ts < REMIND_AFTER_MS) return false;
    }
    return true;
  }, [support, isSubscribed]);

  const [step, setStep] = React.useState<Step>("intro");
  const [open, setOpen] = React.useState(false);
  const [enabling, setEnabling] = React.useState(false);
  const [denied, setDenied] = React.useState(false);

  React.useEffect(() => {
    if (!eligible || authLoading || open) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      track("onboard_view");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [eligible, authLoading, open]);

  // Ferme la modale pendant les pages de connexion/inscription (le formulaire
  // doit rester utilisable) - elle se rouvre automatiquement au retour.
  React.useEffect(() => {
    if (AUTH_PAGES.includes(location.pathname)) setOpen(false);
  }, [location.pathname]);

  // Avancement automatique quand un prérequis devient satisfait (compte
  // cree, PWA installee puis relancee en standalone).
  React.useEffect(() => {
    if (!open) return;
    if (step === "account" && user && !AUTH_PAGES.includes(location.pathname)) {
      track("onboard_account_done");
      setStep(needsInstall ? "install" : "permission");
    } else if (step === "install" && !needsInstall) {
      setStep("permission");
    }
  }, [step, open, user, needsInstall, location.pathname]);

  const markLater = () => {
    writeStorage(DISMISSED_AT_KEY, String(Date.now()));
    setOpen(false);
    track("onboard_later");
  };

  const markNever = () => {
    writeStorage(NEVER_KEY, "1");
    setOpen(false);
    track("onboard_never");
  };

  const markDone = () => {
    writeStorage(DONE_KEY, "1");
    setOpen(false);
  };

  const continueIntro = () => {
    track("onboard_intro_continue");
    if (!user) {
      track("onboard_account");
      setStep("account");
    } else if (needsInstall) {
      setStep("install");
    } else {
      setStep("permission");
    }
  };

  const onInstallClick = async () => {
    track("onboard_install_start");
    if (canInstallNative) {
      await install();
    }
    track("onboard_install_done");
    setStep("permission");
  };

  const finishInstall = () => {
    // iOS : l'installation exige de relancer l'app depuis l'icone. La modale
    // se rouvrira en standalone et sautera cette etape automatiquement.
    track("onboard_install_done");
    setOpen(false);
  };

  const enable = async () => {
    setEnabling(true);
    track("onboard_permission_request");
    try {
      await subscribe();
      track("onboard_enabled");
      markDone();
      setStep("done");
    } catch {
      track("onboard_permission_denied");
      setDenied(true);
    } finally {
      setEnabling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? markLater() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "intro" && t("onboarding.introTitle")}
            {step === "account" && t("onboarding.accountTitle")}
            {step === "install" && t("onboarding.installTitle")}
            {step === "permission" && t("onboarding.permissionTitle")}
            {step === "done" && t("onboarding.doneTitle")}
          </DialogTitle>
          <DialogDescription>
            {step === "intro" && t("onboarding.introDescription")}
            {step === "account" && t("onboarding.accountDescription")}
            {step === "install" && (ios ? t("onboarding.installIosHint") : t("onboarding.installDescription"))}
            {step === "permission" && t("onboarding.permissionDescription")}
            {step === "done" && t("onboarding.doneDescription")}
          </DialogDescription>
        </DialogHeader>

        {step === "intro" && (
          <div className="space-y-3">
            <div className="flex items-center justify-center rounded-md bg-primary/10 p-3">
              <BellRing className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="rounded-md bg-card px-2 py-1">{t("onboarding.benefitFajr")}</span>
                <span>{t("onboarding.benefitMorning")}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="rounded-md bg-card px-2 py-1">{t("onboarding.benefitIsha")}</span>
                <span>{t("onboarding.benefitEvening")}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="rounded-md bg-card px-2 py-1">20:00</span>
                <span>{t("onboarding.benefitStreak")}</span>
              </div>
            </div>
            <Button type="button" className="w-full" onClick={continueIntro}>
              {t("onboarding.continue")}
            </Button>
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={markLater}>
                {t("onboarding.notNow")}
              </Button>
              <button
                type="button"
                onClick={markNever}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {t("onboarding.never")}
              </button>
            </div>
          </div>
        )}

        {step === "account" && (
          <div className="space-y-3">
            <Button type="button" className="w-full" onClick={() => navigate("/register")}>
              {t("onboarding.accountCta")}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
              {t("onboarding.accountLogin")}
            </Button>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={markLater}
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {t("onboarding.notNow")}
              </button>
            </div>
          </div>
        )}

        {step === "install" && (
          <div className="space-y-3">
            {ios ? (
              <ol className="space-y-3">
                {(["step1", "step2", "step3", "step4"] as const).map((iosStep, index) => (
                  <li key={iosStep} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm">{t(`pwaInstaller.ios.${iosStep}`)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex items-center justify-center rounded-md bg-primary/10 p-3">
                <Download className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
            )}
            <Button type="button" className="w-full" onClick={ios ? finishInstall : onInstallClick}>
              {ios ? t("onboarding.installDone") : t("onboarding.installButton")}
            </Button>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={markLater}
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {t("onboarding.notNow")}
              </button>
            </div>
          </div>
        )}

        {step === "permission" && (
          <div className="space-y-3">
            <div className="flex items-center justify-center rounded-md bg-primary/10 p-3">
              {denied ? (
                <Bell className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              ) : (
                <BellRing className="h-8 w-8 text-primary" aria-hidden="true" />
              )}
            </div>
            {denied && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {t("onboarding.permissionDenied")}
              </p>
            )}
            <Button
              type="button"
              className="w-full"
              disabled={enabling || isPending}
              onClick={denied ? markLater : enable}
            >
              {denied
                ? t("onboarding.permissionClose")
                : isPending
                  ? t("onboarding.permissionPending")
                  : t("onboarding.permissionCta")}
            </Button>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={denied ? markNever : markLater}
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {denied ? t("onboarding.never") : t("onboarding.notNow")}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-3">
            <div className="flex items-center justify-center rounded-md bg-primary/10 p-3">
              <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <p className="rounded-md bg-card px-3 py-2 text-center text-sm">{t("onboarding.doneSummary")}</p>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/profile")}>
              {t("onboarding.doneManage")}
            </Button>
            <Button type="button" className="w-full" onClick={markDone}>
              {t("onboarding.doneClose")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}