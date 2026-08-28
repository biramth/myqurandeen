import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchApi } from "@/features/search/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function ResultSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = React.useState(initialQuery);
  useDocumentTitle(t("search.title"));

  const { data, isFetching, isError } = useQuery({
    queryKey: ["search", initialQuery],
    queryFn: () => searchApi.search(initialQuery),
    enabled: initialQuery.trim().length >= 2,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchParams(inputValue ? { q: inputValue } : {});
  };

  const totalResults = data
    ? data.verses.length +
      data.hadiths.length +
      data.tafsirEntries.length +
      data.concepts.length +
      data.scholars.length +
      data.prophets.length +
      data.events.length +
      data.fiqhTopics.length +
      data.schools.length
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <SearchIcon className="h-7 w-7 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-tight">{t("search.title")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("home.searchPlaceholder")}
          aria-label={t("nav.search")}
          autoFocus
        />
        <Button type="submit">{t("home.searchButton")}</Button>
      </form>

      {isError && <p className="text-sm text-destructive">{t("search.error")}</p>}
      {isFetching && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!isFetching && initialQuery.trim().length >= 2 && totalResults === 0 && (
        <p className="text-sm text-muted-foreground">{t("search.noResults")}</p>
      )}

      {data && (
        <>
          <ResultSection title={t("nav.quran")} count={data.verses.length}>
            {data.verses.map((v) => (
              <Link key={v.id} to={`/quran/${v.surahNumber}/${v.numberInSurah}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">
                      {v.surahName} {v.surahNumber}:{v.numberInSurah}
                    </p>
                    <p dir="rtl" className="mt-1 font-arabic text-lg">
                      {v.textArabic}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title={t("nav.hadith")} count={data.hadiths.length}>
            {data.hadiths.map((h) => (
              <Link key={h.id} to={`/hadith/${h.collectionSlug}/${h.numberInCollection}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">
                      {h.collectionName} - {t("hadith.hadithLabel")} {h.number}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm">{h.textTranslation}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title={t("comingSoon.tafsir.title") || "Tafsir"} count={data.tafsirEntries.length}>
            {data.tafsirEntries.map((entry) => (
              <Link key={entry.id} to={`/quran/${entry.surahNumber}/${entry.numberInSurah}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">
                      {entry.workTitle} - {entry.surahNumber}:{entry.numberInSurah}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm">{entry.content}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title={t("concepts.title")} count={data.concepts.length}>
            {data.concepts.map((c) => (
              <Link key={c.id} to={`/concepts/${c.slug}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{c.term}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.definition}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title={t("scholars.title")} count={data.scholars.length}>
            {data.scholars.map((s) => (
              <Link key={s.id} to={`/scholars/${s.slug}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{s.name}</p>
                    {s.bio && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.bio}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title={t("prophets.title")} count={data.prophets.length}>
            {data.prophets.map((p) => (
              <Link key={p.id} to={`/prophets/${p.slug}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title={t("history.title")} count={data.events.length}>
            {data.events.map((e) => (
              <Link key={e.id} to={`/history/event/${e.slug}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title={t("schools.comparatorTitle")} count={data.fiqhTopics.length}>
            {data.fiqhTopics.map((topic) => (
              <Link key={topic.id} to={`/fiqh/${topic.slug}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{topic.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title={t("schools.title")} count={data.schools.length}>
            {data.schools.map((school) => (
              <Link key={school.id} to={`/schools/${school.slug}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{school.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </ResultSection>
        </>
      )}
    </div>
  );
}
