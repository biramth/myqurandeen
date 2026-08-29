import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Callout } from "@/components/shared/Callout";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { DuaCounter } from "@/components/shared/DuaCounter";
import { duasApi } from "@/features/duas/api";
import { getDuaCategoryIcon } from "@/features/duas/icons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function DuaCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["duas", "category", slug],
    queryFn: () => duasApi.getCategory(slug!),
    enabled: Boolean(slug),
  });
  useDocumentTitle(data?.category.name);

  if (!slug) return <Navigate to="/duas" replace />;

  const CategoryIcon = getDuaCategoryIcon(slug);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/duas">
          <ArrowLeft className="h-4 w-4" />
          {t("duas.backToList")}
        </Link>
      </Button>

      {isError && <p className="text-sm text-destructive">{t("duas.errorDetail")}</p>}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {data && (
        <>
          <div className="mb-1 flex items-center gap-2">
            <CategoryIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-semibold">{data.category.name}</h1>
          </div>
          {data.category.description && (
            <p className="mb-6 text-sm text-muted-foreground">{data.category.description}</p>
          )}

          <div className="space-y-4">
            {data.duas.map((dua) => (
              <Card key={dua.id}>
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="font-medium">{dua.title}</p>
                    <ContentUserActions targetType="dua" targetId={dua.id} size="sm" className="mt-1.5" />
                  </div>

                  {dua.arabicText && (
                    <p dir="rtl" lang="ar" className="font-arabic text-xl leading-loose">
                      {dua.arabicText}
                    </p>
                  )}

                  {dua.transliteration && (
                    <p className="text-sm italic text-muted-foreground">{dua.transliteration}</p>
                  )}

                  <p className="text-[15px] leading-relaxed">{dua.translation}</p>

                  {dua.referenceUrl && (
                    <Link to={dua.referenceUrl} className="text-sm text-primary hover:underline">
                      {t("duas.readReference")}
                    </Link>
                  )}

                  {dua.virtue && (
                    <Callout icon={Sparkles} className="text-xs">
                      {dua.virtue}
                    </Callout>
                  )}

                  {dua.sourceTitle && <p className="text-xs text-muted-foreground">{dua.sourceTitle}</p>}

                  {dua.repeatCount && dua.repeatCount > 1 && <DuaCounter target={dua.repeatCount} />}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
