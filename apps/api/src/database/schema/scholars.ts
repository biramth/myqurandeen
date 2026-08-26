import { pgTable, primaryKey, smallint, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { sources, books } from "./sources";
import { schools } from "./schools";

export const scholars = pgTable("scholars", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull(),
  nameArabic: varchar("name_arabic", { length: 200 }),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  bornYear: smallint("born_year"),
  diedYear: smallint("died_year"),
  place: varchar("place", { length: 150 }),
  bio: text("bio"),
  expertise: text("expertise").array(),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  ...timestamps,
});

export const scholarSchools = pgTable(
  "scholar_schools",
  {
    scholarId: uuid("scholar_id")
      .notNull()
      .references(() => scholars.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.scholarId, t.schoolId] })],
);

export const scholarBooks = pgTable(
  "scholar_books",
  {
    scholarId: uuid("scholar_id")
      .notNull()
      .references(() => scholars.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.scholarId, t.bookId] })],
);
