import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { History } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProseText } from "@/components/shared/ProseText";
import { historyApi } from "@/features/history/api";
import { PageMeta } from "@/components/shared/PageMeta";

export function HistoryPeriodPage() {
  const { period: slug } = useParams<{ period: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["history", "period", slug],
    queryFn: () => historyApi.getPeriod(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) return <Navigate to="/history" replace />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageMeta title={data?.name} description={data?.description ?? undefined} />
      <Breadcrumbs
        items={[{ label: t("history.title"), href: "/history" }, ...(data ? [{ label: data.name }] : [])]}
      />

      {isError && <p className="text-sm text-destructive">{t("history.errorPeriod")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <header className="mb-6">
            <div className="mb-1 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <History className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-xl font-semibold">{data.name}</h1>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {data.startYear} - {data.endYear} {data.region ? `- ${data.region}` : ""}
                </p>
              </div>
            </div>
            {data.description && <ProseText text={data.description} className="mt-4" />}
          </header>

          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("history.events")}
          </h2>
          <ol className="relative space-y-0 border-s ps-6">
            {data.events.map((event, i) => (
              <li key={event.id} className="relative pb-6">
                <span className="absolute -start-[29px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <Link to={`/history/event/${event.slug}`} className="group">
                  <p className="text-xs font-medium text-muted-foreground">{event.dateApprox}</p>
                  <p className="font-medium group-hover:text-primary">{event.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                </Link>
                {i < data.events.length - 1 && <Separator className="mt-6 opacity-0" />}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
