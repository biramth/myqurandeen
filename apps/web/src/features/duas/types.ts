export interface DuaCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  orderIndex: number;
}

export interface Dua {
  id: string;
  title: string;
  arabicText: string | null;
  transliteration: string | null;
  translation: string;
  repeatCount: number | null;
  virtue: string | null;
  referenceUrl: string | null;
  sourceTitle: string | null;
}

export interface DuaCategoryDetail {
  category: DuaCategory;
  duas: Dua[];
}
