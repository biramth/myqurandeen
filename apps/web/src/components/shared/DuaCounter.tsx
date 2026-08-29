import * as React from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DuaCounterProps {
  target: number;
}

/**
 * Compteur de repetitions pour une invocation (ex. "Subhanallah" x33).
 * Purement local (useState) - pas de persistance ni de synchronisation
 * entre appareils, comme un compteur de tasbih physique : l'objectif est
 * d'accompagner une seance de recitation en cours, pas de suivre un
 * historique long terme.
 */
export function DuaCounter({ target }: DuaCounterProps) {
  const { t } = useTranslation();
  const [count, setCount] = React.useState(0);
  const done = count >= target;

  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-2">
      <Button
        type="button"
        variant={done ? "outline" : "default"}
        size="sm"
        className="min-w-[88px]"
        onClick={() => setCount((c) => Math.min(c + 1, target))}
        disabled={done}
      >
        {done ? t("duas.counterDone") : t("duas.counterTap")}
      </Button>
      <span className={cn("text-sm font-medium tabular-nums", done && "text-primary")}>
        {count} / {target}
      </span>
      {count > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ms-auto h-8 w-8 p-0"
          onClick={() => setCount(0)}
          aria-label={t("duas.counterReset")}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
