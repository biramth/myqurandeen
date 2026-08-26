import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { historyApi } from "@/features/history/api";

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
      <Breadcrumbs
        items={[{ label: t("history.title"), href: "/history" }, ...(data ? [{ label: data.name }] : [])]}
      />

      {isError && <p className="text-sm text-destructive">{t("history.errorPeriod")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <header className="mb-6">
            <h1 className="text-xl font-semibold">{data.name}</h1>
            <p className="text-sm text-muted-foreground">
              {data.startYear} - {data.endYear} {data.region ? `- ${data.region}` : ""}
            </p>
            {data.description && <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>}
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
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
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
