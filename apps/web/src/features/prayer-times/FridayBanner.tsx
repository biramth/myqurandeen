import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Rappel du vendredi (gestion du vendredi, cf. la priere du jumu'a qui
 * remplace le dhuhr - voir aussi PrayerTimesPage.tsx) : deux sunnah du
 * vendredi largement etablies (lecture de la sourate Al-Kahf, salawat sur
 * le Prophete), presentees ici comme le reste du contenu pedagogique du
 * site (sans citation de hadith precise attachee, comme la mention deja
 * existante du meme fait dans duas-seed.ts).
 */
export function FridayBanner() {
  const { t } = useTranslation();
  const [isFriday] = React.useState(() => new Date().getDay() === 5);

  if (!isFriday) return null;

  return (
    <Link to="/quran/18" className="mt-6 block">
      <Card className="border-primary/40 bg-primary/5 transition-colors hover:bg-primary/10">
        <CardContent className="flex items-center gap-3 py-4">
          <Sparkles className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium">{t("prayerTimes.fridayBannerTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("prayerTimes.fridayBannerDescription")}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
