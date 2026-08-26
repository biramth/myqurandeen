export interface School {
  id: string;
  name: string;
  slug: string;
  type: "fiqh" | "theological";
  history: string | null;
  principles: string | null;
  sourcesUsed: string | null;
  era: string | null;
}

export interface FiqhTopicSummary {
  id: string;
  title: string;
  slug: string;
  category: string | null;
}

export interface FiqhPosition {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  positionText: string;
  sourceTitle: string | null;
}

export interface FiqhTopicComparison {
  topic: { id: string; title: string; slug: string; description: string | null; category: string | null };
  positions: FiqhPosition[];
  divergenceNotes: { explanation: string }[];
}
