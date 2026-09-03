import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sunrise, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageMeta, SITE_URL } from "@/components/shared/PageMeta";
import { SignUpPromptPopover } from "@/components/shared/SignUpPromptPopover";
import { useAuth } from "@/features/auth/auth-context";
import { usePrayerLocation } from "@/features/prayer-times/usePrayerLocation";
import { computePrayerTimes } from "@/features/prayer-times/prayer-times";
import { KhatmCard } from "@/features/ramadan/KhatmCard";
import { RamadanAlertCard } from "@/features/ramadan/RamadanAlertCard";
import { useRamadanMode } from "@/features/ramadan/useRamadanMode";
import type { RamadanModeOverride } from "@/features/ramadan/useRamadanMode";

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Page centrale du mode Ramadan (ROADMAP.md, phase 4) : horaires iftar/
 * suhoor (reutilise le module horaires de priere), suivi de khatm,
 * notification quotidienne, lien vers les duas dediees deja presentes
 * (dua-seed.ts, categorie "ramadan"). Accessible a tout moment (pas
 * seulement pendant le vrai Ramadan) - le reglage d'activation manuelle en
 * haut de page sert justement a anticiper/tester hors saison.
 */
export function RamadanPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { coords } = usePrayerLocation();
  const ramadan = useRamadanMode();

  const times = coords ? computePrayerTimes(coords.latitude, coords.longitude) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageMeta title={t("ramadan.title")} description={t("ramadan.subtitle")} url={`${SITE_URL}/ramadan`} />

      <div className="mb-6 flex items-center gap-3">
        <Moon className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("ramadan.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("ramadan.subtitle")}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-md border p-3">
        <span className="text-sm text-muted-foreground">{t("ramadan.overrideLabel")}</span>
        {(["auto", "on", "off"] as RamadanModeOverride[]).map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={ramadan.override === value ? "secondary" : "outline"}
            onClick={() => ramadan.setOverride(value)}
          >
            {t(`ramadan.override.${value}`)}
          </Button>
        ))}
      </div>

      {!ramadan.active ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">{t("ramadan.notActive")}</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-center justify-between gap-3 py-5">
              <div>
                <p className="text-sm text-muted-foreground">{t("ramadan.dayCounter", { day: ramadan.day ?? 1 })}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("ramadan.approximationNotice")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-5">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                <Sunset className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("ramadan.iftarSuhoorTitle")}
              </p>
              {times ? (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("ramadan.iftar")}</p>
                    <p className="text-xl font-semibold tabular-nums">{formatTime(times.maghrib)}</p>
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Sunrise className="h-3 w-3" aria-hidden="true" />
                      {t("ramadan.suhoorUntil")}
                    </p>
                    <p className="text-xl font-semibold tabular-nums">{formatTime(times.fajr)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  {t("ramadan.noLocation")}{" "}
                  <Link to="/prayer-times" className="text-primary hover:underline">
                    {t("ramadan.setLocationLink")}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {user ? (
            <>
              <KhatmCard ramadan={ramadan} />
              <RamadanAlertCard />
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <p className="text-sm text-muted-foreground">{t("ramadan.signUpPrompt")}</p>
                <SignUpPromptPopover
                  trigger={<Button type="button">{t("ramadan.signUpButton")}</Button>}
                  description={t("authPrompt.ramadanDescription")}
                />
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Link to="/duas/ramadan" className="text-sm text-primary hover:underline">
              {t("ramadan.duasLink")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
