import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { prophetsApi } from "@/features/prophets/api";

export function ProphetPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["prophets", "detail", slug],
    queryFn: () => prophetsApi.getProphet(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) return <Navigate to="/prophets" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/prophets">
          <ArrowLeft className="h-4 w-4" />
          {t("prophets.backToList")}
        </Link>
      </Button>

      {isError && <p className="text-sm text-destructive">{t("prophets.errorDetail")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">{data.name}</h1>
            {data.nameArabic && (
              <span dir="rtl" className="font-arabic text-2xl">
                {data.nameArabic}
              </span>
            )}
          </div>

          <dl className="mb-6 space-y-1 text-sm text-muted-foreground">
            {data.era && (
              <div>
                <dt className="inline font-medium text-foreground">{t("prophets.era")} : </dt>
                <dd className="inline">{data.era}</dd>
              </div>
            )}
            {data.peopleAddressed && (
              <div>
                <dt className="inline font-medium text-foreground">{t("prophets.peopleAddressed")} : </dt>
                <dd className="inline">{data.peopleAddressed}</dd>
              </div>
            )}
            {data.quranicMentions && (
              <div>
                <dt className="inline font-medium text-foreground">{t("prophets.quranicMentions")} : </dt>
                <dd className="inline">{data.quranicMentions}</dd>
              </div>
            )}
          </dl>

          <p className="text-sm leading-relaxed">{data.description}</p>
        </>
      )}
    </div>
  );
}
