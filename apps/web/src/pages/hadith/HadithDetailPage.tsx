import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { hadithApi } from "@/features/hadith/api";
import { arabicFontSizeStyle } from "@/components/shared/arabic-font-size-provider";
import { useStreakPing } from "@/features/streaks/useStreak";
import { useGamificationEvent } from "@/features/gamification/useGamification";
import { PageMeta, SITE_URL, buildOgImage, withShareUtm } from "@/components/shared/PageMeta";

export function HadithDetailPage() {
  const { collection: slug, number } = useParams<{ collection: string; number: string }>();
  const { t } = useTranslation();
  useStreakPing();
  const track = useGamificationEvent();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hadith", "detail", slug, number],
    queryFn: () => hadithApi.getHadith(slug!, number!),
    enabled: Boolean(slug) && Boolean(number),
  });
  useEffect(() => {
    if (data) track("hadith_read");
  }, [data, track]);

  if (!slug || !number) return <Navigate to="/hadith" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageMeta
        title={data ? `${data.collection.name} ${data.hadith.number}` : undefined}
        description={data?.hadith.textTranslation}
        image={
          data
            ? buildOgImage({
                title: `${data.collection.name} ${data.hadith.number}`,
                arabicText: data.hadith.textArabic ?? undefined,
                body: data.hadith.textTranslation,
                source: data.book ? `${data.collection.name} — ${data.book.title}` : data.collection.name,
              })
            : undefined
        }
      />
      <Breadcrumbs
        items={[
          { label: t("hadith.title"), href: "/hadith" },
          ...(data ? [{ label: data.collection.name, href: `/hadith/${slug}` }] : []),
          ...(data?.book ? [{ label: data.book.title, href: `/hadith/${slug}/book/${data.book.number}` }] : []),
          ...(data ? [{ label: `${t("hadith.hadithLabel")} ${data.hadith.number}` }] : []),
        ]}
      />

      {isError && <p className="text-sm text-destructive">{t("hadith.errorHadith")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <p className="mb-1 text-sm text-muted-foreground">
            {data.collection.name}
            {data.book && ` - ${data.book.title}`}
          </p>
          <h1 className="mb-4 text-lg font-semibold">
            {t("hadith.hadithLabel")} {data.hadith.number}
          </h1>

          {data.hadith.textArabic && (
            <p
              dir="rtl"
              lang="ar"
              className="mb-4 rounded-lg border bg-reading p-5 font-arabic leading-loose text-reading-foreground"
              style={arabicFontSizeStyle(1.25)}
            >
              {data.hadith.textArabic}
            </p>
          )}

          <p className="rounded-lg border p-5 text-sm leading-relaxed">{data.hadith.textTranslation}</p>

          <ContentUserActions
            targetType="hadith"
            targetId={data.hadith.id}
            className="mt-4"
            shareContent={{
              title: `${data.collection.name} ${data.hadith.number}`,
              arabicText: data.hadith.textArabic ?? undefined,
              body: data.hadith.textTranslation,
              source: data.book ? `${data.collection.name} — ${data.book.title}` : data.collection.name,
              url: withShareUtm(`${SITE_URL}/hadith/${slug}/${number}`, "content"),
            }}
          />

          {data.translations.length > 0 && (
            <div className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("hadith.otherTranslations")}
              </h2>
              {data.translations.map((t2) => (
                <div key={t2.translationId} className="rounded-lg border p-4">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{t2.translationName}</p>
                  <p className="text-sm leading-relaxed">{t2.text}</p>
                </div>
              ))}
            </div>
          )}

          {data.grades.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("hadith.authenticity")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.grades.map((g) => (
                  <Badge key={g.graderName} variant="secondary">
                    {g.graderName} : {g.grade}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
