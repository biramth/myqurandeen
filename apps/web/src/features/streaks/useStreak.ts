import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/auth-context";
import { getLocalDateString } from "@/lib/local-date";
import { celebrations } from "@/features/gamification/celebrations";
import { streaksApi } from "./api";

export const STREAK_QUERY_KEY = ["streaks", "me"] as const;
const PING_STORAGE_PREFIX = "qurandeen-streak-ping-";

/** Statut de la serie d'activite de l'utilisateur connecte (null si non connecte). */
export function useStreakStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: STREAK_QUERY_KEY,
    queryFn: streaksApi.me,
    enabled: Boolean(user),
    staleTime: 60_000,
  });
}

/**
 * A appeler une fois par page de contenu significatif (lecture d'un verset,
 * d'un hadith, d'une dua, d'une lecon...) : enregistre l'activite du jour
 * pour la serie. Limite a un seul appel reseau par jour calendaire local et
 * par utilisateur (via localStorage) - le backend est de toute facon
 * idempotent par jour, mais ca evite un appel a chaque navigation et un
 * toast repete sur chaque page.
 */
export function useStreakPing(): void {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!user) return;
    const today = getLocalDateString();
    const storageKey = `${PING_STORAGE_PREFIX}${user.id}-${today}`;
    let alreadyPinged: string | null = null;
    try {
      alreadyPinged = window.localStorage.getItem(storageKey);
    } catch {
      // localStorage indisponible (navigation privee stricte...) : on ping quand meme, juste sans dedoublonnage local.
    }
    if (alreadyPinged) return;

    let cancelled = false;
    streaksApi
      .ping()
      .then((status) => {
        if (cancelled) return;
        try {
          window.localStorage.setItem(storageKey, "1");
        } catch {
          // Ignore : au pire on rappelle l'API demain matin sans consequence (idempotent).
        }
        const previous = queryClient.getQueryData<{ currentStreak: number }>(STREAK_QUERY_KEY);
        queryClient.setQueryData(STREAK_QUERY_KEY, status);
        if (status.currentStreak > 1 && (!previous || previous.currentStreak < status.currentStreak)) {
          toast.success(t("streak.increased", { count: status.currentStreak }));
          celebrations.emit({ kind: "streak", count: status.currentStreak });
        }
      })
      .catch(() => {
        // Echec silencieux : la serie n'est pas une fonctionnalite critique, pas la peine d'interrompre la lecture.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
}
