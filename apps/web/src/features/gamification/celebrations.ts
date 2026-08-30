export type Celebration =
  | { kind: "level"; level: number; levelTitle: string }
  | { kind: "achievement"; keys: string[] }
  | { kind: "streak"; count: number };

type Listener = (celebration: Celebration) => void;

const listeners = new Set<Listener>();

/**
 * Petite file d'evenements de celebration locale : les hooks qui declenchent
 * des emotions (streak, XP, succes) emettent ici, et CelebrationHost (monte
 * dans AppLayout) affiche confettis + toasts. Evite de coupler toutes les
 * pages a un provider React Query partage.
 */
export const celebrations = {
  emit(celebration: Celebration) {
    listeners.forEach((listener) => listener(celebration));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};