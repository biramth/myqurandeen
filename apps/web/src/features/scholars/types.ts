export interface ScholarSummary {
  id: string;
  name: string;
  nameArabic: string | null;
  slug: string;
  bornYear: number | null;
  diedYear: number | null;
  expertise: string[] | null;
}

export interface ScholarDetail extends ScholarSummary {
  place: string | null;
  bio: string | null;
  schools: { id: string; name: string; slug: string }[];
}
