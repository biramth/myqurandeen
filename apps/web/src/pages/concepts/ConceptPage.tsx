import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { conceptsApi } from "@/features/concepts/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function ConceptPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["concepts", "detail", slug],
    queryFn: () => conceptsApi.getConcept(slug!),
    enabled: Boolean(slug),
  });
  useDocumentTitle(data?.term);

  if (!slug) return <Navigate to="/concepts" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: t("concepts.title"), href: "/concepts" }, ...(data ? [{ label: data.term }] : [])]}
      />

      {isError && <p className="text-sm text-destructive">{t("concepts.errorDetail")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">{data.term}</h1>
            {data.termArabic && (
              <span dir="rtl" className="font-arabic text-2xl">
                {data.termArabic}
              </span>
            )}
          </div>
          <p className="mb-4 text-sm font-medium text-muted-foreground">{data.definition}</p>

          <ContentUserActions targetType="concept" targetId={data.id} className="mb-4" />

          {data.origin && (
            <section className="mb-4">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("concepts.origin")}
              </h2>
              <p className="text-sm leading-relaxed">{data.origin}</p>
            </section>
          )}

          {data.explanation && (
            <section className="mb-4">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("concepts.explanation")}
              </h2>
              <p className="text-sm leading-relaxed">{data.explanation}</p>
            </section>
          )}

          {data.divergences.length > 0 && (
            <Card className="mb-4 bg-accent/40">
              <CardContent className="p-4 text-sm leading-relaxed">
                {data.divergences.map((d, i) => (
                  <p key={i}>{d.explanation}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {data.related.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("concepts.related")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.related.map((r) => (
                  <Link key={r.id} to={`/concepts/${r.slug}`}>
                    <Badge variant="secondary">{r.term}</Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
