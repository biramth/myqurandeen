import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { schoolsApi } from "@/features/schools/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function SchoolPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["schools", "detail", slug],
    queryFn: () => schoolsApi.getSchool(slug!),
    enabled: Boolean(slug),
  });
  useDocumentTitle(data?.name);

  if (!slug) return <Navigate to="/schools" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
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
            <section className="mb-4">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("schools.history")}
              </h2>
              <p className="text-sm leading-relaxed">{data.history}</p>
            </section>
          )}

          {data.principles && (
            <section className="mb-4">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("schools.principles")}
              </h2>
              <p className="text-sm leading-relaxed">{data.principles}</p>
            </section>
          )}

          {data.sourcesUsed && (
            <section>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("schools.sourcesUsed")}
              </h2>
              <p className="text-sm leading-relaxed">{data.sourcesUsed}</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
