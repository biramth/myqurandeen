import * as React from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SignUpPromptPopover } from "@/components/shared/SignUpPromptPopover";
import { useAuth } from "@/features/auth/auth-context";
import { userDataApi } from "@/features/user-data/api";
import { useGamificationEvent } from "@/features/gamification/useGamification";
import type { TargetType } from "@/features/user-data/types";

interface NoteWidgetProps {
  targetType: TargetType;
  targetId: string;
}

/**
 * Notes personnelles rattachees a un contenu precis : depliable, sans
 * encombrer la page tant que l'utilisateur ne l'ouvre pas. Reste visible
 * sans compte - cliquer invite alors a se connecter/creer un compte plutot
 * que de deplier l'editeur de note.
 */
export function NoteWidget({ targetType, targetId }: NoteWidgetProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const track = useGamificationEvent();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  const queryKey = ["user-data", "notes", targetType, targetId];
  const { data: notes } = useQuery({
    queryKey,
    queryFn: () => userDataApi.listNotesForTarget(targetType, targetId),
    enabled: Boolean(user) && open,
  });

  const createMutation = useMutation({
    mutationFn: () => userDataApi.createNote(targetType, targetId, draft.trim()),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey });
      toast.success(t("notes.saved"));
      track("note_created");
    },
    onError: () => toast.error(t("common.error")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userDataApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(t("notes.deleted"));
    },
    onError: () => toast.error(t("common.error")),
  });

  if (!user) {
    return (
      <SignUpPromptPopover
        description={t("authPrompt.noteDescription")}
        trigger={
          <Button type="button" variant="ghost" size="sm">
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            {t("notes.title")}
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
        <NotebookPen className="h-4 w-4" aria-hidden="true" />
        {t("notes.title")}
        {notes && notes.length > 0 ? ` (${notes.length})` : ""}
      </Button>
      {open ? (
        <div className="mt-2 space-y-3 rounded-md border p-3">
          {notes?.map((note) => (
            <div key={note.id} className="flex items-start justify-between gap-2 rounded-md bg-muted/50 p-2 text-sm">
              <p className="whitespace-pre-wrap">{note.content}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => deleteMutation.mutate(note.id)}
                aria-label={t("notes.delete")}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("notes.placeholder")}
              className="min-h-[60px] text-sm"
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!draft.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {t("notes.save")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
