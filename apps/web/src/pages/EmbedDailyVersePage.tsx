import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PageMeta, SITE_URL, withShareUtm } from "@/components/shared/PageMeta";
import { dailyApi } from "@/features/daily/api";

/**
 * Widget "verset du jour" embarquable sur un site tiers via <iframe>. Rendu
 * hors AppLayout (route soeur, pas d'enfant de la route avec <AppLayout/> -
 * voir router.tsx) : aucune sidebar/header/footer/nav, juste le contenu -
 * mais toujours dans le meme bundle SPA, donc le theme clair/sombre suit
 * automatiquement la preference systeme du visiteur (ThemeProvider inchange).
 *
 * `noindex` : ce n'est pas une page destinee a etre visitee/indexee pour
 * elle-meme, seulement chargee en iframe. Voir vercel.json pour l'en-tete
 * CSP frame-ancestors qui autorise explicitement cette route a etre
 * encadree par n'importe quel site (le reste du site reste protege).
 */
export function EmbedDailyVersePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["daily"],
    queryFn: dailyApi.get,
    staleTime: 30 * 60 * 1000,
  });

  const verse = data?.verse;
  const href = verse ? withShareUtm(`${SITE_URL}/quran/${verse.surahNumber}/${verse.numberInSurah}`, "widget") : SITE_URL;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <PageMeta title={null} noindex />

      <div className="w-full max-w-sm rounded-lg border bg-reading p-4 text-reading-foreground">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {!isLoading && verse && (
          <a href={href} target="_blank" rel="noreferrer" className="block hover:opacity-90">
            <p dir="rtl" lang="ar" className="font-arabic text-lg leading-loose">
              {verse.textArabic}
            </p>
            {verse.translation && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{verse.translation.text}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {verse.surahNameTransliterated} {verse.numberInSurah}
            </p>
          </a>
        )}

        <a
          href={withShareUtm(SITE_URL, "widget")}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block border-t pt-2 text-right text-[11px] font-medium text-primary hover:underline"
        >
          myQurandeen →
        </a>
      </div>
    </div>
  );
}
