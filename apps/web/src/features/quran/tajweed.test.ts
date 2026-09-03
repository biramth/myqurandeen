import { describe, expect, it } from "vitest";
import { computeTajweedSegments } from "@/features/quran/tajweed";

/** Reconstruit le texte complet a partir des segments - doit toujours egaler l'entree. */
function joinSegments(segments: ReturnType<typeof computeTajweedSegments>): string {
  return segments.map((s) => s.text).join("");
}

/** Renvoie la regle du segment qui contient `needle` (premiere occurrence). */
function ruleAt(text: string, needle: string): string | null {
  const segments = computeTajweedSegments(text);
  let cursor = 0;
  for (const segment of segments) {
    if (segment.text.includes(needle)) return segment.rule;
    cursor += segment.text.length;
  }
  throw new Error(`"${needle}" introuvable dans les segments de "${text}" (cursor=${cursor})`);
}

describe("computeTajweedSegments", () => {
  it("ne perd et ne duplique aucun caractere (invariant de reconstruction)", () => {
    const text = "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ";
    expect(joinSegments(computeTajweedSegments(text))).toBe(text);
  });

  it("detecte la ghunna (chadda sur mim)", () => {
    expect(ruleAt("ثُمَّ", "م")).toBe("ghunna");
  });

  it("detecte la qalqalah (lettre de qalqalah avec soukoun)", () => {
    expect(ruleAt("أَحَدْ", "دْ")).toBe("qalqalah");
  });

  it("detecte la qalqalah kubra (derniere lettre du verset, meme sans soukoun ecrit)", () => {
    const segments = computeTajweedSegments("طَ");
    expect(segments.some((s) => s.rule === "qalqalah")).toBe(true);
  });

  it("detecte le lam shamsiyya (lettre solaire avec chadda apres alef+lam)", () => {
    expect(ruleAt("ٱلشَّمْسُ", "ل")).toBe("lam_shamsiyyah");
  });

  it("ne marque pas le lam qamariyya (lettre lunaire, pas de regle particuliere)", () => {
    const segments = computeTajweedSegments("ٱلْقَمَرُ");
    expect(segments.some((s) => s.rule === "lam_shamsiyyah")).toBe(false);
  });

  it("detecte l'idgham avec ghunna (noun sakinah + ي d'un autre mot)", () => {
    expect(ruleAt("مَنْ يَقُولُ", "نْ")).toBe("idgham_ghunna");
  });

  it("n'applique pas l'idgham a l'interieur d'un meme mot (exception 'الدنيا')", () => {
    expect(ruleAt("قُنْيَا", "نْ")).toBeNull();
  });

  it("detecte l'idgham sans ghunna (noun sakinah + ر)", () => {
    expect(ruleAt("مِنْ رَّبِّهِمْ", "نْ")).toBe("idgham_no_ghunna");
  });

  it("detecte l'iqlab (noun sakinah + ب)", () => {
    expect(ruleAt("مِنْ بَعْدِ", "نْ")).toBe("iqlab");
  });

  it("detecte l'ikhfa (noun sakinah + lettre d'ikhfa)", () => {
    expect(ruleAt("مِنْ تَحْتِهَا", "نْ")).toBe("ikhfa");
  });

  it("n'applique aucune regle a l'idhar halqi (noun sakinah + lettre gutturale)", () => {
    expect(ruleAt("مِنْ عِلْمِ", "نْ")).toBeNull();
  });

  it("detecte l'idgham avec ghunna declenche par un tanwin (pas seulement noun sakinah)", () => {
    // "qawman ya'lamoona" - tanwin fath sur la mim finale, suivi de ي dans le mot suivant.
    expect(ruleAt("قَوْمًا يَعْلَمُونَ", "مً")).toBe("idgham_ghunna");
  });

  it("detecte l'iqlab declenche par un tanwin", () => {
    // "sami'un basir" - tanwin damm suivi de ب dans le mot suivant.
    expect(ruleAt("سَمِيعٌ بَصِيرٌ", "عٌ")).toBe("iqlab");
  });

  it("detecte l'ikhfa shafawi (mim sakinah + ب)", () => {
    expect(ruleAt("هُمْ بِذَلِكَ", "مْ")).toBe("ikhfa_shafawi");
  });

  it("detecte l'idgham shafawi (mim sakinah + مim)", () => {
    expect(ruleAt("لَهُمْ مَا", "مْ")).toBe("idgham_shafawi");
  });

  it("n'applique aucune regle a l'idhar shafawi (mim sakinah + autre lettre)", () => {
    expect(ruleAt("هُمْ فِي", "مْ")).toBeNull();
  });

  it("renvoie un seul segment sans regle pour un texte sans lettre reconnue", () => {
    expect(computeTajweedSegments("")).toEqual([{ text: "", rule: null }]);
  });
});
