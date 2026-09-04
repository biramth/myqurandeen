import { PrayerPostureDiagram } from "./PrayerPostureDiagram";
import { WuduStepsDiagram } from "./WuduStepsDiagram";
import {
  AlifAndNonConnectingIntro,
  ConcatenationDrillWidget,
  FullAlphabetTable,
  GroupAynGhaynFaQafTable,
  GroupBaTaThaTable,
  GroupDalRaTable,
  GroupEmphaticTable,
  GroupFinalTable,
  GroupJimHaKhaTable,
  GroupSinShinTable,
  LongVowelsDrillWidget,
  ShaddaDrillWidget,
  ShamsiyyaQamariyyaDrillWidget,
  ShortVowelsDrillWidget,
  SukunDrillWidget,
  TanweenDrillWidget,
  WaslaTaMarbutaDrillWidget,
} from "../arabic-reading/lesson-widgets";

/**
 * Mapping (parcours, ordre de la leçon) -> illustration a afficher au-dessus
 * du contenu de la leçon. Volontairement une table de correspondance plutôt
 * qu'un champ en base : peu de leçons sont concernees pour l'instant, et ça
 * evite une migration de schema pour un besoin encore experimental.
 */
const LESSON_ILLUSTRATIONS: Record<string, React.ComponentType> = {
  "pratique-de-la-priere:2": WuduStepsDiagram,
  "pratique-de-la-priere:3": PrayerPostureDiagram,
  "lire-arabe-coranique:2": AlifAndNonConnectingIntro,
  "lire-arabe-coranique:3": GroupBaTaThaTable,
  "lire-arabe-coranique:4": GroupJimHaKhaTable,
  "lire-arabe-coranique:5": GroupDalRaTable,
  "lire-arabe-coranique:6": GroupSinShinTable,
  "lire-arabe-coranique:7": GroupEmphaticTable,
  "lire-arabe-coranique:8": GroupAynGhaynFaQafTable,
  "lire-arabe-coranique:9": GroupFinalTable,
  "lire-arabe-coranique:10": FullAlphabetTable,
  "lire-arabe-coranique:11": ShortVowelsDrillWidget,
  "lire-arabe-coranique:12": SukunDrillWidget,
  "lire-arabe-coranique:13": ShaddaDrillWidget,
  "lire-arabe-coranique:14": ConcatenationDrillWidget,
  "lire-arabe-coranique:15": LongVowelsDrillWidget,
  "lire-arabe-coranique:16": TanweenDrillWidget,
  "lire-arabe-coranique:17": WaslaTaMarbutaDrillWidget,
  "lire-arabe-coranique:18": ShamsiyyaQamariyyaDrillWidget,
};

export function LessonIllustration({ pathSlug, order }: { pathSlug: string; order: number }) {
  const Illustration = LESSON_ILLUSTRATIONS[`${pathSlug}:${order}`];
  if (!Illustration) return null;
  return <Illustration />;
}
