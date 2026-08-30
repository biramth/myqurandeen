import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { TargetType } from "@qurandeen/shared";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  bookmarks,
  books,
  collectionItems,
  collections,
  concepts,
  duaCategories,
  duas,
  fiqhTopics,
  hadithCollections,
  hadiths,
  historicalEvents,
  learningLessons,
  learningPaths,
  notes,
  quranSurahs,
  quranVerses,
  scholars,
  tafsirEntries,
} from "../../database/schema";
import { StreaksService } from "../streaks/streaks.service";

/** Titre affichable + lien vers le contenu pour un couple (targetType, targetId). */
interface TargetInfo {
  title: string;
  href: string | null;
}

@Injectable()
export class UserDataService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly streaksService: StreaksService,
  ) {}

  /**
   * Resout en une poignee de requetes groupees (une par type) le titre et le
   * lien affichables pour chaque cible d'une liste de favoris/notes/items -
   * bookmarks/notes ne stockent qu'un (targetType, targetId) polymorphe,
   * jamais un titre en dur (qui deviendrait obsolete si le contenu change).
   */
  private async resolveTargets(items: { targetType: TargetType; targetId: string }[]): Promise<Map<string, TargetInfo>> {
    const result = new Map<string, TargetInfo>();
    const idsByType = new Map<TargetType, string[]>();
    for (const item of items) {
      const list = idsByType.get(item.targetType) ?? [];
      list.push(item.targetId);
      idsByType.set(item.targetType, list);
    }

    for (const [type, ids] of idsByType) {
      switch (type) {
        case "verse": {
          const rows = await this.db
            .select({
              id: quranVerses.id,
              numberInSurah: quranVerses.numberInSurah,
              surahNumber: quranSurahs.number,
              surahName: quranSurahs.nameTransliterated,
            })
            .from(quranVerses)
            .innerJoin(quranSurahs, eq(quranVerses.surahId, quranSurahs.id))
            .where(inArray(quranVerses.id, ids));
          for (const r of rows) {
            result.set(`verse:${r.id}`, {
              title: `${r.surahName} ${r.numberInSurah}`,
              href: `/quran/${r.surahNumber}/${r.numberInSurah}`,
            });
          }
          break;
        }
        case "hadith": {
          const rows = await this.db
            .select({
              id: hadiths.id,
              number: hadiths.number,
              collectionName: hadithCollections.name,
              collectionSlug: hadithCollections.slug,
            })
            .from(hadiths)
            .innerJoin(hadithCollections, eq(hadiths.collectionId, hadithCollections.id))
            .where(inArray(hadiths.id, ids));
          for (const r of rows) {
            result.set(`hadith:${r.id}`, {
              title: `${r.collectionName} ${r.number}`,
              href: `/hadith/${r.collectionSlug}/${r.number}`,
            });
          }
          break;
        }
        case "tafsir_entry": {
          const rows = await this.db
            .select({
              id: tafsirEntries.id,
              numberInSurah: quranVerses.numberInSurah,
              surahNumber: quranSurahs.number,
              surahName: quranSurahs.nameTransliterated,
            })
            .from(tafsirEntries)
            .innerJoin(quranVerses, eq(tafsirEntries.verseStartId, quranVerses.id))
            .innerJoin(quranSurahs, eq(quranVerses.surahId, quranSurahs.id))
            .where(inArray(tafsirEntries.id, ids));
          for (const r of rows) {
            result.set(`tafsir_entry:${r.id}`, {
              title: `Tafsir - ${r.surahName} ${r.numberInSurah}`,
              href: `/quran/${r.surahNumber}/${r.numberInSurah}`,
            });
          }
          break;
        }
        case "concept": {
          const rows = await this.db
            .select({ id: concepts.id, term: concepts.term, slug: concepts.slug })
            .from(concepts)
            .where(inArray(concepts.id, ids));
          for (const r of rows) result.set(`concept:${r.id}`, { title: r.term, href: `/concepts/${r.slug}` });
          break;
        }
        case "scholar": {
          const rows = await this.db
            .select({ id: scholars.id, name: scholars.name, slug: scholars.slug })
            .from(scholars)
            .where(inArray(scholars.id, ids));
          for (const r of rows) result.set(`scholar:${r.id}`, { title: r.name, href: `/scholars/${r.slug}` });
          break;
        }
        case "book": {
          const rows = await this.db
            .select({ id: books.id, title: books.title, slug: books.slug })
            .from(books)
            .where(inArray(books.id, ids));
          for (const r of rows) result.set(`book:${r.id}`, { title: r.title, href: `/library/${r.slug}` });
          break;
        }
        case "event": {
          const rows = await this.db
            .select({ id: historicalEvents.id, title: historicalEvents.title, slug: historicalEvents.slug })
            .from(historicalEvents)
            .where(inArray(historicalEvents.id, ids));
          for (const r of rows) result.set(`event:${r.id}`, { title: r.title, href: `/history/event/${r.slug}` });
          break;
        }
        case "fiqh_topic": {
          const rows = await this.db
            .select({ id: fiqhTopics.id, title: fiqhTopics.title, slug: fiqhTopics.slug })
            .from(fiqhTopics)
            .where(inArray(fiqhTopics.id, ids));
          for (const r of rows) result.set(`fiqh_topic:${r.id}`, { title: r.title, href: `/fiqh/${r.slug}` });
          break;
        }
        case "dua": {
          const rows = await this.db
            .select({ id: duas.id, title: duas.title, categorySlug: duaCategories.slug })
            .from(duas)
            .innerJoin(duaCategories, eq(duas.categoryId, duaCategories.id))
            .where(inArray(duas.id, ids));
          for (const r of rows) result.set(`dua:${r.id}`, { title: r.title, href: `/duas/${r.categorySlug}` });
          break;
        }
        case "lesson": {
          const rows = await this.db
            .select({
              id: learningLessons.id,
              title: learningLessons.title,
              order: learningLessons.order,
              pathSlug: learningPaths.slug,
            })
            .from(learningLessons)
            .innerJoin(learningPaths, eq(learningLessons.pathId, learningPaths.id))
            .where(inArray(learningLessons.id, ids));
          for (const r of rows) {
            result.set(`lesson:${r.id}`, { title: r.title, href: `/learn/${r.pathSlug}/lessons/${r.order}` });
          }
          break;
        }
      }
    }
    return result;
  }

  private attachTargetInfo<T extends { targetType: TargetType; targetId: string }>(
    rows: T[],
    resolved: Map<string, TargetInfo>,
  ): (T & TargetInfo)[] {
    return rows.map((row) => ({
      ...row,
      ...(resolved.get(`${row.targetType}:${row.targetId}`) ?? { title: row.targetType, href: null }),
    }));
  }

  // --- Favoris (bookmarks) ---

  async listBookmarks(userId: string, targetType?: TargetType) {
    const rows = await this.db
      .select()
      .from(bookmarks)
      .where(
        targetType
          ? and(eq(bookmarks.userId, userId), eq(bookmarks.targetType, targetType))
          : eq(bookmarks.userId, userId),
      )
      .orderBy(desc(bookmarks.createdAt));
    const resolved = await this.resolveTargets(rows);
    return this.attachTargetInfo(rows, resolved);
  }

  async isBookmarked(userId: string, targetType: TargetType, targetId: string): Promise<boolean> {
    const existing = await this.db.query.bookmarks.findFirst({
      where: and(eq(bookmarks.userId, userId), eq(bookmarks.targetType, targetType), eq(bookmarks.targetId, targetId)),
    });
    return Boolean(existing);
  }

  async toggleBookmark(
    userId: string,
    targetType: TargetType,
    targetId: string,
    localDate?: string,
  ): Promise<{ bookmarked: boolean }> {
    const existing = await this.db.query.bookmarks.findFirst({
      where: and(eq(bookmarks.userId, userId), eq(bookmarks.targetType, targetType), eq(bookmarks.targetId, targetId)),
    });

    if (existing) {
      await this.db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
      return { bookmarked: false };
    }

    await this.db.insert(bookmarks).values({ userId, targetType, targetId });
    // Uniquement a l'ajout (pas au retrait) : c'est l'action significative.
    await this.streaksService.recordActivity(userId, localDate);
    return { bookmarked: true };
  }

  // --- Notes ---

  async listNotes(userId: string, targetType?: TargetType, targetId?: string) {
    const conditions = [eq(notes.userId, userId)];
    if (targetType) conditions.push(eq(notes.targetType, targetType));
    if (targetId) conditions.push(eq(notes.targetId, targetId));
    const rows = await this.db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(desc(notes.createdAt));
    const resolved = await this.resolveTargets(rows);
    return this.attachTargetInfo(rows, resolved);
  }

  async createNote(
    userId: string,
    targetType: TargetType,
    targetId: string,
    content: string,
    isPrivate?: boolean,
    localDate?: string,
  ) {
    const [note] = await this.db
      .insert(notes)
      .values({ userId, targetType, targetId, content, isPrivate: isPrivate ?? true })
      .returning();
    await this.streaksService.recordActivity(userId, localDate);
    return note;
  }

  async updateNote(userId: string, noteId: string, content?: string, isPrivate?: boolean) {
    const note = await this.getOwnedNote(userId, noteId);
    const [updated] = await this.db
      .update(notes)
      .set({ ...(content !== undefined && { content }), ...(isPrivate !== undefined && { isPrivate }) })
      .where(eq(notes.id, note.id))
      .returning();
    return updated;
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    const note = await this.getOwnedNote(userId, noteId);
    await this.db.delete(notes).where(eq(notes.id, note.id));
  }

  private async getOwnedNote(userId: string, noteId: string) {
    const note = await this.db.query.notes.findFirst({ where: eq(notes.id, noteId) });
    if (!note) throw new NotFoundException("Note introuvable");
    if (note.userId !== userId) throw new ForbiddenException("Cette note ne vous appartient pas");
    return note;
  }

  // --- Collections ---

  async listCollections(userId: string) {
    const rows = await this.db.select().from(collections).where(eq(collections.userId, userId)).orderBy(desc(collections.createdAt));
    const withCounts = await Promise.all(
      rows.map(async (collection) => {
        const items = await this.db
          .select({ id: collectionItems.id })
          .from(collectionItems)
          .where(eq(collectionItems.collectionId, collection.id));
        return { ...collection, itemCount: items.length };
      }),
    );
    return withCounts;
  }

  async getCollection(userId: string, collectionId: string) {
    const collection = await this.getOwnedCollection(userId, collectionId);
    const items = await this.db
      .select()
      .from(collectionItems)
      .where(eq(collectionItems.collectionId, collection.id))
      .orderBy(desc(collectionItems.createdAt));
    const resolved = await this.resolveTargets(items);
    return { ...collection, items: this.attachTargetInfo(items, resolved) };
  }

  async createCollection(userId: string, name: string, description?: string) {
    const [collection] = await this.db.insert(collections).values({ userId, name, description }).returning();
    return collection;
  }

  async updateCollection(userId: string, collectionId: string, name?: string, description?: string) {
    const collection = await this.getOwnedCollection(userId, collectionId);
    const [updated] = await this.db
      .update(collections)
      .set({ ...(name !== undefined && { name }), ...(description !== undefined && { description }) })
      .where(eq(collections.id, collection.id))
      .returning();
    return updated;
  }

  async deleteCollection(userId: string, collectionId: string): Promise<void> {
    const collection = await this.getOwnedCollection(userId, collectionId);
    await this.db.delete(collections).where(eq(collections.id, collection.id));
  }

  async addCollectionItem(
    userId: string,
    collectionId: string,
    targetType: TargetType,
    targetId: string,
    localDate?: string,
  ) {
    const collection = await this.getOwnedCollection(userId, collectionId);
    const [item] = await this.db
      .insert(collectionItems)
      .values({ collectionId: collection.id, targetType, targetId })
      .onConflictDoNothing()
      .returning();
    if (item) {
      // Uniquement quand l'item est reellement nouveau (pas un doublon deja present).
      await this.streaksService.recordActivity(userId, localDate);
    }
    return item ?? (await this.db.query.collectionItems.findFirst({
      where: and(eq(collectionItems.collectionId, collection.id), eq(collectionItems.targetType, targetType), eq(collectionItems.targetId, targetId)),
    }));
  }

  async removeCollectionItem(userId: string, collectionId: string, itemId: string): Promise<void> {
    const collection = await this.getOwnedCollection(userId, collectionId);
    await this.db
      .delete(collectionItems)
      .where(and(eq(collectionItems.id, itemId), eq(collectionItems.collectionId, collection.id)));
  }

  private async getOwnedCollection(userId: string, collectionId: string) {
    const collection = await this.db.query.collections.findFirst({ where: eq(collections.id, collectionId) });
    if (!collection) throw new NotFoundException("Collection introuvable");
    if (collection.userId !== userId) throw new ForbiddenException("Cette collection ne vous appartient pas");
    return collection;
  }
}
