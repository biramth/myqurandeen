import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { GamificationEventType } from "@qurandeen/shared";
import { useAuth } from "@/features/auth/auth-context";
import { getLocalDateString } from "@/lib/local-date";
import { gamificationApi } from "./api";
import { celebrations } from "./celebrations";

export const GAMIFICATION_QUERY_KEY = ["gamification"] as const;

/** État complet du profil gamification de l'utilisateur connecté (null si non connecté ou non actif). */
export function useGamificationStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: GAMIFICATION_QUERY_KEY,
    queryFn: gamificationApi.profile,
    enabled: Boolean(user),
    staleTime: 60_000,
  });
}

/**
 * Enregistre une action significative (lecture, leçon, note, favori...) et
 * déclenche les célébrations (confettis, niveau, succès). Anti-spam local :
 * ignore les appels identiques en moins de ~6s pour éviter les doubles envois
 * (StrictMode, navigation rapide). Échec silencieux (gamification non critique).
 */
export function useGamificationEvent() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const lastTracked = React.useRef<Partial<Record<GamificationEventType, number>>>({});

  const mutation = useMutation({
    mutationFn: ({
      type,
      hour,
      localDate,
    }: {
      type: GamificationEventType;
      hour?: number;
      localDate?: string;
    }) => gamificationApi.record(type, { hour, localDate }),
    onSuccess: (res) => {
      if (res.leveledUp || res.newlyUnlocked.length > 0 || res.xpGained > 0) {
        queryClient.invalidateQueries({ queryKey: ["gamification"] });
      }
      if (res.leveledUp) {
        celebrations.emit({
          kind: "level",
          level: res.level,
          levelTitle: t(`gamification.levels.${res.level}`, { defaultValue: String(res.level) }),
        });
      }
      if (res.newlyUnlocked.length > 0) {
        celebrations.emit({ kind: "achievement", keys: res.newlyUnlocked.map((a) => a.key) });
      }
    },
  });

  const track = React.useCallback(
    (type: GamificationEventType) => {
      const now = Date.now();
      if (lastTracked.current[type] && now - lastTracked.current[type]! < 6000) return;
      lastTracked.current[type] = now;
      mutation.mutate({ type, hour: new Date().getHours(), localDate: getLocalDateString() });
    },
    [mutation],
  );

  return track;
}