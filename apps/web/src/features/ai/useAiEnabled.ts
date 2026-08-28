import { useQuery } from "@tanstack/react-query";
import { aiApi } from "./api";

/**
 * L'assistant IA ne doit apparaitre dans la navigation que s'il est
 * reellement utilisable (cle API configuree cote backend, etc.) - sinon on
 * affiche un point d'entree vers une fonctionnalite indisponible, ce qui a
 * l'air casse (utile par ex. pour un deploiement de test sans IA activee).
 * `/ai/health` est public et bon marche, donc safe a interroger depuis la
 * nav elle-meme plutot que de dupliquer un flag de build.
 */
export function useAiEnabled(): boolean {
  const { data } = useQuery({
    queryKey: ["ai", "health"],
    queryFn: aiApi.health,
    staleTime: 5 * 60 * 1000,
  });
  return data?.ready ?? false;
}
