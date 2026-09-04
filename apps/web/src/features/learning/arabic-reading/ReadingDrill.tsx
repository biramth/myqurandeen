import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DrillItem {
  /** Texte arabe a lire (syllabe, mot, ou courte suite de mots selon la lecon). */
  arabic: string;
  /** Translitteration - sert de correction, masquee par defaut pour encourager une vraie tentative de lecture. */
  transliteration: string;
  /** Sens (facultatif) - seulement pour les vrais mots, jamais pour de simples syllabes d'exercice. */
  meaning?: string;
}

/**
 * Exercice de lecture progressive (ROADMAP.md, cours "apprendre a lire
 * l'arabe coranique") : une liste d'items a dechiffrer, translitteration
 * masquee par defaut et revelee au clic (par item ou globalement) - pousse
 * a vraiment essayer de lire avant de verifier, plutot que de presenter la
 * translitteration en clair a cote de chaque mot des le depart.
 */
export function ReadingDrill({ items, title }: { items: DrillItem[]; title?: string }) {
  const [revealed, setRevealed] = React.useState<Set<number>>(new Set());
  const allRevealed = revealed.size === items.length;

  const toggleOne = (index: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    setRevealed(allRevealed ? new Set() : new Set(items.map((_, i) => i)));
  };

  return (
    <div className="my-4 rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        {title && <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>}
        <Button type="button" variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={toggleAll}>
          {allRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {allRevealed ? "Tout masquer" : "Tout révéler"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item, index) => {
          const isRevealed = revealed.has(index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => toggleOne(index)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border bg-card px-2 py-3 text-center transition-colors hover:border-primary/50",
              )}
            >
              <span dir="rtl" lang="ar" className="font-arabic text-2xl">
                {item.arabic}
              </span>
              {isRevealed ? (
                <span className="text-xs text-muted-foreground">
                  {item.transliteration}
                  {item.meaning && <span className="block italic">{item.meaning}</span>}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/40">?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
