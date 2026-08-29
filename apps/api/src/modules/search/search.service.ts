import { Inject, Injectable } from "@nestjs/common";
import { eq, or, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  authors,
  books,
  concepts,
  duaCategories,
  duas,
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
  verseTranslations,
} from "../../database/schema";

const RESULT_LIMIT = 8;

/**
 * Recherche transverse multi-entites. Les resultats FTS sont classes par
 * pertinence (ts_rank), et la recherche sur les versets couvre a la fois le
 * texte arabe et les traductions (verse_translations.text_search).
 */
@Injectable()
export class SearchService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /**
   * ILIKE insensible aux accents (immutable_unaccent, cf. migration 0021) :
   * une recherche "ecole" doit aussi retrouver "école". A utiliser pour les
   * quelques tables sans colonne text_search dediee (trop petites/peu
   * consultees pour justifier un index FTS complet).
   */
  private unaccentIlike(column: PgColumn, value: string) {
    return sql`immutable_unaccent(${column}) ILIKE immutable_unaccent(${value})`;
  }

  async search(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return {
        verses: [],
        hadiths: [],
        tafsirEntries: [],
        books: [],
        concepts: [],
        scholars: [],
        prophets: [],
        events: [],
        fiqhTopics: [],
        schools: [],
        duas: [],
      };
    }

    const like = `%${trimmed}%`;
    // websearch_to_tsquery supporte les guillemets (phrase), l'exclusion
    // avec "-" et l'operateur OR - syntaxe adaptee a une saisie utilisateur.
    // immutable_unaccent cote requete aussi : sinon "ecole" (sans accent, tres
    // frequent) ne matcherait pas un texte indexe insensible aux accents.
    const tsQuery = sql`websearch_to_tsquery('simple', immutable_unaccent(${trimmed}))`;

    const verseColumns = {
      id: quranVerses.id,
      surahNumber: quranSurahs.number,
      surahName: quranSurahs.nameTransliterated,
      numberInSurah: quranVerses.numberInSurah,
      textArabic: quranVerses.textArabic,
      textTransliterated: quranVerses.textTransliterated,
    };

    const [arabicVerseRows, translationVerseRows, hadithRows, tafsirRows, bookRows] = await Promise.all([
      // Versets en arabe
      this.db
        .select({
          ...verseColumns,
          rank: sql<number>`ts_rank(${quranVerses.textSearch}, ${tsQuery})`,
        })
        .from(quranVerses)
        .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId))
        .where(sql`${quranVerses.textSearch} @@ ${tsQuery}`)
        .orderBy(sql`ts_rank(${quranVerses.textSearch}, ${tsQuery}) desc`)
        .limit(RESULT_LIMIT),
      // Versets trouves via les traductions (fr, en, ...) - dedoublonnes ensuite.
      this.db
        .select({
          ...verseColumns,
          rank: sql<number>`max(ts_rank(${verseTranslations.textSearch}, ${tsQuery}))`,
        })
        .from(verseTranslations)
        .innerJoin(quranVerses, eq(quranVerses.id, verseTranslations.verseId))
        .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId))
        .where(sql`${verseTranslations.textSearch} @@ ${tsQuery}`)
        .groupBy(
          quranVerses.id,
          quranSurahs.number,
          quranSurahs.nameTransliterated,
          quranVerses.numberInSurah,
          quranVerses.textArabic,
          quranVerses.textTransliterated,
        )
        .orderBy(sql`max(ts_rank(${verseTranslations.textSearch}, ${tsQuery})) desc`)
        .limit(RESULT_LIMIT),
      // Hadiths
      this.db
        .select({
          id: hadiths.id,
          collectionSlug: hadithCollections.slug,
          collectionName: hadithCollections.name,
          bookNumber: hadithBooks.number,
          number: hadiths.number,
          numberInCollection: hadiths.numberInCollection,
          textTranslation: hadiths.textTranslation,
          rank: sql<number>`ts_rank(${hadiths.textSearch}, ${tsQuery})`,
        })
        .from(hadiths)
        .innerJoin(hadithCollections, eq(hadithCollections.id, hadiths.collectionId))
        .innerJoin(hadithBooks, eq(hadithBooks.id, hadiths.hadithBookId))
        .where(sql`${hadiths.textSearch} @@ ${tsQuery}`)
        .orderBy(sql`ts_rank(${hadiths.textSearch}, ${tsQuery}) desc`)
        .limit(RESULT_LIMIT),
      // Tafsir
      this.db
        .select({
          id: tafsirEntries.id,
          workTitle: tafsirSources.title,
          surahNumber: quranSurahs.number,
          numberInSurah: quranVerses.numberInSurah,
          content: tafsirEntries.content,
          rank: sql<number>`ts_rank(${tafsirEntries.textSearch}, ${tsQuery})`,
        })
        .from(tafsirEntries)
        .innerJoin(tafsirSources, eq(tafsirSources.id, tafsirEntries.tafsirSourceId))
        .innerJoin(quranVerses, eq(quranVerses.id, tafsirEntries.verseStartId))
        .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId))
        .where(sql`${tafsirEntries.textSearch} @@ ${tsQuery}`)
        .orderBy(sql`ts_rank(${tafsirEntries.textSearch}, ${tsQuery}) desc`)
        .limit(RESULT_LIMIT),
      // Livres de la bibliotheque
      this.db
        .select({
          id: books.id,
          title: books.title,
          slug: books.slug,
          description: books.description,
          authorName: authors.name,
          rank: sql<number>`ts_rank(${books.textSearch}, ${tsQuery})`,
        })
        .from(books)
        .leftJoin(authors, eq(authors.id, books.authorId))
        .where(sql`${books.textSearch} @@ ${tsQuery}`)
        .orderBy(sql`ts_rank(${books.textSearch}, ${tsQuery}) desc`)
        .limit(RESULT_LIMIT),
    ]);

    // Fusion arabe + traductions : on garde le meilleur rang par verset.
    const verseByKey = new Map<string, (typeof arabicVerseRows)[number]>();
    for (const verse of [...arabicVerseRows, ...translationVerseRows]) {
      const key = `${verse.surahNumber}:${verse.numberInSurah}`;
      const existing = verseByKey.get(key);
      if (!existing || verse.rank > existing.rank) {
        verseByKey.set(key, verse);
      }
    }
    const verses = [...verseByKey.values()]
      .sort((a, b) => b.rank - a.rank)
      .slice(0, RESULT_LIMIT);

    const [conceptRows, scholarRows, prophetRows, eventRows, fiqhTopicRows, schoolRows, duaRows] = await Promise.all([
      this.db
        .select({ id: concepts.id, term: concepts.term, slug: concepts.slug, definition: concepts.definition })
        .from(concepts)
        .where(
          or(
            this.unaccentIlike(concepts.term, like),
            this.unaccentIlike(concepts.definition, like),
            this.unaccentIlike(concepts.explanation, like),
          ),
        )
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: scholars.id, name: scholars.name, slug: scholars.slug, bio: scholars.bio })
        .from(scholars)
        .where(or(this.unaccentIlike(scholars.name, like), this.unaccentIlike(scholars.bio, like)))
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: prophets.id, name: prophets.name, slug: prophets.slug, description: prophets.description })
        .from(prophets)
        .where(or(this.unaccentIlike(prophets.name, like), this.unaccentIlike(prophets.description, like)))
        .limit(RESULT_LIMIT),
      this.db
        .select({
          id: historicalEvents.id,
          title: historicalEvents.title,
          slug: historicalEvents.slug,
          periodSlug: historicalPeriods.slug,
          description: historicalEvents.description,
          rank: sql<number>`ts_rank(${historicalEvents.textSearch}, ${tsQuery})`,
        })
        .from(historicalEvents)
        .innerJoin(historicalPeriods, eq(historicalPeriods.id, historicalEvents.periodId))
        .where(sql`${historicalEvents.textSearch} @@ ${tsQuery}`)
        .orderBy(sql`ts_rank(${historicalEvents.textSearch}, ${tsQuery}) desc`)
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: fiqhTopics.id, title: fiqhTopics.title, slug: fiqhTopics.slug, description: fiqhTopics.description })
        .from(fiqhTopics)
        .where(or(this.unaccentIlike(fiqhTopics.title, like), this.unaccentIlike(fiqhTopics.description, like)))
        .limit(RESULT_LIMIT),
      this.db
        .select({ id: schools.id, name: schools.name, slug: schools.slug, type: schools.type })
        .from(schools)
        .where(or(this.unaccentIlike(schools.name, like), this.unaccentIlike(schools.history, like)))
        .limit(RESULT_LIMIT),
      // Duas et dhikr
      this.db
        .select({
          id: duas.id,
          title: duas.title,
          translation: duas.translation,
          categorySlug: duaCategories.slug,
          categoryName: duaCategories.name,
        })
        .from(duas)
        .innerJoin(duaCategories, eq(duaCategories.id, duas.categoryId))
        .where(
          or(
            this.unaccentIlike(duas.title, like),
            this.unaccentIlike(duas.translation, like),
            this.unaccentIlike(duas.transliteration, like),
          ),
        )
        .limit(RESULT_LIMIT),
    ]);

    return {
      verses,
      hadiths: hadithRows,
      tafsirEntries: tafsirRows,
      books: bookRows,
      concepts: conceptRows,
      scholars: scholarRows,
      prophets: prophetRows,
      events: eventRows,
      fiqhTopics: fiqhTopicRows,
      schools: schoolRows,
      duas: duaRows,
    };
  }
}