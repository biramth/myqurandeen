import { Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SignUpPromptPopover } from "@/components/shared/SignUpPromptPopover";
import { useAuth } from "@/features/auth/auth-context";
import { userDataApi } from "@/features/user-data/api";
import { useGamificationEvent } from "@/features/gamification/useGamification";
import type { TargetType } from "@/features/user-data/types";

interface BookmarkButtonProps {
  targetType: TargetType;
  targetId: string;
  size?: "default" | "sm";
}

/**
 * Bouton favori reutilisable, a deposer sur n'importe quelle page de detail
 * de contenu. Reste visible pour un visiteur non connecte - c'est ce qui
 * donne envie d'essayer - mais le clic ouvre alors une invitation a se
 * connecter/creer un compte plutot que d'effectuer l'action.
 */
export function BookmarkButton({ targetType, targetId, size = "default" }: BookmarkButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const track = useGamificationEvent();

  const queryKey = ["bookmark-check", targetType, targetId];
  const { data } = useQuery({
    queryKey,
    queryFn: () => userDataApi.checkBookmark(targetType, targetId),
    enabled: Boolean(user),
  });

  const mutation = useMutation({
    mutationFn: () => userDataApi.toggleBookmark(targetType, targetId),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result);
      queryClient.invalidateQueries({ queryKey: ["user-data", "bookmarks"] });
      toast.success(result.bookmarked ? t("bookmark.added") : t("bookmark.removed"));
      if (result.bookmarked) track("bookmark_added");
    },
    onError: () => toast.error(t("common.error")),
  });

  if (!user) {
    return (
      <SignUpPromptPopover
        description={t("authPrompt.bookmarkDescription")}
        trigger={
          <Button type="button" variant="outline" size={size}>
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            {t("bookmark.add")}
          </Button>
        }
      />
    );
  }

  const isBookmarked = data?.bookmarked ?? false;

  return (
    <Button
      type="button"
      variant={isBookmarked ? "secondary" : "outline"}
      size={size}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
      {isBookmarked ? t("bookmark.remove") : t("bookmark.add")}
    </Button>
  );
}
