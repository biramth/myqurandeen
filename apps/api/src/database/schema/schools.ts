import { pgTable, text, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { sources } from "./sources";
import { users } from "./identity";
import { SCHOOL_TYPES } from "@qurandeen/shared";

/** Ecoles juridiques (fiqh) et courants theologiques, meme table (type). */
export const schools = pgTable("schools", {
  id: id(),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  type: varchar("type", { length: 16, enum: SCHOOL_TYPES }).notNull(),
  founderScholarId: uuid("founder_scholar_id"),
  history: text("history"),
  principles: text("principles"),
  sourcesUsed: text("sources_used"),
  era: varchar("era", { length: 100 }),
  ...timestamps,
});

export const fiqhTopics = pgTable("fiqh_topics", {
  id: id(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  ...timestamps,
});

/** Coeur du comparateur d'ecoles : position structuree, pas generee. */
export const fiqhPositions = pgTable(
  "fiqh_positions",
  {
    id: id(),
    fiqhTopicId: uuid("fiqh_topic_id")
      .notNull()
      .references(() => fiqhTopics.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    positionText: text("position_text").notNull(),
    sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [unique("fiqh_positions_topic_school_uidx").on(t.fiqhTopicId, t.schoolId)],
);

export const fiqhDivergenceNotes = pgTable("fiqh_divergence_notes", {
  id: id(),
  fiqhTopicId: uuid("fiqh_topic_id")
    .notNull()
    .references(() => fiqhTopics.id, { onDelete: "cascade" }),
  explanation: text("explanation").notNull(),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  ...timestamps,
});
