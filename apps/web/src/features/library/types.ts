export interface BookCategory {
  id: string;
  name: string;
}

export interface LibraryBookSummary {
  id: string;
  slug: string;
  title: string;
  authorName: string | null;
  language: string | null;
  era: string | null;
  publicDomain: boolean;
  categories: BookCategory[];
}

export interface LibraryAuthor {
  id: string;
  name: string;
  nameArabic: string | null;
  bio: string | null;
  era: string | null;
}

export interface LibraryBookDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string | null;
  era: string | null;
  publicDomain: boolean;
  license: string | null;
  externalUrl: string | null;
  author: LibraryAuthor | null;
  categories: BookCategory[];
}
