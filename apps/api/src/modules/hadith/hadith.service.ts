import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  authors,
  hadithBooks,
  hadithCollections,
  hadithGrades,
  hadithTranslations,
  hadiths,
  translations,
} from "../../database/schema";

const DEFAULT_PAGE_SIZE = 30;

@Injectable()
export class HadithService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listCollections() {
    return this.db
      .select({
        id: hadithCollections.id,
        slug: hadithCollections.slug,
        name: hadithCollections.name,
        nameArabic: hadithCollections.nameArabic,
        description: hadithCollections.description,
        compilerName: authors.name,
      })
      .from(hadithCollections)
      .leftJoin(authors, eq(authors.id, hadithCollections.compilerAuthorId))
      .orderBy(asc(hadithCollections.name));
  }

  private async getCollectionOrThrow(slug: string) {
    const collection = await this.db.query.hadithCollections.findFirst({
      where: eq(hadithCollections.slug, slug),
    });
    if (!collection) {
      throw new NotFoundException(`Collection de hadiths "${slug}" introuvable`);
    }
    return collection;
  }

  async getCollectionBySlug(slug: string) {
    const collection = await this.getCollectionOrThrow(slug);

    const compiler = collection.compilerAuthorId
      ? await this.db.query.authors.findFirst({ where: eq(authors.id, collection.compilerAuthorId) })
      : null;

    const books = await this.db
      .select({ id: hadithBooks.id, number: hadithBooks.number, title: hadithBooks.title })
      .from(hadithBooks)
      .where(eq(hadithBooks.collectionId, collection.id))
      .orderBy(asc(hadithBooks.number));

    return { ...collection, compilerName: compiler?.name ?? null, books };
  }

  async getBookHadiths(slug: string, bookNumber: number, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    const collection = await this.getCollectionOrThrow(slug);
    const book = await this.db.query.hadithBooks.findFirst({
      where: and(eq(hadithBooks.collectionId, collection.id), eq(hadithBooks.number, bookNumber)),
    });
    if (!book) {
      throw new NotFoundException(`Chapitre ${bookNumber} introuvable dans ${slug}`);
    }

    const rows = await this.db
      .select({
        id: hadiths.id,
        number: hadiths.number,
        numberInCollection: hadiths.numberInCollection,
        textArabic: hadiths.textArabic,
        textTranslation: hadiths.textTranslation,
        authenticityGrade: hadiths.authenticityGrade,
      })
      .from(hadiths)
      .where(eq(hadiths.hadithBookId, book.id))
      .orderBy(asc(hadiths.sortOrder))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return { book: { number: book.number, title: book.title }, page, pageSize, hadiths: rows };
  }

  async listCollectionTranslations(slug: string) {
    const collection = await this.getCollectionOrThrow(slug);

    return this.db
      .select({ id: translations.id, name: translations.name, language: translations.language })
      .from(translations)
      .innerJoin(hadithTranslations, eq(hadithTranslations.translationId, translations.id))
      .innerJoin(hadiths, eq(hadiths.id, hadithTranslations.hadithId))
      .where(eq(hadiths.collectionId, collection.id))
      .groupBy(translations.id, translations.name, translations.language)
      .orderBy(asc(translations.language));
  }

  async getBookTranslation(slug: string, bookNumber: number, translationId: string) {
    const collection = await this.getCollectionOrThrow(slug);
    const book = await this.db.query.hadithBooks.findFirst({
      where: and(eq(hadithBooks.collectionId, collection.id), eq(hadithBooks.number, bookNumber)),
    });
    if (!book) {
      throw new NotFoundException(`Chapitre ${bookNumber} introuvable dans ${slug}`);
    }

    return this.db
      .select({ numberInCollection: hadiths.numberInCollection, text: hadithTranslations.text })
      .from(hadithTranslations)
      .innerJoin(hadiths, eq(hadiths.id, hadithTranslations.hadithId))
      .where(and(eq(hadiths.hadithBookId, book.id), eq(hadithTranslations.translationId, translationId)))
      .orderBy(asc(hadiths.sortOrder));
  }

  async getHadithDetail(slug: string, numberInCollection: string) {
    const collection = await this.getCollectionOrThrow(slug);

    const hadith = await this.db.query.hadiths.findFirst({
      where: and(eq(hadiths.collectionId, collection.id), eq(hadiths.numberInCollection, numberInCollection)),
    });
    if (!hadith) {
      throw new NotFoundException(`Hadith ${numberInCollection} introuvable dans ${slug}`);
    }

    const [book, grades, otherTranslations] = await Promise.all([
      this.db.query.hadithBooks.findFirst({ where: eq(hadithBooks.id, hadith.hadithBookId) }),
      this.db
        .select({ graderName: hadithGrades.graderName, grade: hadithGrades.grade })
        .from(hadithGrades)
        .where(eq(hadithGrades.hadithId, hadith.id)),
      this.db
        .select({ translationId: translations.id, translationName: translations.name, language: translations.language, text: hadithTranslations.text })
        .from(hadithTranslations)
        .innerJoin(translations, eq(translations.id, hadithTranslations.translationId))
        .where(eq(hadithTranslations.hadithId, hadith.id)),
    ]);

    return {
      collection: { slug: collection.slug, name: collection.name },
      book: book ? { number: book.number, title: book.title } : null,
      hadith,
      grades,
      translations: otherTranslations,
    };
  }
}
