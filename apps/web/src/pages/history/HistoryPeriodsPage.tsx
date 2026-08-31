import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { History as HistoryIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { historyApi } from "@/features/history/api";
import { PageMeta } from "@/components/shared/PageMeta";

export function HistoryPeriodsPage() {
  const { t } = useTranslation();
  const { data: periods, isLoading, isError } = useQuery({
    queryKey: ["history", "periods"],
    queryFn: historyApi.listPeriods,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta title={t("history.title")} description={t("history.subtitle")} />
      <div className="mb-8 flex items-center gap-3">
        <HistoryIcon className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("history.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("history.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("history.errorList")}</p>}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {periods?.map((period) => (
          <Link key={period.id} to={`/history/${period.slug}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{period.name}</p>
                  {(period.startYear || period.endYear) && (
                    <p className="text-sm text-muted-foreground">
                      {period.startYear} - {period.endYear}
                    </p>
                  )}
                </div>
                {period.region && <p className="text-sm text-muted-foreground">{period.region}</p>}
                {period.description && <p className="mt-1 text-sm text-muted-foreground">{period.description}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
