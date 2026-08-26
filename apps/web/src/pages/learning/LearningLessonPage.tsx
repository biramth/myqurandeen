import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Check, Circle, ListChecks, BookMarked, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { learningApi } from "@/features/learning/api";
import { QuizBlock } from "@/features/learning/QuizBlock";
import { useAuth } from "@/features/auth/auth-context";

export function LearningLessonPage() {
  const { slug, order } = useParams<{ slug: string; order: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const orderNum = Number(order);

  const { data: path, isLoading, isError } = useQuery({
    queryKey: ["learning", "path", slug],
    queryFn: () => learningApi.getPath(slug!),
    enabled: Boolean(slug),
  });

  const { data: completedLessonIds } = useQuery({
    queryKey: ["learning", "progress"],
    queryFn: learningApi.getProgress,
    enabled: Boolean(user),
  });

  const lesson = path?.lessons.find((l) => l.order === orderNum);

  const { data: quiz } = useQuery({
    queryKey: ["learning", "lesson-quiz", lesson?.id],
    queryFn: () => learningApi.getLessonQuiz(lesson!.id),
    enabled: Boolean(lesson),
  });

  if (!slug || !order || Number.isNaN(orderNum)) return <Navigate to="/learn" replace />;

  const completedSet = new Set(completedLessonIds ?? []);
  const isCompleted = lesson ? completedSet.has(lesson.id) : false;

  const handleToggle = async () => {
    if (!lesson) return;
    await learningApi.toggleLesson(lesson.id);
    queryClient.invalidateQueries({ queryKey: ["learning", "progress"] });
  };

  const sortedLessons = path?.lessons.slice().sort((a, b) => a.order - b.order) ?? [];
  const index = sortedLessons.findIndex((l) => l.order === orderNum);
  const prevLesson = index > 0 ? sortedLessons[index - 1] : null;
  const nextLesson = index >= 0 && index < sortedLessons.length - 1 ? sortedLessons[index + 1] : null;

  const paragraphs = lesson?.content ? lesson.content.split("\n\n") : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to={`/learn/${slug}`}>
          <ArrowLeft className="h-4 w-4" />
          {t("learning.backToCourse")}
        </Link>
      </Button>

      {isError && <p className="text-sm text-destructive">{t("learning.errorPath")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {path && !lesson && <p className="text-sm text-destructive">{t("learning.errorLesson")}</p>}

      {lesson && (
        <>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("learning.lessonProgress", { current: index + 1, total: sortedLessons.length })}
          </p>
          <h1 className="mb-4 text-xl font-semibold">{lesson.title}</h1>

          {paragraphs.length > 0 && (
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex}>{paragraph}</p>
              ))}
            </div>
          )}

          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <div className="mt-5 rounded-md border bg-muted/40 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                <ListChecks className="h-3.5 w-3.5" />
                {t("learning.keyTakeaways")}
              </div>
              <ul className="space-y-1.5">
                {lesson.keyTakeaways.map((point, kIndex) => (
                  <li key={kIndex} className="flex gap-2 text-sm text-foreground/90">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lesson.references && lesson.references.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <BookMarked className="h-3 w-3" />
                {t("learning.references")} :
              </span>
              {lesson.references.map((ref, rIndex) => (
                <span key={rIndex} className="text-muted-foreground">
                  <Link to={ref.url} className="text-primary underline-offset-2 hover:underline">
                    {ref.label}
                  </Link>
                  {rIndex < lesson.references!.length - 1 && ","}
                </span>
              ))}
            </div>
          )}

          {quiz && quiz.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                <HelpCircle className="h-4 w-4" />
                {t("learning.lessonQuiz")}
              </div>
              <QuizBlock questions={quiz} />
            </>
          )}

          <Separator className="my-6" />

          <div className="flex items-center justify-center">
            <button
              type="button"
              disabled={!user}
              onClick={handleToggle}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isCompleted ? (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  {t("learning.markIncomplete")}
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" />
                  {t("learning.markComplete")}
                </>
              )}
            </button>
          </div>
          {!user && <p className="mt-2 text-center text-xs text-muted-foreground">{t("learning.loginToTrack")}</p>}

          <div className="mt-6 flex items-center justify-between gap-3">
            {prevLesson ? (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/learn/${slug}/lessons/${prevLesson.order}`}>
                  <ArrowLeft className="h-4 w-4" />
                  {t("learning.previousLesson")}
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Button size="sm" asChild>
                <Link to={`/learn/${slug}/lessons/${nextLesson.order}`}>
                  {t("learning.nextLesson")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to={`/learn/${slug}/quiz`}>
                  {t("learning.finalQuiz")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
