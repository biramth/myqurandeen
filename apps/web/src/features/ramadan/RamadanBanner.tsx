import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRamadanMode } from "./useRamadanMode";

/**
 * Banniere saisonniere page d'accueil (ROADMAP.md, phase 4) - visible
 * uniquement pendant le Ramadan (detection reelle ou reglage manuel
 * d'activation, voir useRamadanMode.ts), lien vers la page dediee.
 */
export function RamadanBanner() {
  const { t } = useTranslation();
  const ramadan = useRamadanMode();

  if (!ramadan.active) return null;

  return (
    <Link to="/ramadan" className="mt-6 block">
      <Card className="border-primary/40 bg-primary/5 transition-colors hover:bg-primary/10">
        <CardContent className="flex items-center gap-3 py-4">
          <Moon className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium">{t("ramadan.bannerTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("ramadan.dayCounter", { day: ramadan.day ?? 1 })}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
