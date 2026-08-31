import type { ReactNode } from "react";
import { BookmarkButton } from "./BookmarkButton";
import { AddToCollectionButton } from "./AddToCollectionButton";
import { NoteWidget } from "./NoteWidget";
import { ShareButton, type ShareContent } from "./ShareButton";
import { ShareCard } from "./ShareCard";
import type { TargetType } from "@/features/user-data/types";

interface ContentUserActionsProps {
  targetType: TargetType;
  targetId: string;
  className?: string;
  /** "sm" pour un usage compact (ex. dans une liste de cartes) plutot que sur une page de detail dediee. */
  size?: "default" | "sm";
  /** Bouton(s) supplementaire(s) affiches sur la meme ligne que Notes (ex. QuickReminderButton sur duas/sourates). */
  extra?: ReactNode;
  /** Fournir pour afficher le bouton "Partager" (carte visuelle generee) - omis si le contenu n'a rien de pertinent a partager. */
  shareContent?: ShareContent;
}

/**
 * Regroupe favori / collection / note / partage pour un contenu donne - a
 * deposer sur les pages de detail. Reste visible pour un visiteur non
 * connecte : chaque sous-composant invite alors a creer un compte au clic
 * plutot que de se masquer (voir SignUpPromptPopover) - le partage, lui,
 * reste utilisable sans compte (aucune donnee utilisateur impliquee).
 */
export function ContentUserActions({ targetType, targetId, className, size = "default", extra, shareContent }: ContentUserActionsProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <BookmarkButton targetType={targetType} targetId={targetId} size={size} />
        <AddToCollectionButton targetType={targetType} targetId={targetId} size={size} />
        {shareContent && (
          <ShareButton
            content={shareContent}
            size={size}
            renderCard={(ref) => (
              <ShareCard
                ref={ref}
                title={shareContent.title}
                body={shareContent.body}
                arabicText={shareContent.arabicText}
                transliteration={shareContent.transliteration}
                source={shareContent.source}
              />
            )}
          />
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <NoteWidget targetType={targetType} targetId={targetId} />
        {extra}
      </div>
    </div>
  );
}
