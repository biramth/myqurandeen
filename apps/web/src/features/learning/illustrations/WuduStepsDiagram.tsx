import { useTranslation } from "react-i18next";

interface Step {
  key: string;
  // Petit pictogramme abstrait (trait), pas une icone Lucide existante, pour
  // rester coherent avec le style de PrayerPostureDiagram.
  path: string;
}

// ViewBox 0 0 32 32 pour chaque pictogramme, meme trait que le reste du site.
const STEPS: Step[] = [
  { key: "hands", path: "M8,26 L8,14 Q8,10 12,10 L12,20 M12,10 Q16,10 16,14 L16,22 M16,12 Q20,12 20,16 L20,23 M20,14 Q24,14 24,17 L24,24 M8,26 L24,26" },
  { key: "mouthNose", path: "M9,20 Q16,9 23,20 Q16,26 9,20 Z M13,20 L19,20" },
  { key: "face", path: "M16,7 Q26,7 26,17 Q26,27 16,27 Q6,27 6,17 Q6,7 16,7 Z" },
  { key: "arms", path: "M8,26 L8,10 M8,10 L20,10 M6,10 L6,6 M20,10 L20,6 M6,6 L20,6" },
  { key: "head", path: "M6,16 Q6,8 16,8 Q26,8 26,16 M8,16 Q8,22 16,22 Q24,22 24,16" },
  { key: "feet", path: "M8,10 L8,22 Q8,26 12,26 L22,26 M8,22 L22,22 M14,10 L14,22" },
];

/**
 * Sequence illustree des six etapes du wudu (petites ablutions), pour la
 * leçon "Les ablutions (wudu) : les étapes" - voir LessonIllustration.tsx.
 */
export function WuduStepsDiagram() {
  const { t } = useTranslation();

  return (
    <div className="mb-5 rounded-lg border bg-muted/30 p-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex flex-col items-center gap-1.5 text-center">
            <div className="relative">
              <svg
                viewBox="0 0 32 32"
                className="h-10 w-10 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={step.path} />
              </svg>
              <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {i + 1}
              </span>
            </div>
            <p className="text-[11px] font-medium leading-tight">{t(`learning.wuduSteps.${step.key}`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
