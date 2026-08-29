export type TargetType =
  | "verse"
  | "hadith"
  | "tafsir_entry"
  | "concept"
  | "book"
  | "scholar"
  | "event"
  | "fiqh_topic"
  | "lesson"
  | "dua";

interface TargetInfo {
  title: string;
  href: string | null;
}

export interface Bookmark extends TargetInfo {
  id: string;
  targetType: TargetType;
  targetId: string;
  createdAt: string;
}

export interface Note extends TargetInfo {
  id: string;
  targetType: TargetType;
  targetId: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  createdAt: string;
}

export interface CollectionItem extends TargetInfo {
  id: string;
  collectionId: string;
  targetType: TargetType;
  targetId: string;
  createdAt: string;
}

export interface CollectionDetail extends Collection {
  items: CollectionItem[];
}
