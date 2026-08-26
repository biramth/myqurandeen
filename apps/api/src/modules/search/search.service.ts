import { Inject, Injectable } from "@nestjs/common";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  concepts,
  fiqhTopics,
  hadithBooks,
  hadithCollections,
  hadiths,
  historicalEvents,
  historicalPeriods,
  prophets,
  quranSurahs,
  quranVerses,
  scholars,
  schools,
  tafsirEntries,
  tafsirSources,
} from "../../database/schema";

const RESULT_LIMIT = 8;

@Injectable()
export class SearchService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async search(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return {
        verses: [],
        hadiths: [],
        tafsirEntries: [],
        concepts: [],
        scholars: [],
        prophets: [],
        events: [],
        fiqhTopics: [],
        schools: [],
      };
    }

    const like = `%${trimmed}%`;
    const tsQuery = sql`plainto_tsquery('simple', ${trimmed})`;

    const [
      verses,
      hadithRows,
      tafsirRows,
      conceptRows,
      scholarRows,
      prophetRows,
      eventRows,
      fiqhTopicRows,
      schoolRows,
    ] = await Promise.all([
      this.db
        .select({
          id: quranVerses.id,
          surahNumber: quranSurahs.number,
          surahName: quranSurahs.nameTransliterated,
          numberInSurah: quranVerses.numberInSurah,
          textArabic: quranVerses.textArabic,
        })
        .from(quranVerses)
        .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId))
        .where(sql`${quranVerses.textSearch} @@ ${tsQuery}`)
        .limit(RESULT_LIMIT),
      this.db
        .select({
          id: hadiths.id,
          collectionSlug: hadithCollections.slug,
          collectionName: hadithCollections.name,
          bookNumber: hadithBooks.number,
          number: hadiths.number,
          numberInCollection: hadiths.numberInCollection,
          textTranslation: hadiths.textTranslation,
        })
        .from(hadiths)
        .innerJoin(hadithCollections, eq(hadithCollections.id, hadiths.collectionId))
        .innerJoin(hadithBooks, eq(hadithBooks.id, hadiths.hadithBookId))
        .where(sql`${hadiths.textSearch} @@ ${tsQuery}`)
        .limit(RESULT_LIMIT),
      this.db
        .select({
          id: tafsirEntries.id,
          workTitle: tafsirSources.title,
          surahNumber: quranSurahs.number,
          numberInSurah: quranVerses.numberInSurah,
          content: tafsirEntries.content,
        })
        .from(tafsirEntries)
        .innerJoin(tafsirSources, eq(tafsirSources.id, tafsirEntries.tafsirSourceId))
        .innerJoin(quranVerses, eq(quranVerses.id, tafsirEntries.verseStartId))
        .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId))
        .where(sql`${tafsirEntries.textSearch} @@ ${tsQuery}`)
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: concepts.id, term: concepts.term, slug: concepts.slug, definition: concepts.definition })
        .from(concepts)
        .where(or(ilike(concepts.term, like), ilike(concepts.definition, like), ilike(concepts.explanation, like)))
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: scholars.id, name: scholars.name, slug: scholars.slug, bio: scholars.bio })
        .from(scholars)
        .where(or(ilike(scholars.name, like), ilike(scholars.bio, like)))
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: prophets.id, name: prophets.name, slug: prophets.slug, description: prophets.description })
        .from(prophets)
        .where(or(ilike(prophets.name, like), ilike(prophets.description, like)))
        .limit(RESULT_LIMIT),
      this.db
        .select({
          id: historicalEvents.id,
          title: historicalEvents.title,
          slug: historicalEvents.slug,
          periodSlug: historicalPeriods.slug,
          description: historicalEvents.description,
        })
        .from(historicalEvents)
        .innerJoin(historicalPeriods, eq(historicalPeriods.id, historicalEvents.periodId))
        .where(sql`${historicalEvents.textSearch} @@ ${tsQuery}`)
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: fiqhTopics.id, title: fiqhTopics.title, slug: fiqhTopics.slug, description: fiqhTopics.description })
        .from(fiqhTopics)
        .where(and(or(ilike(fiqhTopics.title, like), ilike(fiqhTopics.description, like))))
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: schools.id, name: schools.name, slug: schools.slug, type: schools.type })
        .from(schools)
        .where(or(ilike(schools.name, like), ilike(schools.history, like)))
        .limit(RESULT_LIMIT),
    ]);

    return {
      verses,
      hadiths: hadithRows,
      tafsirEntries: tafsirRows,
      concepts: conceptRows,
      scholars: scholarRows,
      prophets: prophetRows,
      events: eventRows,
      fiqhTopics: fiqhTopicRows,
      schools: schoolRows,
    };
  }
}
