import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { authors, bookCategories, bookCategoryLinks, books } from "../../database/schema";

@Injectable()
export class LibraryService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listCategories() {
    return this.db.select().from(bookCategories).orderBy(asc(bookCategories.name));
  }

  async listBooks() {
    const rows = await this.db.query.books.findMany({ orderBy: (b, { asc: ascOp }) => ascOp(b.title) });

    // Jointures manuelles (auteur + categories) pour rester coherent avec le
    // reste du code, qui evite les relations Drizzle declaratives.
    const authorRows = await this.db.select().from(authors);
    const authorById = new Map(authorRows.map((a) => [a.id, a]));

    const links = await this.db.select().from(bookCategoryLinks);
    const categoryRows = await this.db.select().from(bookCategories);
    const categoryById = new Map(categoryRows.map((c) => [c.id, c]));
    const categoriesByBook = new Map<string, { id: string; name: string }[]>();
    for (const link of links) {
      const category = categoryById.get(link.categoryId);
      if (!category) continue;
      const list = categoriesByBook.get(link.bookId) ?? [];
      list.push({ id: category.id, name: category.name });
      categoriesByBook.set(link.bookId, list);
    }

    return rows.map((book) => ({
      id: book.id,
      slug: book.slug,
      title: book.title,
      authorName: book.authorId ? (authorById.get(book.authorId)?.name ?? null) : null,
      language: book.language,
      era: book.era,
      publicDomain: book.publicDomain,
      categories: categoriesByBook.get(book.id) ?? [],
    }));
  }

  async getBook(slug: string) {
    const book = await this.db.query.books.findFirst({ where: eq(books.slug, slug) });
    if (!book) {
      throw new NotFoundException(`Ouvrage "${slug}" introuvable`);
    }

    const author = book.authorId
      ? await this.db.query.authors.findFirst({ where: eq(authors.id, book.authorId) })
      : null;

    const links = await this.db.select().from(bookCategoryLinks).where(eq(bookCategoryLinks.bookId, book.id));
    const categoryRows = await this.db.select().from(bookCategories);
    const categoryById = new Map(categoryRows.map((c) => [c.id, c]));
    const categories = links
      .map((l) => categoryById.get(l.categoryId))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({ id: c.id, name: c.name }));

    return { ...book, author, categories };
  }
}
