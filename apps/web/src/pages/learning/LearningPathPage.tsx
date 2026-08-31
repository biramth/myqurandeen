import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, ChevronRight, Circle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { learningApi } from "@/features/learning/api";
import { useAuth } from "@/features/auth/auth-context";
import { PageMeta } from "@/components/shared/PageMeta";

const LEVEL_KEYS = { beginner: "learning.beginner", intermediate: "learning.intermediate", advanced: "learning.advanced" } as const;

export function LearningPathPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["learning", "path", slug],
    queryFn: () => learningApi.getPath(slug!),
    enabled: Boolean(slug),
  });
  const { data: completedLessonIds } = useQuery({
    queryKey: ["learning", "progress"],
    queryFn: learningApi.getProgress,
    enabled: Boolean(user),
  });

  const completedSet = new Set(completedLessonIds ?? []);
  const completedCount = data?.lessons.filter((l) => completedSet.has(l.id)).length ?? 0;

  if (!slug) return <Navigate to="/learn" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageMeta title={data?.title} description={data?.description ?? undefined} />
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/learn">
          <ArrowLeft className="h-4 w-4" />
          {t("learning.backToList")}
        </Link>
      </Button>

      {isError && <p className="text-sm text-destructive">{t("learning.errorPath")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-xl font-semibold">{data.title}</h1>
            <Badge variant="secondary">{t(LEVEL_KEYS[data.level])}</Badge>
          </div>
          {data.description && <p className="mb-4 text-sm text-muted-foreground">{data.description}</p>}

          {user ? (
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between text-sm text-muted-foreground">
                <span>{t("learning.progress")}</span>
                <span>
                  {completedCount} / {data.lessons.length}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${data.lessons.length ? (completedCount / data.lessons.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="mb-6 text-sm text-muted-foreground">{t("learning.loginToTrack")}</p>
          )}

          <div className="mb-6 overflow-hidden rounded-md border">
            {data.lessons.map((lesson, i) => {
              const isCompleted = completedSet.has(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  to={`/learn/${data.slug}/lessons/${lesson.order}`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent ${i > 0 ? "border-t" : ""}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {lesson.order}. {lesson.title}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>

          <Link
            to={`/learn/${data.slug}/quiz`}
            className="flex items-center gap-3 rounded-md border bg-muted/40 px-4 py-3 text-sm hover:bg-accent"
          >
            <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">{t("learning.finalQuiz")}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </>
      )}
    </div>
  );
}
