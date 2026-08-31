import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { hadithApi } from "@/features/hadith/api";
import { PageMeta } from "@/components/shared/PageMeta";

export function HadithCollectionsPage() {
  const { t } = useTranslation();
  const { data: collections, isLoading, isError } = useQuery({
    queryKey: ["hadith", "collections"],
    queryFn: hadithApi.listCollections,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta title={t("hadith.title")} description={t("hadith.subtitle")} />
      <div className="mb-8 flex items-center gap-3">
        <ScrollText className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("hadith.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("hadith.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("hadith.errorCollections")}</p>}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {collections?.map((collection) => (
          <Link key={collection.id} to={`/hadith/${collection.slug}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{collection.name}</p>
                  {collection.compilerName && (
                    <p className="text-sm text-muted-foreground">{collection.compilerName}</p>
                  )}
                  {collection.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
                  )}
                </div>
                {collection.nameArabic && (
                  <span dir="rtl" className="shrink-0 font-arabic text-lg">
                    {collection.nameArabic}
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
