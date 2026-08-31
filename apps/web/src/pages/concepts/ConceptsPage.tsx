import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { conceptsApi } from "@/features/concepts/api";
import { PageMeta } from "@/components/shared/PageMeta";

export function ConceptsPage() {
  const { t } = useTranslation();
  const { data: concepts, isLoading, isError } = useQuery({
    queryKey: ["concepts"],
    queryFn: conceptsApi.listConcepts,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta title={t("concepts.title")} description={t("concepts.subtitle")} />
      <div className="mb-8 flex items-center gap-3">
        <Lightbulb className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("concepts.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("concepts.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("concepts.error")}</p>}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {concepts?.map((concept) => (
          <Link key={concept.id} to={`/concepts/${concept.slug}`}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{concept.term}</p>
                  {concept.termArabic && (
                    <span dir="rtl" className="font-arabic text-sm text-muted-foreground">
                      {concept.termArabic}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{concept.definition}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
