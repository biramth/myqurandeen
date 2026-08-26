import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { hadithApi } from "@/features/hadith/api";

export function HadithCollectionPage() {
  const { collection: slug } = useParams<{ collection: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hadith", "collection", slug],
    queryFn: () => hadithApi.getCollection(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) return <Navigate to="/hadith" replace />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/hadith">
          <ArrowLeft className="h-4 w-4" />
          {t("hadith.backToCollections")}
        </Link>
      </Button>

      {isError && <p className="text-sm text-destructive">{t("hadith.errorCollection")}</p>}
      {isLoading && <Skeleton className="h-40 w-full" />}

      {data && (
        <>
          <header className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-semibold">{data.name}</h1>
              {data.nameArabic && (
                <span dir="rtl" className="font-arabic text-xl">
                  {data.nameArabic}
                </span>
              )}
            </div>
            {data.compilerName && (
              <p className="text-sm text-muted-foreground">{t("hadith.compiledBy", { name: data.compilerName })}</p>
            )}
            {data.description && <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>}
          </header>

          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("hadith.chapters")} ({data.books.length})
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.books.map((book) => (
              <Link key={book.id} to={`/hadith/${slug}/book/${book.number}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="p-3 text-sm">
                    <span className="text-muted-foreground">{book.number}.</span> {book.title}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
