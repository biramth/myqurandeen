import { useTranslation } from "react-i18next";
import { ArrowRight, RotateCcw } from "lucide-react";

interface Posture {
  key: string;
  arabic: string;
  path: string;
  headCx: number;
  headCy: number;
}

// Silhouettes volontairement abstraites (cercle + traits) plutot que des
// figures anatomiques detaillees : l'objectif est de rendre la sequence des
// quatre postures immediatement lisible d'un coup d'œil, pas de reproduire
// une gestuelle precise. ViewBox 0 0 48 48, meme langage graphique que les
// icones Lucide du reste du site (trait, currentColor).
const POSTURES: Posture[] = [
  {
    key: "qiyam",
    arabic: "قِيَام",
    headCx: 24,
    headCy: 8,
    path: "M24,13 L24,32 M24,32 L18,44 M24,32 L30,44 M24,17 L16,26 M24,17 L32,26",
  },
  {
    key: "ruku",
    arabic: "رُكُوع",
    headCx: 9,
    headCy: 22,
    path: "M14,23 L38,27 M38,27 L36,44 M38,27 L43,43 M21,24 L23,38",
  },
  {
    key: "sujud",
    arabic: "سُجُود",
    headCx: 9,
    headCy: 41,
    path: "M14,39 L34,30 M34,30 L30,40 L44,40 M15,37 L7,44",
  },
  {
    key: "julus",
    arabic: "جُلُوس",
    headCx: 24,
    headCy: 10,
    path: "M24,15 L24,30 M14,41 L24,30 L34,41 M24,19 L16,28 M24,19 L32,28",
  },
];

/**
 * Sequence illustree des quatre postures d'une unite de prière (rak'a),
 * pour accompagner la leçon "Le déroulement d'une unité de prière" plutot
 * que de decrire uniquement le geste en mots. Voir LessonIllustration.tsx
 * pour le mapping parcours/leçon -> illustration.
 */
export function PrayerPostureDiagram() {
  const { t } = useTranslation();

  return (
    <div className="mb-5 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-center gap-1">
        {POSTURES.map((posture, i) => (
          <div key={posture.key} className="flex items-center gap-1">
            <div className="flex w-20 flex-col items-center gap-1.5 text-center">
              <svg
                viewBox="0 0 48 48"
                className="h-14 w-14 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx={posture.headCx} cy={posture.headCy} r={5} />
                <path d={posture.path} />
              </svg>
              <p className="text-xs font-medium leading-tight">{t(`learning.postures.${posture.key}`)}</p>
              <p dir="rtl" lang="ar" className="font-arabic text-sm leading-none text-muted-foreground">
                {posture.arabic}
              </p>
            </div>
            {i < POSTURES.length - 1 ? (
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            ) : (
              <div className="flex flex-col items-center gap-1 ps-1 text-center">
                <RotateCcw className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="w-16 text-[10px] leading-tight text-muted-foreground">
                  {t("learning.postures.repeat")}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
