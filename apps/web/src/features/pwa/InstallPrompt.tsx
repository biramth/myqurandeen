import * as React from "react";
import { useTranslation } from "react-i18next";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePwaInstall } from "./usePwaInstall";

const iOS_STEPS = ["step1", "step2", "step3", "step4"] as const;

/**
 * Bandeau "Installer l'app" reserve au mobile (`md:hidden`) : invite native
 * Chrome sur Android/desktop, guide "Ajouter a l'ecran d'accueil" sur iPhone
 * dans un dialogue. Fermable ("Plus tard" = 7 jours, "Ne plus afficher" =
 * definitif) et cache dans la PWA deja installee.
 */
export function InstallPrompt() {
  const { t } = useTranslation();
  const { show, ios, install, dismiss } = usePwaInstall();
  const [guideOpen, setGuideOpen] = React.useState(false);

  if (!show) return null;

  const onInstall = () => {
    if (ios) setGuideOpen(true);
    else void install();
  };

  return (
    <div className="border-b bg-card px-4 py-3 md:hidden">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Download className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{t("pwaInstaller.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("pwaInstaller.description")}</p>
        </div>
        <button
          type="button"
          onClick={() => dismiss("later")}
          aria-label={t("pwaInstaller.notNow")}
          className="rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={onInstall}>
          {t("pwaInstaller.install")}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => dismiss("later")}>
          {t("pwaInstaller.notNow")}
        </Button>
        <button
          type="button"
          onClick={() => dismiss("never")}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {t("pwaInstaller.never")}
        </button>
      </div>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pwaInstaller.ios.title")}</DialogTitle>
            <DialogDescription>{t("pwaInstaller.ios.description")}</DialogDescription>
          </DialogHeader>
          <ol className="space-y-3">
            {iOS_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="text-sm">{t(`pwaInstaller.ios.${step}`)}</span>
              </li>
            ))}
          </ol>
          <DialogFooter>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                dismiss("never");
                setGuideOpen(false);
              }}
            >
              {t("pwaInstaller.never")}
            </Button>
            <DialogClose asChild>
              <Button type="button" size="sm" onClick={() => dismiss("later")}>
                {t("pwaInstaller.ios.gotIt")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}