import { Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { userDataApi } from "@/features/user-data/api";
import type { TargetType } from "@/features/user-data/types";

interface BookmarkButtonProps {
  targetType: TargetType;
  targetId: string;
  size?: "default" | "sm";
}

/** Bouton favori reutilisable, a deposer sur n'importe quelle page de detail de contenu. N'affiche rien si l'utilisateur n'est pas connecte. */
export function BookmarkButton({ targetType, targetId, size = "default" }: BookmarkButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
    },
    onError: () => toast.error(t("common.error")),
  });

  if (!user) return null;

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
