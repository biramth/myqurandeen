import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { tafsirApi } from "@/features/tafsir/api";
import { languageLabel } from "@/lib/languages";
import { PageMeta } from "@/components/shared/PageMeta";

export function TafsirWorksPage() {
  const { t } = useTranslation();
  const { data: works, isLoading, isError } = useQuery({
    queryKey: ["tafsir", "works"],
    queryFn: tafsirApi.listWorks,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta title={t("comingSoon.tafsir.title")} description={t("comingSoon.tafsir.description")} />
      <div className="mb-8 flex items-center gap-3">
        <BookMarked className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("comingSoon.tafsir.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {works ? `${works.length} ${t("tafsir.editions")}` : ""}
          </p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("tafsir.error")}</p>}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {works?.map((work) => (
          <Card key={work.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{work.title}</CardTitle>
                <Badge variant="secondary">{languageLabel(work.language)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {work.authorName && (
                <p className="text-sm font-medium text-muted-foreground">
                  {work.authorName}
                  {work.era ? ` - ${work.era}` : ""}
                </p>
              )}
              {work.description && <p className="mt-1 text-sm text-muted-foreground">{work.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">{t("tafsir.readHint")}</p>
    </div>
  );
}
