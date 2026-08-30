import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq, inArray } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { authors, bookCategories, bookCategoryLinks, books } from "../../database/schema";

// Filet de securite : la bibliotheque est un catalogue curee (dizaines
// d'ouvrages), mais on borne quand meme la liste au cas ou elle grossirait
// fortement sans pagination cote client.
const MAX_BOOKS = 500;

@Injectable()
export class LibraryService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listCategories() {
    return this.db.select().from(bookCategories).orderBy(asc(bookCategories.name));
  }

  async listBooks() {
    // Jointure SQL (auteur) au lieu de charger toute la table `authors` en
    // memoire pour la mapper en JS.
    const rows = await this.db
      .select({
        id: books.id,
        slug: books.slug,
        title: books.title,
        authorName: authors.name,
        language: books.language,
        era: books.era,
        publicDomain: books.publicDomain,
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .orderBy(asc(books.title))
      .limit(MAX_BOOKS);

    if (rows.length === 0) return [];

    // Categories : une seule requete jointe, filtree aux ouvrages effectivement
    // retournes (au lieu de charger toute la table `book_categories`).
    const bookIds = rows.map((b) => b.id);
    const categoryRows = await this.db
      .select({ bookId: bookCategoryLinks.bookId, id: bookCategories.id, name: bookCategories.name })
      .from(bookCategoryLinks)
      .innerJoin(bookCategories, eq(bookCategoryLinks.categoryId, bookCategories.id))
      .where(inArray(bookCategoryLinks.bookId, bookIds));

    const categoriesByBook = new Map<string, { id: string; name: string }[]>();
    for (const c of categoryRows) {
      const list = categoriesByBook.get(c.bookId) ?? [];
      list.push({ id: c.id, name: c.name });
      categoriesByBook.set(c.bookId, list);
    }

    return rows.map((book) => ({ ...book, categories: categoriesByBook.get(book.id) ?? [] }));
  }

  async getBook(slug: string) {
    const book = await this.db.query.books.findFirst({ where: eq(books.slug, slug) });
    if (!book) {
      throw new NotFoundException(`Ouvrage "${slug}" introuvable`);
    }

    // Auteur et categories sont independants l'un de l'autre : parallelises.
    const [author, categories] = await Promise.all([
      book.authorId ? this.db.query.authors.findFirst({ where: eq(authors.id, book.authorId) }) : null,
      this.db
        .select({ id: bookCategories.id, name: bookCategories.name })
        .from(bookCategoryLinks)
        .innerJoin(bookCategories, eq(bookCategoryLinks.categoryId, bookCategories.id))
        .where(eq(bookCategoryLinks.bookId, book.id)),
    ]);

    return { ...book, author, categories };
  }
}
