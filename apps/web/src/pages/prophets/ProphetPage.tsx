import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { prophetsApi } from "@/features/prophets/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function ProphetPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["prophets", "detail", slug],
    queryFn: () => prophetsApi.getProphet(slug!),
    enabled: Boolean(slug),
  });
  useDocumentTitle(data?.name);

  if (!slug) return <Navigate to="/prophets" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: t("prophets.title"), href: "/prophets" }, ...(data ? [{ label: data.name }] : [])]}
      />

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
