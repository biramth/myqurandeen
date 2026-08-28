import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { schoolsApi } from "@/features/schools/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { SuggestFiqhQuestionButton } from "@/features/fiqh-suggestions/SuggestFiqhQuestionButton";

export function FiqhComparatorPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("schools.comparatorTitle"));
  const { data: topics, isLoading, isError } = useQuery({
    queryKey: ["schools", "fiqh-topics"],
    queryFn: schoolsApi.listFiqhTopics,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/schools">
          <ArrowLeft className="h-4 w-4" />
          {t("schools.backToSchools")}
        </Link>
      </Button>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Scale className="h-7 w-7 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("schools.comparatorTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("schools.comparatorSubtitle")}</p>
          </div>
        </div>
        <SuggestFiqhQuestionButton />
      </div>

      {isError && <p className="text-sm text-destructive">{t("schools.error")}</p>}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {topics?.map((topic) => (
          <Link key={topic.id} to={`/fiqh/${topic.slug}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="p-4">
                <p className="font-medium">{topic.title}</p>
                {topic.category && <p className="text-sm text-muted-foreground">{topic.category}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
