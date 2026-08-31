import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { ProseText } from "@/components/shared/ProseText";
import { historyApi } from "@/features/history/api";
import { PageMeta, SITE_URL, buildOgImage } from "@/components/shared/PageMeta";

export function HistoryEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["history", "event", slug],
    queryFn: () => historyApi.getEvent(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) return <Navigate to="/history" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageMeta
        title={data?.event.title}
        description={data?.event.description}
        image={
          data?.event
            ? buildOgImage({ title: data.event.title, body: data.event.description, source: data.period?.name })
            : undefined
        }
      />
      <Breadcrumbs
        items={[
          { label: t("history.title"), href: "/history" },
          ...(data?.period ? [{ label: data.period.name, href: `/history/${data.period.slug}` }] : []),
          ...(data ? [{ label: data.event.title }] : []),
        ]}
      />

      {isError && <p className="text-sm text-destructive">{t("history.errorEvent")}</p>}
      {isLoading && <Skeleton className="h-48 w-full" />}

      {data && (
        <>
          <div className="mb-1 flex items-start gap-3">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <History className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              {data.period && <p className="text-sm text-muted-foreground">{data.period.name}</p>}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{data.event.title}</h1>
                {data.event.dateApprox && <Badge variant="secondary">{data.event.dateApprox}</Badge>}
              </div>
            </div>
          </div>
          <ProseText text={data.event.description} className="mt-4" />

          <ContentUserActions
            targetType="event"
            targetId={data.event.id}
            className="mt-5"
            shareContent={{
              title: data.event.title,
              body: data.event.description,
              source: data.period?.name,
              url: `${SITE_URL}/history/event/${slug}`,
            }}
          />

          {data.sources.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("history.sources")}
              </h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.sources.map((source) => (
                  <li key={source.title}>{source.title}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
