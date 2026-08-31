import { Navigate, Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { GraduationCap, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { ProseText } from "@/components/shared/ProseText";
import { scholarsApi } from "@/features/scholars/api";
import { PageMeta } from "@/components/shared/PageMeta";

export function ScholarPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["scholars", "detail", slug],
    queryFn: () => scholarsApi.getScholar(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) return <Navigate to="/scholars" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageMeta title={data?.name} description={data?.bio ?? undefined} />
      <Breadcrumbs
        items={[
          { label: t("scholars.title"), href: "/scholars" },
          ...(data ? [{ label: data.name }] : []),
        ]}
      />

      {isError && <p className="text-sm text-destructive">{t("scholars.errorDetail")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <div className="mb-1 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h1 className="text-xl font-semibold">{data.name}</h1>
              {data.nameArabic && (
                <span dir="rtl" className="font-arabic text-2xl">
                  {data.nameArabic}
                </span>
              )}
            </div>
          </div>

          <p className="mb-4 mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="tabular-nums">
              {data.bornYear ?? "?"} - {data.diedYear ?? "?"}
            </span>
            {data.place && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {data.place}
              </span>
            )}
          </p>

          {data.expertise && data.expertise.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {data.expertise.map((e) => (
                <Badge key={e} variant="secondary">
                  {e}
                </Badge>
              ))}
            </div>
          )}

          {data.bio && (
            <>
              <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("scholars.biography")}
              </h2>
              <ProseText text={data.bio} className="mb-5" />
            </>
          )}

          <ContentUserActions targetType="scholar" targetId={data.id} className="mb-6" />

          {data.schools.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("scholars.schools")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.schools.map((school) => (
                  <Link key={school.id} to={`/schools/${school.slug}`}>
                    <Badge>{school.name}</Badge>
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
