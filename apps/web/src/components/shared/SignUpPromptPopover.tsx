import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SignUpPromptPopoverProps {
  /** Le bouton visuel normal (favori, collection, note...) - reste identique, seul le clic change de comportement. */
  trigger: React.ReactNode;
  /** Phrase courte expliquant ce que l'utilisateur gagne, ex. "pour enregistrer ce verset dans vos favoris." */
  description: string;
  align?: "start" | "center" | "end";
}

/**
 * Remplace l'action reelle (favori/collection/note) pour un visiteur non
 * connecte : le bouton reste visible - c'est la ce qui donne envie de
 * cliquer - mais le clic ouvre ce petit popover au lieu d'echouer
 * silencieusement, avec un raccourci direct vers connexion/inscription qui
 * ramene ensuite l'utilisateur sur cette meme page (`redirect`).
 */
export function SignUpPromptPopover({ trigger, description, align = "start" }: SignUpPromptPopoverProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const redirect = encodeURIComponent(`${location.pathname}${location.search}`);

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-72">
        <p className="text-sm font-medium">{t("authPrompt.title")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link to={`/register?redirect=${redirect}`}>{t("auth.login.createAccount")}</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to={`/login?redirect=${redirect}`}>{t("auth.register.login")}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
