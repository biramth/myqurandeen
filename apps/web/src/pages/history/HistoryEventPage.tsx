import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { historyApi } from "@/features/history/api";

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
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to={data?.period ? `/history/${data.period.slug}` : "/history"}>
          <ArrowLeft className="h-4 w-4" />
          {t("history.back")}
        </Link>
      </Button>

      {isError && <p className="text-sm text-destructive">{t("history.errorEvent")}</p>}
      {isLoading && <Skeleton className="h-48 w-full" />}

      {data && (
        <>
          {data.period && <p className="mb-1 text-sm text-muted-foreground">{data.period.name}</p>}
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-xl font-semibold">{data.event.title}</h1>
            {data.event.dateApprox && <Badge variant="secondary">{data.event.dateApprox}</Badge>}
          </div>
          <p className="text-sm leading-relaxed">{data.event.description}</p>

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
