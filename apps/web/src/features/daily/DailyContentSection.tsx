import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButton } from "@/components/shared/ShareButton";
import { ShareCard } from "@/components/shared/ShareCard";
import { SITE_URL, withShareUtm } from "@/components/shared/PageMeta";
import { dailyApi } from "./api";
import type { DailyHadith, DailyVerse } from "./types";

function DailyVerseCard({ verse }: { verse: DailyVerse }) {
  const { t } = useTranslation();
  const href = `/quran/${verse.surahNumber}/${verse.numberInSurah}`;
  const reference = `${verse.surahNameTransliterated} ${verse.numberInSurah}`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {t("home.dailyVerse.label")}
          </p>
          <ShareButton
            size="sm"
            content={{ title: reference, url: withShareUtm(`${SITE_URL}${href}`, "daily") }}
            renderCard={(ref) => (
              <ShareCard
                ref={ref}
                title={reference}
                arabicText={verse.textArabic}
                transliteration={verse.textTransliterated ?? undefined}
                body={verse.translation?.text}
                source={reference}
              />
            )}
          />
        </div>
        <Link to={href} className="block hover:opacity-80">
          <p dir="rtl" lang="ar" className="font-arabic text-xl leading-loose">
            {verse.textArabic}
          </p>
          {verse.translation && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{verse.translation.text}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{reference}</p>
        </Link>
      </CardContent>
    </Card>
  );
}

function DailyHadithCard({ hadith }: { hadith: DailyHadith }) {
  const { t } = useTranslation();
  const href = `/hadith/${hadith.collectionSlug}/${hadith.numberInCollection}`;
  const reference = `${hadith.collectionName} ${hadith.numberInCollection}`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
            {t("home.dailyHadith.label")}
          </p>
          <ShareButton
            size="sm"
            content={{ title: reference, url: withShareUtm(`${SITE_URL}${href}`, "daily") }}
            renderCard={(ref) => (
              <ShareCard
                ref={ref}
                title={reference}
                arabicText={hadith.textArabic ?? undefined}
                body={hadith.textTranslation ?? undefined}
                source={hadith.collectionName}
              />
            )}
          />
        </div>
        <Link to={href} className="block hover:opacity-80">
          {hadith.textArabic && (
            <p dir="rtl" lang="ar" className="line-clamp-3 font-arabic text-lg leading-loose">
              {hadith.textArabic}
            </p>
          )}
          {hadith.textTranslation && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{hadith.textTranslation}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{reference}</p>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Verset + hadith du jour, memes pour tous les visiteurs le meme jour
 * calendaire UTC (voir apps/api/.../daily.service.ts). Reutilise l'infra de
 * partage existante (ShareButton/ShareCard) - c'est le point d'entree le
 * plus naturel pour une diffusion quotidienne.
 */
export function DailyContentSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["daily"],
    queryFn: dailyApi.get,
    staleTime: 30 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data || (!data.verse && !data.hadith)) return null;

  return (
    <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {data.verse && <DailyVerseCard verse={data.verse} />}
      {data.hadith && <DailyHadithCard hadith={data.hadith} />}
    </div>
  );
}
