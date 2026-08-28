import * as React from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sparkles, Send, Loader2, BookMarked, TriangleAlert, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth-context";
import { aiApi } from "@/features/ai/api";
import { resolveSourceLink } from "@/features/ai/source-links";
import type { AiQueryResult } from "@/features/ai/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface Exchange {
  id: string;
  question: string;
  result?: AiQueryResult;
  error?: boolean;
}

export function AssistantPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  useDocumentTitle(t("assistant.title"));
  const [question, setQuestion] = React.useState("");
  const [exchanges, setExchanges] = React.useState<Exchange[]>([]);

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["ai", "health"],
    queryFn: aiApi.health,
  });

  const queryMutation = useMutation({
    mutationFn: (q: string) => aiApi.query(q),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || queryMutation.isPending) return;

    const id = crypto.randomUUID();
    setExchanges((prev) => [{ id, question: trimmed }, ...prev]);
    setQuestion("");

    queryMutation.mutate(trimmed, {
      onSuccess: (result) => {
        setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, result } : e)));
      },
      onError: () => {
        setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, error: true } : e)));
      },
    });
  };

  const notReady = health && !health.ready;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-2 flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("assistant.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("assistant.subtitle")}</p>
        </div>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">{t("assistant.disclaimer")}</p>

      {healthLoading && <Skeleton className="h-10 w-full" />}

      {notReady && (
        <div className="mb-6 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t("assistant.notReady")}</span>
        </div>
      )}

      {!user ? (
        <div className="mb-8 flex items-center justify-between gap-3 rounded-md border p-4 text-sm">
          <span>{t("assistant.loginRequired")}</span>
          <Button asChild size="sm">
            <Link to="/login">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {t("assistant.logIn")}
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("assistant.placeholder")}
            disabled={Boolean(notReady) || queryMutation.isPending}
            aria-label={t("assistant.placeholder")}
          />
          <Button type="submit" disabled={Boolean(notReady) || queryMutation.isPending || !question.trim()}>
            {queryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("assistant.ask")}
          </Button>
        </form>
      )}

      <div className="space-y-6">
        {exchanges.map((exchange) => (
          <div key={exchange.id} className="rounded-md border p-4">
            <p className="mb-3 text-sm font-medium">{exchange.question}</p>

            {!exchange.result && !exchange.error && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("assistant.thinking")}
              </div>
            )}

            {exchange.error && <p className="text-sm text-destructive">{t("assistant.error")}</p>}

            {exchange.result && (
              <>
                <p className="whitespace-pre-line text-sm leading-relaxed">{exchange.result.answer}</p>

                {exchange.result.sources.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <BookMarked className="h-3.5 w-3.5" />
                      {t("assistant.sources")}
                    </div>
                    <ul className="space-y-1.5">
                      {exchange.result.sources.map((source, i) => {
                        const href = resolveSourceLink(source);
                        const label = source.contextText ?? source.contentType;
                        return (
                          <li key={i} className="text-xs text-muted-foreground">
                            {href ? (
                              <Link to={href} className="text-primary underline-offset-2 hover:underline">
                                {label}
                              </Link>
                            ) : (
                              <span>{label}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {exchanges.length === 0 && !notReady && (
          <p className="text-center text-sm text-muted-foreground">{t("assistant.empty")}</p>
        )}
      </div>
    </div>
  );
}
