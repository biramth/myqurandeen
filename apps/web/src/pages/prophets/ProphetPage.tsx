import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BookOpen, Clock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProseText } from "@/components/shared/ProseText";
import { prophetsApi } from "@/features/prophets/api";
import { PageMeta, SITE_URL, buildOgImage, withShareUtm } from "@/components/shared/PageMeta";
import { ShareButton } from "@/components/shared/ShareButton";
import { ShareCard } from "@/components/shared/ShareCard";

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
      <PageMeta
        title={data?.name}
        description={data?.description}
        image={data ? buildOgImage({ title: data.name, arabicText: data.nameArabic ?? undefined, body: data.description }) : undefined}
      />
      <Breadcrumbs
        items={[{ label: t("prophets.title"), href: "/prophets" }, ...(data ? [{ label: data.name }] : [])]}
      />

      {isError && <p className="text-sm text-destructive">{t("prophets.errorDetail")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <div className="mb-1 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-5 w-5" aria-hidden="true" />
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

          {(data.era || data.peopleAddressed || data.quranicMentions) && (
            <div className="mb-6 mt-4 space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
              {data.era && (
                <p className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>
                    <span className="text-muted-foreground">{t("prophets.era")} : </span>
                    {data.era}
                  </span>
                </p>
              )}
              {data.peopleAddressed && (
                <p className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>
                    <span className="text-muted-foreground">{t("prophets.peopleAddressed")} : </span>
                    {data.peopleAddressed}
                  </span>
                </p>
              )}
              {data.quranicMentions && (
                <p className="flex items-start gap-2">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>
                    <span className="text-muted-foreground">{t("prophets.quranicMentions")} : </span>
                    {data.quranicMentions}
                  </span>
                </p>
              )}
            </div>
          )}

          <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("prophets.narrative")}
          </h2>
          <ProseText text={data.description} />

          {/* Pas de ContentUserActions ici : "prophet" n'a pas de TargetType
              dedie (favoris/notes absents de cette page, lacune preexistante
              et hors sujet) - bouton de partage autonome. */}
          <div className="mt-4">
            <ShareButton
              size="sm"
              content={{ title: data.name, url: withShareUtm(`${SITE_URL}/prophets/${slug}`, "content") }}
              renderCard={(ref) => (
                <ShareCard ref={ref} title={data.name} arabicText={data.nameArabic ?? undefined} body={data.description} />
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
