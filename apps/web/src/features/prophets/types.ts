export interface ProphetSummary {
  id: string;
  name: string;
  nameArabic: string | null;
  slug: string;
  era: string | null;
}

export interface ProphetDetail extends ProphetSummary {
  peopleAddressed: string | null;
  quranicMentions: string | null;
  description: string;
}
