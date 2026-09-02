import * as React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { hadithApi } from "@/features/hadith/api";
import { arabicFontSizeStyle } from "@/components/shared/arabic-font-size-provider";
import { PageMeta } from "@/components/shared/PageMeta";

export function HadithChapterPage() {
  const { collection: slug, bookNumber: bookNumberParam } = useParams<{ collection: string; bookNumber: string }>();
  const bookNumber = Number(bookNumberParam);
  const [page, setPage] = React.useState(1);
  const { t, i18n } = useTranslation();

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["hadith", "book", slug, bookNumber, page],
    queryFn: () => hadithApi.getBookHadiths(slug!, bookNumber, page),
    enabled: Boolean(slug) && Number.isInteger(bookNumber),
  });
  const { data: collection } = useQuery({
    queryKey: ["hadith", "collection", slug],
    queryFn: () => hadithApi.getCollection(slug!),
    enabled: Boolean(slug),
  });

  const { data: editions } = useQuery({
    queryKey: ["hadith", "translations", slug],
    queryFn: () => hadithApi.listTranslations(slug!),
    enabled: Boolean(slug),
  });

  // La langue affichee suit la langue de l'interface (selecteur global dans le Header).
  // La traduction est toujours visible (repli silencieux sur l'anglais de base
  // si cette langue n'est pas disponible pour cette collection).
  const activeEdition = editions?.find((e) => e.language === i18n.language);

  const { data: translationRows } = useQuery({
    queryKey: ["hadith", "book-translation", slug, bookNumber, page, activeEdition?.id],
    queryFn: () => hadithApi.getBookTranslation(slug!, bookNumber, activeEdition!.id),
    enabled: Boolean(slug) && Number.isInteger(bookNumber) && Boolean(activeEdition),
  });

  const translationByNumber = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const row of translationRows ?? []) map.set(row.numberInCollection, row.text);
    return map;
  }, [translationRows]);

  if (!slug || !Number.isInteger(bookNumber)) return <Navigate to="/hadith" replace />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageMeta title={data ? `${data.book.number}. ${data.book.title}` : undefined} />
      <Breadcrumbs
        items={[
          { label: t("hadith.title"), href: "/hadith" },
          ...(collection ? [{ label: collection.name, href: `/hadith/${slug}` }] : []),
          ...(data ? [{ label: `${data.book.number}. ${data.book.title}` }] : []),
        ]}
      />

      {isError && <p className="text-sm text-destructive">{t("hadith.errorChapter")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <h1 className="mb-4 text-lg font-semibold">
            {data.book.number}. {data.book.title}
          </h1>

          <div className="space-y-1 rounded-lg border bg-reading text-reading-foreground">
            {data.hadiths.map((hadith, i) => (
              <React.Fragment key={hadith.id}>
                {i > 0 && <Separator className="opacity-50" />}
                <div id={hadith.numberInCollection} className="scroll-mt-20 p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge>
                      {t("hadith.hadithLabel")} {hadith.number}
                    </Badge>
                    {hadith.authenticityGrade && <Badge variant="secondary">{hadith.authenticityGrade}</Badge>}
                  </div>

                  {hadith.textArabic && (
                    <p dir="rtl" lang="ar" className="mb-3 font-arabic leading-loose" style={arabicFontSizeStyle(1.25)}>
                      {hadith.textArabic}
                    </p>
                  )}

                  <p className="text-sm leading-relaxed">
                    {activeEdition
                      ? (translationByNumber.get(hadith.numberInCollection) ?? hadith.textTranslation)
                      : hadith.textTranslation}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("hadith.previous")}
            </Button>
            <span className="text-sm text-muted-foreground">{t("hadith.page", { n: page })}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={data.hadiths.length < data.pageSize || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("hadith.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
