import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { learningApi } from "@/features/learning/api";
import { QuizBlock } from "@/features/learning/QuizBlock";
import { PageMeta } from "@/components/shared/PageMeta";

export function LearningQuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data: path } = useQuery({
    queryKey: ["learning", "path", slug],
    queryFn: () => learningApi.getPath(slug!),
    enabled: Boolean(slug),
  });

  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ["learning", "path-quiz", slug],
    queryFn: () => learningApi.getPathQuiz(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) return <Navigate to="/learn" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageMeta title={t("learning.finalQuiz")} />
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to={`/learn/${slug}`}>
          <ArrowLeft className="h-4 w-4" />
          {t("learning.backToCourse")}
        </Link>
      </Button>

      <div className="mb-6 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">
          {t("learning.finalQuiz")}
          {path && <span className="text-muted-foreground"> - {path.title}</span>}
        </h1>
      </div>

      {isError && <p className="text-sm text-destructive">{t("learning.errorQuiz")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}
      {quiz && quiz.length === 0 && <p className="text-sm text-muted-foreground">{t("learning.noQuiz")}</p>}
      {quiz && quiz.length > 0 && <QuizBlock questions={quiz} />}
    </div>
  );
}
