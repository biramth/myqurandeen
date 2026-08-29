import { PrayerPostureDiagram } from "./PrayerPostureDiagram";
import { WuduStepsDiagram } from "./WuduStepsDiagram";

/**
 * Mapping (parcours, ordre de la leçon) -> illustration a afficher au-dessus
 * du contenu de la leçon. Volontairement une table de correspondance plutôt
 * qu'un champ en base : peu de leçons sont concernees pour l'instant, et ça
 * evite une migration de schema pour un besoin encore experimental.
 */
const LESSON_ILLUSTRATIONS: Record<string, React.ComponentType> = {
  "pratique-de-la-priere:2": WuduStepsDiagram,
  "pratique-de-la-priere:3": PrayerPostureDiagram,
};

export function LessonIllustration({ pathSlug, order }: { pathSlug: string; order: number }) {
  const Illustration = LESSON_ILLUSTRATIONS[`${pathSlug}:${order}`];
  if (!Illustration) return null;
  return <Illustration />;
}
