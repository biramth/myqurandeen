import type { ReactNode } from "react";
import { BookmarkButton } from "./BookmarkButton";
import { AddToCollectionButton } from "./AddToCollectionButton";
import { NoteWidget } from "./NoteWidget";
import type { TargetType } from "@/features/user-data/types";

interface ContentUserActionsProps {
  targetType: TargetType;
  targetId: string;
  className?: string;
  /** "sm" pour un usage compact (ex. dans une liste de cartes) plutot que sur une page de detail dediee. */
  size?: "default" | "sm";
  /** Bouton(s) supplementaire(s) affiches sur la meme ligne que Notes (ex. QuickReminderButton sur duas/sourates). */
  extra?: ReactNode;
}

/**
 * Regroupe favori / collection / note pour un contenu donne - a deposer sur
 * les pages de detail. Reste visible pour un visiteur non connecte : chaque
 * sous-composant invite alors a creer un compte au clic plutot que de se
 * masquer (voir SignUpPromptPopover).
 */
export function ContentUserActions({ targetType, targetId, className, size = "default", extra }: ContentUserActionsProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <BookmarkButton targetType={targetType} targetId={targetId} size={size} />
        <AddToCollectionButton targetType={targetType} targetId={targetId} size={size} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <NoteWidget targetType={targetType} targetId={targetId} />
        {extra}
      </div>
    </div>
  );
}
