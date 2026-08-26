import { boolean, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { SOURCE_TYPES } from "@qurandeen/shared";

/**
 * Coeur du systeme de provenance (voir CONTRIBUTING.md) : tout contenu
 * religieux significatif doit remonter jusqu'a une source tracable.
 */
export const authors = pgTable("authors", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull().unique(),
  nameArabic: varchar("name_arabic", { length: 200 }),
  bio: text("bio"),
  era: varchar("era", { length: 100 }),
  ...timestamps,
});

export const sources = pgTable("sources", {
  id: id(),
  title: varchar("title", { length: 300 }).notNull().unique(),
  type: varchar("type", { length: 32, enum: SOURCE_TYPES }).notNull(),
  authorId: uuid("author_id").references(() => authors.id, { onDelete: "set null" }),
  url: text("url"),
  language: varchar("language", { length: 8 }),
  ...timestamps,
});

export const bookCategories = pgTable("book_categories", {
  id: id(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  ...timestamps,
});

export const books = pgTable("books", {
  id: id(),
  title: varchar("title", { length: 300 }).notNull(),
  authorId: uuid("author_id").references(() => authors.id, { onDelete: "set null" }),
  description: text("description"),
  language: varchar("language", { length: 8 }),
  era: varchar("era", { length: 100 }),
  publicDomain: boolean("public_domain").default(false).notNull(),
  license: varchar("license", { length: 120 }),
  externalUrl: text("external_url"),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  ...timestamps,
});

export const bookEditions = pgTable("book_editions", {
  id: id(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  publisher: varchar("publisher", { length: 200 }),
  year: varchar("year", { length: 16 }),
  isbn: varchar("isbn", { length: 32 }),
  ...timestamps,
});

export const bookCategoryLinks = pgTable(
  "book_category_links",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => bookCategories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.categoryId] })],
);
