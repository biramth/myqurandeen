import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGamificationEvent } from "@/features/gamification/useGamification";
import type { QuizQuestion } from "./types";

interface QuizBlockProps {
  questions: QuizQuestion[];
}

export function QuizBlock({ questions }: QuizBlockProps) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const track = useGamificationEvent();

  useEffect(() => {
    if (questions.length > 0 && Object.keys(answers).length === questions.length) {
      track("quiz_completed");
    }
  }, [answers, questions, track]);

  if (questions.length === 0) return null;

  const handleSelect = (questionId: string, optionId: string) => {
    if (answers[questionId]) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const correctCount = questions.filter((q) => {
    const selectedId = answers[q.id];
    return selectedId && q.options.find((o) => o.id === selectedId)?.isCorrect;
  }).length;

  return (
    <div className="space-y-5">
      {questions.map((q, i) => {
        const selectedId = answers[q.id];
        const isAnswered = Boolean(selectedId);
        return (
          <div key={q.id} className="rounded-md border p-4">
            <p className="font-medium">
              {i + 1}. {q.question}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const showCorrect = isAnswered && opt.isCorrect;
                const showWrong = isAnswered && isSelected && !opt.isCorrect;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(q.id, opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      !isAnswered && "hover:border-primary hover:bg-accent",
                      isAnswered && "cursor-default",
                      showCorrect && "border-primary bg-primary/10 text-primary",
                      showWrong && "border-destructive bg-destructive/10 text-destructive",
                    )}
                  >
                    <span>{opt.text}</span>
                    {showCorrect && <Check className="h-4 w-4 shrink-0" />}
                    {showWrong && <X className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {isAnswered && q.explanation && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
            )}
          </div>
        );
      })}

      {allAnswered && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 p-4">
          <p className="text-sm font-medium">
            {t("learning.quizScore", { score: correctCount, total: questions.length })}
          </p>
          <Button variant="outline" size="sm" onClick={() => setAnswers({})}>
            <RotateCcw className="h-3.5 w-3.5" />
            {t("learning.quizRetry")}
          </Button>
        </div>
      )}
    </div>
  );
}
