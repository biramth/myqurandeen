import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import { userDataApi } from "./api";
import type { TargetType } from "./types";

/**
 * Enregistre la position de lecture (targetType, targetId) pour le widget
 * "Reprendre o� j'en �tais". Ne fait rien pour un visiteur non connecte.
 * Debounce : une seule emission par (target) par session, pour ne pas
 * spammer l'API a chaque chargement de page.
 */
export function useRecordLastRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastRecorded = React.useRef<string | null>(null);

  return React.useCallback(
    (targetType: TargetType, targetId: string) => {
      if (!user) return;
      const key = `${targetType}:${targetId}`;
      if (lastRecorded.current === key) return;
      lastRecorded.current = key;
      void userDataApi
        .recordLastRead(targetType, targetId)
        .then(() => queryClient.invalidateQueries({ queryKey: ["user-data", "last-read"] }))
        .catch(() => undefined);
    },
    [user, queryClient],
  );
}