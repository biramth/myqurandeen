import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/auth-context";
import { fiqhSuggestionsApi } from "./api";

/**
 * Formulaire (dans une Dialog) permettant a un utilisateur connecte de
 * proposer un nouveau sujet pour le comparateur de fiqh. La suggestion part
 * a l'etat "NOUVELLE" et est ensuite triee cote admin (onglet Suggestions).
 */
export function SuggestFiqhQuestionButton() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [context, setContext] = React.useState("");

  const mutation = useMutation({
    mutationFn: () => fiqhSuggestionsApi.create(question.trim(), context.trim()),
    onSuccess: () => {
      toast.success(t("schools.suggestQuestionSuccess"));
      setQuestion("");
      setContext("");
      setOpen(false);
    },
    onError: () => toast.error(t("schools.suggestQuestionError")),
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          {t("schools.suggestQuestion")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("schools.suggestQuestionTitle")}</DialogTitle>
          <DialogDescription>{t("schools.suggestQuestionDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fiqh-suggestion-question">{t("schools.suggestQuestion")}</Label>
            <Textarea
              id="fiqh-suggestion-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("schools.suggestQuestionPlaceholder")}
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fiqh-suggestion-context">{t("schools.suggestQuestionContextPlaceholder")}</Label>
            <Textarea
              id="fiqh-suggestion-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t("schools.suggestQuestionContextPlaceholder")}
              rows={2}
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={question.trim().length < 10 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? t("schools.suggestQuestionSubmitting") : t("schools.suggestQuestionSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
