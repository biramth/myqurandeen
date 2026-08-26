export interface ConceptSummary {
  id: string;
  term: string;
  termArabic: string | null;
  slug: string;
  definition: string;
}

export interface ConceptDetail extends ConceptSummary {
  origin: string | null;
  explanation: string | null;
  related: { id: string; term: string; slug: string }[];
  divergences: { explanation: string }[];
}
