import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { scholarsApi } from "@/features/scholars/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function ScholarsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("scholars.title"));
  const { data: scholars, isLoading, isError } = useQuery({
    queryKey: ["scholars"],
    queryFn: scholarsApi.listScholars,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <GraduationCap className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("scholars.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("scholars.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("scholars.error")}</p>}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {scholars?.map((scholar) => (
          <Link key={scholar.id} to={`/scholars/${scholar.slug}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{scholar.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {scholar.bornYear ?? "?"} - {scholar.diedYear ?? "?"}
                    {scholar.expertise && scholar.expertise.length > 0 ? ` - ${scholar.expertise.join(", ")}` : ""}
                  </p>
                </div>
                {scholar.nameArabic && (
                  <span dir="rtl" className="shrink-0 font-arabic text-lg text-muted-foreground">
                    {scholar.nameArabic}
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
