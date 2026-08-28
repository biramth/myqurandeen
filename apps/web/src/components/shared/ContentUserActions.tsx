import { BookmarkButton } from "./BookmarkButton";
import { AddToCollectionButton } from "./AddToCollectionButton";
import { NoteWidget } from "./NoteWidget";
import type { TargetType } from "@/features/user-data/types";

interface ContentUserActionsProps {
  targetType: TargetType;
  targetId: string;
  className?: string;
}

/** Regroupe favori / collection / note pour un contenu donne - a deposer sur les pages de detail. N'affiche rien pour un visiteur non connecte (chaque sous-composant se masque deja seul). */
export function ContentUserActions({ targetType, targetId, className }: ContentUserActionsProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <BookmarkButton targetType={targetType} targetId={targetId} />
        <AddToCollectionButton targetType={targetType} targetId={targetId} />
      </div>
      <div className="mt-2">
        <NoteWidget targetType={targetType} targetId={targetId} />
      </div>
    </div>
  );
}
