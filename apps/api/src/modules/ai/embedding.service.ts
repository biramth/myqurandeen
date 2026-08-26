import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { aiEmbeddings } from "../../database/schema";
import {
  concepts,
  hadithBooks,
  hadithCollections,
  hadiths,
  historicalEvents,
  historicalPeriods,
  prophets,
  quranSurahs,
  quranVerses,
  tafsirEntries,
  tafsirSources,
  scholars,
  schools,
  fiqhPositions,
  fiqhTopics,
  authors,
} from "../../database/schema";
import type { AiProvider } from "./ai-provider.interface";

/** Types de contenu indexables par le RAG. */
export type ContentType =
  | "verse"
  | "hadith"
  | "tafsir"
  | "concept"
  | "scholar"
  | "prophet"
  | "event"
  | "school"
  | "fiqh_position";

const CHUNK_MAX_CHARS = 500;
const CHUNK_OVERLAP = 100;
const BATCH_SIZE = 20;

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly embeddingDim: number;

  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject("AI_PROVIDER") private readonly aiProvider: AiProvider,
    config: ConfigService,
  ) {
    this.embeddingDim = config.get<number>("AI_EMBEDDING_DIM", 768);
  }

  /**
   * Decode un embedding stocke en texte (JSON array) en tableau de floats.
   */
  parseEmbedding(raw: string): number[] {
    return JSON.parse(raw) as number[];
  }

  /**
   * Encode un tableau de floats en texte pour le stockage.
   */
  serializeEmbedding(vec: number[]): string {
    return JSON.stringify(vec);
  }

  /**
   * Indexe tout le contenu de la base dans la table ai_embeddings.
   * Supprime les anciens embeddings avant de reindexer.
   */
  async indexAll(onProgress?: (indexed: number) => void): Promise<{ total: number }> {
    this.logger.log("Debut de l'indexation RAG...");

    await this.db.delete(aiEmbeddings);

    let total = 0;

    const verseCount = await this.indexVerses();
    total += verseCount;
    onProgress?.(total);

    const hadithCount = await this.indexHadiths();
    total += hadithCount;
    onProgress?.(total);

    const tafsirCount = await this.indexTafsir();
    total += tafsirCount;
    onProgress?.(total);

    const conceptCount = await this.indexConcepts();
    total += conceptCount;
    onProgress?.(total);

    const scholarCount = await this.indexScholars();
    total += scholarCount;
    onProgress?.(total);

    const prophetCount = await this.indexProphets();
    total += prophetCount;
    onProgress?.(total);

    const eventCount = await this.indexEvents();
    total += eventCount;
    onProgress?.(total);

    const schoolCount = await this.indexSchools();
    total += schoolCount;
    onProgress?.(total);

    const fiqhCount = await this.indexFiqhPositions();
    total += fiqhCount;
    onProgress?.(total);

    this.logger.log(`Indexation terminee : ${total} chunks indexes`);
    return { total };
  }

  /**
   * Indexe un type de contenu specifique.
   */
  async indexByType(contentType: ContentType): Promise<{ count: number }> {
    this.logger.log(`Reindexation du type: ${contentType}`);

    await this.db.delete(aiEmbeddings).where(eq(aiEmbeddings.contentType, contentType));

    let count = 0;
    switch (contentType) {
      case "verse":
        count = await this.indexVerses();
        break;
      case "hadith":
        count = await this.indexHadiths();
        break;
      case "tafsir":
        count = await this.indexTafsir();
        break;
      case "concept":
        count = await this.indexConcepts();
        break;
      case "scholar":
        count = await this.indexScholars();
        break;
      case "prophet":
        count = await this.indexProphets();
        break;
      case "event":
        count = await this.indexEvents();
        break;
      case "school":
        count = await this.indexSchools();
        break;
      case "fiqh_position":
        count = await this.indexFiqhPositions();
        break;
    }

    this.logger.log(`Reindexation ${contentType} terminee : ${count} chunks`);
    return { count };
  }

  private async indexVerses(): Promise<number> {
    const rows = await this.db
      .select({
        verseId: quranVerses.id,
        textArabic: quranVerses.textArabic,
        surahNumber: quranSurahs.number,
        surahNameAr: quranSurahs.nameArabic,
        surahNameTransliterated: quranSurahs.nameTransliterated,
        numberInSurah: quranVerses.numberInSurah,
      })
      .from(quranVerses)
      .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId));

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const context = `Sourate ${row.surahNumber} (${row.surahNameTransliterated} / ${row.surahNameAr}), verset ${row.numberInSurah}`;
      const meta = JSON.stringify({ surahNumber: row.surahNumber, verseNumber: row.numberInSurah, surahName: row.surahNameTransliterated });

      if (row.textArabic.length <= CHUNK_MAX_CHARS) {
        chunks.push({ contentId: row.verseId, text: row.textArabic, context, meta });
      } else {
        for (const chunk of this.splitText(row.textArabic)) {
          chunks.push({ contentId: row.verseId, text: chunk, context, meta });
        }
      }
    }

    return this.storeChunks("verse", chunks);
  }

  private async indexHadiths(): Promise<number> {
    const rows = await this.db
      .select({
        hadithId: hadiths.id,
        textTranslation: hadiths.textTranslation,
        textArabic: hadiths.textArabic,
        numberInCollection: hadiths.numberInCollection,
        authenticityGrade: hadiths.authenticityGrade,
        collectionName: hadithCollections.name,
        collectionSlug: hadithCollections.slug,
        bookTitle: hadithBooks.title,
      })
      .from(hadiths)
      .innerJoin(hadithCollections, eq(hadithCollections.id, hadiths.collectionId))
      .innerJoin(hadithBooks, eq(hadithBooks.id, hadiths.hadithBookId));

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const parts: string[] = [];
      if (row.textTranslation) parts.push(row.textTranslation);
      if (row.textArabic) parts.push(`[Arabe] ${row.textArabic}`);

      const fullText = parts.join("\n");
      const context = `Hadith ${row.numberInCollection} - ${row.collectionName} (${row.bookTitle})${row.authenticityGrade ? ` [${row.authenticityGrade}]` : ""}`;
      const meta = JSON.stringify({
        collectionSlug: row.collectionSlug,
        numberInCollection: row.numberInCollection,
        grade: row.authenticityGrade,
      });

      for (const chunk of this.splitText(fullText)) {
        chunks.push({ contentId: row.hadithId, text: chunk, context, meta });
      }
    }

    return this.storeChunks("hadith", chunks);
  }

  private async indexTafsir(): Promise<number> {
    const rows = await this.db
      .select({
        entryId: tafsirEntries.id,
        content: tafsirEntries.content,
        verseId: tafsirEntries.verseStartId,
        workTitle: tafsirSources.title,
        authorName: authors.name,
        surahNumber: quranSurahs.number,
        verseNumber: quranVerses.numberInSurah,
      })
      .from(tafsirEntries)
      .innerJoin(tafsirSources, eq(tafsirSources.id, tafsirEntries.tafsirSourceId))
      .leftJoin(authors, eq(authors.id, tafsirSources.authorId))
      .innerJoin(quranVerses, eq(quranVerses.id, tafsirEntries.verseStartId))
      .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId));

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const context = `Tafsir : ${row.workTitle}${row.authorName ? ` (${row.authorName})` : ""} - Sourate ${row.surahNumber}:${row.verseNumber}`;
      const meta = JSON.stringify({ workTitle: row.workTitle, surahNumber: row.surahNumber, verseNumber: row.verseNumber });

      for (const chunk of this.splitText(row.content)) {
        chunks.push({ contentId: row.entryId, text: chunk, context, meta });
      }
    }

    return this.storeChunks("tafsir", chunks);
  }

  private async indexConcepts(): Promise<number> {
    const rows = await this.db
      .select({
        id: concepts.id,
        term: concepts.term,
        termArabic: concepts.termArabic,
        definition: concepts.definition,
        explanation: concepts.explanation,
      })
      .from(concepts);

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const parts: string[] = [`${row.term}${row.termArabic ? ` (${row.termArabic})` : ""}`, row.definition];
      if (row.explanation) parts.push(row.explanation);

      const fullText = parts.join("\n\n");
      const context = `Concept islamique : ${row.term}`;
      const meta = JSON.stringify({ term: row.term, termArabic: row.termArabic });

      for (const chunk of this.splitText(fullText)) {
        chunks.push({ contentId: row.id, text: chunk, context, meta });
      }
    }

    return this.storeChunks("concept", chunks);
  }

  private async indexScholars(): Promise<number> {
    const rows = await this.db
      .select({
        id: scholars.id,
        name: scholars.name,
        nameArabic: scholars.nameArabic,
        bio: scholars.bio,
        expertise: scholars.expertise,
        bornYear: scholars.bornYear,
        diedYear: scholars.diedYear,
        place: scholars.place,
      })
      .from(scholars);

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const parts: string[] = [`Savant : ${row.name}${row.nameArabic ? ` (${row.nameArabic})` : ""}`];
      if (row.bornYear && row.diedYear) parts.push(`Periode : ${row.bornYear} - ${row.diedYear}`);
      if (row.place) parts.push(`Lieu : ${row.place}`);
      if (row.expertise?.length) parts.push(`Domaines : ${row.expertise.join(", ")}`);
      if (row.bio) parts.push(row.bio);

      const fullText = parts.join("\n");
      const context = `Savant : ${row.name}`;
      const meta = JSON.stringify({ name: row.name, nameArabic: row.nameArabic });

      for (const chunk of this.splitText(fullText)) {
        chunks.push({ contentId: row.id, text: chunk, context, meta });
      }
    }

    return this.storeChunks("scholar", chunks);
  }

  private async indexProphets(): Promise<number> {
    const rows = await this.db
      .select({
        id: prophets.id,
        name: prophets.name,
        nameArabic: prophets.nameArabic,
        description: prophets.description,
        peopleAddressed: prophets.peopleAddressed,
        era: prophets.era,
      })
      .from(prophets);

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const parts: string[] = [`Prophete : ${row.name}${row.nameArabic ? ` (${row.nameArabic})` : ""}`];
      if (row.peopleAddressed) parts.push(`Peuple : ${row.peopleAddressed}`);
      if (row.era) parts.push(`Epoque : ${row.era}`);
      parts.push(row.description);

      const fullText = parts.join("\n");
      const context = `Prophete : ${row.name}`;
      const meta = JSON.stringify({ name: row.name, nameArabic: row.nameArabic });

      for (const chunk of this.splitText(fullText)) {
        chunks.push({ contentId: row.id, text: chunk, context, meta });
      }
    }

    return this.storeChunks("prophet", chunks);
  }

  private async indexEvents(): Promise<number> {
    const rows = await this.db
      .select({
        id: historicalEvents.id,
        title: historicalEvents.title,
        description: historicalEvents.description,
        dateApprox: historicalEvents.dateApprox,
        eventType: historicalEvents.eventType,
        periodName: historicalPeriods.name,
      })
      .from(historicalEvents)
      .innerJoin(historicalPeriods, eq(historicalPeriods.id, historicalEvents.periodId));

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const parts: string[] = [row.title];
      if (row.dateApprox) parts.push(`Date : ${row.dateApprox}`);
      if (row.eventType) parts.push(`Type : ${row.eventType}`);
      if (row.periodName) parts.push(`Periode : ${row.periodName}`);
      parts.push(row.description);

      const fullText = parts.join("\n");
      const context = `Evenement historique : ${row.title} (${row.periodName})`;
      const meta = JSON.stringify({ title: row.title, periodName: row.periodName });

      for (const chunk of this.splitText(fullText)) {
        chunks.push({ contentId: row.id, text: chunk, context, meta });
      }
    }

    return this.storeChunks("event", chunks);
  }

  private async indexSchools(): Promise<number> {
    const rows = await this.db
      .select({
        id: schools.id,
        name: schools.name,
        type: schools.type,
        history: schools.history,
        principles: schools.principles,
        sourcesUsed: schools.sourcesUsed,
        era: schools.era,
      })
      .from(schools);

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const parts: string[] = [`Ecole : ${row.name} (type: ${row.type})`];
      if (row.era) parts.push(`Epoque : ${row.era}`);
      if (row.principles) parts.push(`Principes : ${row.principles}`);
      if (row.sourcesUsed) parts.push(`Sources : ${row.sourcesUsed}`);
      if (row.history) parts.push(row.history);

      const fullText = parts.join("\n");
      const context = `Ecole : ${row.name}`;
      const meta = JSON.stringify({ name: row.name, type: row.type });

      for (const chunk of this.splitText(fullText)) {
        chunks.push({ contentId: row.id, text: chunk, context, meta });
      }
    }

    return this.storeChunks("school", chunks);
  }

  private async indexFiqhPositions(): Promise<number> {
    const rows = await this.db
      .select({
        id: fiqhPositions.id,
        positionText: fiqhPositions.positionText,
        schoolName: schools.name,
        topicTitle: fiqhTopics.title,
      })
      .from(fiqhPositions)
      .innerJoin(schools, eq(schools.id, fiqhPositions.schoolId))
      .innerJoin(fiqhTopics, eq(fiqhTopics.id, fiqhPositions.fiqhTopicId));

    const chunks: { contentId: string; text: string; context: string; meta: string }[] = [];

    for (const row of rows) {
      const context = `Position fiqh - ${row.schoolName} sur "${row.topicTitle}"`;
      const meta = JSON.stringify({ school: row.schoolName, topic: row.topicTitle });

      for (const chunk of this.splitText(row.positionText)) {
        chunks.push({ contentId: row.id, text: chunk, context, meta });
      }
    }

    return this.storeChunks("fiqh_position", chunks);
  }

  /**
   * Decoupe un texte long en chunks avec chevauchement.
   */
  private splitText(text: string): string[] {
    if (text.length <= CHUNK_MAX_CHARS) return [text];

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + CHUNK_MAX_CHARS, text.length);
      chunks.push(text.slice(start, end));
      if (end >= text.length) break;
      start += CHUNK_MAX_CHARS - CHUNK_OVERLAP;
    }

    return chunks;
  }

  /**
   * Genere les embeddings et insere les chunks en base par lots.
   */
  private async storeChunks(
    contentType: ContentType,
    chunks: { contentId: string; text: string; context: string; meta: string }[],
  ): Promise<number> {
    if (chunks.length === 0) return 0;

    let indexed = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const textsToEmbed = batch.map((c) => `${c.context}\n\n${c.text}`);

      const embeddings = await this.aiProvider.embedBatch(textsToEmbed);

      const rows = batch.map((chunk, idx) => ({
        contentType,
        contentId: chunk.contentId,
        contentText: chunk.text,
        contextText: chunk.context,
        metadata: chunk.meta,
        embeddingDim: this.embeddingDim,
        embedding: this.serializeEmbedding(embeddings[idx]),
      }));

      await this.db.insert(aiEmbeddings).values(rows);
      indexed += batch.length;
      this.logger.debug(`  ${contentType}: ${indexed}/${chunks.length} chunks indexes`);
    }

    return indexed;
  }
}
