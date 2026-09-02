import { index, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { sources } from "./sources";
import { users } from "./identity";

export const concepts = pgTable("concepts", {
  id: id(),
  term: varchar("term", { length: 150 }).notNull(),
  termArabic: varchar("term_arabic", { length: 150 }),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  definition: text("definition").notNull(),
  origin: text("origin"),
  explanation: text("explanation"),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
}).enableRLS();

export const conceptRelations = pgTable(
  "concept_relations",
  {
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    relatedConceptId: uuid("related_concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    relationType: varchar("relation_type", { length: 60 }),
  },
  (t) => [primaryKey({ columns: [t.conceptId, t.relatedConceptId] })],
).enableRLS();

export const conceptDivergences = pgTable(
  "concept_divergences",
  {
    id: id(),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    explanation: text("explanation").notNull(),
    sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("concept_divergences_concept_id_idx").on(t.conceptId)],
).enableRLS();
