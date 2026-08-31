import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Callout } from "@/components/shared/Callout";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { schoolsApi } from "@/features/schools/api";
import { PageMeta } from "@/components/shared/PageMeta";

export function FiqhTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["schools", "fiqh-topic", slug],
    queryFn: () => schoolsApi.getFiqhTopicComparison(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) return <Navigate to="/fiqh" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageMeta title={data?.topic.title} description={data?.topic.description ?? undefined} />
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/fiqh">
          <ArrowLeft className="h-4 w-4" />
          {t("schools.backToComparator")}
        </Link>
      </Button>

      <Breadcrumbs
        items={[
          { label: t("schools.comparatorTitle"), href: "/fiqh" },
          ...(data ? [{ label: data.topic.title }] : []),
        ]}
      />

      {isError && <p className="text-sm text-destructive">{t("schools.errorDetail")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <h1 className="mb-1 text-xl font-semibold">{data.topic.title}</h1>
          {data.topic.description && <p className="mb-4 text-sm text-muted-foreground">{data.topic.description}</p>}

          <ContentUserActions targetType="fiqh_topic" targetId={data.topic.id} className="mb-6" />

          <div className="space-y-3">
            {data.positions.map((position) => (
              <Card key={position.schoolId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-wide">{position.schoolName}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm leading-relaxed">
                  <p>{position.positionText}</p>
                  {position.sourceTitle && (
                    <p className="mt-2 text-xs text-muted-foreground">{position.sourceTitle}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {data.divergenceNotes.length > 0 && (
            <Callout icon={HelpCircle} label={t("schools.whyDivergence")} className="mt-6">
              {data.divergenceNotes.map((note, i) => (
                <p key={i} className={i > 0 ? "mt-3" : undefined}>
                  {note.explanation}
                </p>
              ))}
            </Callout>
          )}
        </>
      )}
    </div>
  );
}
