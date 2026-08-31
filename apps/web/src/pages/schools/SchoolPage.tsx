import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProseText } from "@/components/shared/ProseText";
import { schoolsApi } from "@/features/schools/api";
import { PageMeta } from "@/components/shared/PageMeta";

export function SchoolPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["schools", "detail", slug],
    queryFn: () => schoolsApi.getSchool(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) return <Navigate to="/schools" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageMeta title={data?.name} description={data?.history ?? data?.principles ?? undefined} />
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/schools">
          <ArrowLeft className="h-4 w-4" />
          {t("schools.backToList")}
        </Link>
      </Button>

      <Breadcrumbs
        items={[{ label: t("schools.title"), href: "/schools" }, ...(data ? [{ label: data.name }] : [])]}
      />

      {isError && <p className="text-sm text-destructive">{t("schools.errorDetail")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <div className="mb-6 flex items-center gap-2">
            <h1 className="text-xl font-semibold">{data.name}</h1>
            {data.type === "theological" && <Badge variant="secondary">{t("schools.theological")}</Badge>}
          </div>
          {data.era && <p className="mb-4 text-sm text-muted-foreground">{data.era}</p>}

          {data.history && (
            <section className="mb-5">
              <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("schools.history")}
              </h2>
              <ProseText text={data.history} />
            </section>
          )}

          {data.principles && (
            <section className="mb-5">
              <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("schools.principles")}
              </h2>
              <ProseText text={data.principles} />
            </section>
          )}

          {data.sourcesUsed && (
            <section>
              <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("schools.sourcesUsed")}
              </h2>
              <ProseText text={data.sourcesUsed} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
