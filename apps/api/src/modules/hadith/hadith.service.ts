import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq, inArray } from "drizzle-orm";
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

/**
 * Choisit la traduction a mettre en avant : langue de l'interface si elle
 * existe, sinon anglais, sinon la premiere disponible. Meme principe que le
 * verset/hadith du jour (cf. daily.service.ts). La traduction anglaise
 * d'origine (colonne `hadiths.textTranslation`, toujours presente) est
 * fournie ici comme une entree parmi les autres pour que le repli sur
 * l'anglais fonctionne et qu'elle reste listee dans "Autres traductions"
 * quand une autre langue passe devant.
 */
function pickPreferredTranslation<T extends { language: string }>(
  rows: T[],
  lang: string | undefined,
): T | undefined {
  return (
    (lang ? rows.find((row) => row.language === lang) : undefined) ??
    rows.find((row) => row.language === "en") ??
    rows[0]
  );
}

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

  async getBookHadiths(
    slug: string,
    bookNumber: number,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    lang?: string,
  ) {
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

    // `textTranslation` par defaut = anglais d'origine. On l'affiche dans la
    // langue de l'interface quand une traduction existe (`hadithTranslations`),
    // en retombant sur cet anglais sinon - meme principe que la page de detail
    // et le hadith du jour.
    if (rows.length > 0) {
      const translationRows = await this.db
        .select({
          hadithId: hadithTranslations.hadithId,
          language: translations.language,
          text: hadithTranslations.text,
        })
        .from(hadithTranslations)
        .innerJoin(translations, eq(translations.id, hadithTranslations.translationId))
        .where(
          inArray(
            hadithTranslations.hadithId,
            rows.map((row) => row.id),
          ),
        )
        .orderBy(asc(translations.language));

      const byHadith = new Map<string, { language: string; text: string }[]>();
      for (const row of translationRows) {
        const list = byHadith.get(row.hadithId);
        if (list) list.push(row);
        else byHadith.set(row.hadithId, [row]);
      }
      for (const hadith of rows) {
        const candidates = [
          { language: "en", text: hadith.textTranslation },
          ...(byHadith.get(hadith.id) ?? []),
        ];
        const preferred = pickPreferredTranslation(candidates, lang);
        if (preferred) hadith.textTranslation = preferred.text;
      }
    }

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

  async getHadithDetail(slug: string, numberInCollection: string, lang?: string) {
    const collection = await this.getCollectionOrThrow(slug);

    const hadith = await this.db.query.hadiths.findFirst({
      where: and(eq(hadiths.collectionId, collection.id), eq(hadiths.numberInCollection, numberInCollection)),
    });
    if (!hadith) {
      throw new NotFoundException(`Hadith ${numberInCollection} introuvable dans ${slug}`);
    }

    const [book, grades, extraTranslations] = await Promise.all([
      this.db.query.hadithBooks.findFirst({ where: eq(hadithBooks.id, hadith.hadithBookId) }),
      this.db
        .select({ graderName: hadithGrades.graderName, grade: hadithGrades.grade })
        .from(hadithGrades)
        .where(eq(hadithGrades.hadithId, hadith.id)),
      this.db
        .select({ translationId: translations.id, translationName: translations.name, language: translations.language, text: hadithTranslations.text })
        .from(hadithTranslations)
        .innerJoin(translations, eq(translations.id, hadithTranslations.translationId))
        .where(eq(hadithTranslations.hadithId, hadith.id))
        .orderBy(asc(translations.language)),
    ]);

    // La traduction anglaise d'origine (colonne, toujours presente) rejoint
    // les traductions `hadithTranslations` comme une entree normale : on met
    // en avant celle de la langue de l'interface si elle existe, sinon
    // l'anglais, et les autres restent listees dans "Autres traductions".
    const originalEnglish = {
      translationId: `${hadith.id}:original-en`,
      translationName: `${collection.name} (en)`,
      language: "en",
      text: hadith.textTranslation,
    };
    const allTranslations = [originalEnglish, ...extraTranslations];
    const primary = pickPreferredTranslation(allTranslations, lang) ?? originalEnglish;

    return {
      collection: { slug: collection.slug, name: collection.name },
      book: book ? { number: book.number, title: book.title } : null,
      hadith: { ...hadith, textTranslation: primary.text },
      grades,
      translations: allTranslations.filter((row) => row.translationId !== primary.translationId),
    };
  }
}
