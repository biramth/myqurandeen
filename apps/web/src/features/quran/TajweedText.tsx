import * as React from "react";
import { computeTajweedSegments, type TajweedRule } from "./tajweed";

/** Variable CSS (voir index.css) portant la couleur de chaque regle - une par theme clair/sombre. */
export const TAJWEED_RULE_COLOR_VAR: Record<TajweedRule, string> = {
  ghunna: "--tajweed-ghunna",
  qalqalah: "--tajweed-qalqalah",
  lam_shamsiyyah: "--tajweed-lam-shamsiyyah",
  idgham_ghunna: "--tajweed-idgham-ghunna",
  idgham_no_ghunna: "--tajweed-idgham-no-ghunna",
  iqlab: "--tajweed-iqlab",
  ikhfa: "--tajweed-ikhfa",
  ikhfa_shafawi: "--tajweed-ikhfa-shafawi",
  idgham_shafawi: "--tajweed-idgham-shafawi",
};

/** Ordre d'affichage stable de la legende (features/quran/TajweedLegend.tsx). */
export const TAJWEED_RULES_ORDER: TajweedRule[] = [
  "lam_shamsiyyah",
  "qalqalah",
  "ghunna",
  "idgham_ghunna",
  "idgham_no_ghunna",
  "iqlab",
  "ikhfa",
  "idgham_shafawi",
  "ikhfa_shafawi",
];

interface TajweedTextProps {
  text: string;
}

/**
 * Rend `text` avec une coloration par regle de tajwid (voir tajweed.ts).
 * `React.memo` + calcul memoise : le decoupage en segments ne depend que du
 * texte, inutile de le refaire a chaque re-rendu du parent (ex. bascule de
 * traduction affichee).
 */
export const TajweedText = React.memo(function TajweedText({ text }: TajweedTextProps) {
  const segments = React.useMemo(() => computeTajweedSegments(text), [text]);
  return (
    <>
      {segments.map((segment, i) =>
        segment.rule ? (
          <span key={i} style={{ color: `hsl(var(${TAJWEED_RULE_COLOR_VAR[segment.rule]}))` }}>
            {segment.text}
          </span>
        ) : (
          <React.Fragment key={i}>{segment.text}</React.Fragment>
        ),
      )}
    </>
  );
});
