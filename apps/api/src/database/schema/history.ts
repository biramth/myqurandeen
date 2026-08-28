import { customType, index, integer, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { id, timestamps } from "./_columns";
import { sources } from "./sources";
import { scholars } from "./scholars";
import { users } from "./identity";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

/**
 * Periodes historiques generiques : couvre aussi bien la vie du Prophete
 * (Mecque/Medine) que les Rashidun, Omeyyades, Abbassides, Al-Andalus,
 * l'Islam en Afrique de l'Ouest, etc. Une seule structure, extensible.
 */
export const historicalPeriods = pgTable("historical_periods", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  region: varchar("region", { length: 150 }),
  description: text("description"),
  ...timestamps,
});

export const historicalEvents = pgTable(
  "historical_events",
  {
    id: id(),
    periodId: uuid("period_id")
      .notNull()
      .references(() => historicalPeriods.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 250 }).notNull(),
    slug: varchar("slug", { length: 250 }).notNull().unique(),
    dateApprox: varchar("date_approx", { length: 60 }),
    eventType: varchar("event_type", { length: 60 }),
    description: text("description").notNull(),
    textSearch: tsvector("text_search").generatedAlwaysAs(
      (): ReturnType<typeof sql> =>
        sql`to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))`,
    ),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("historical_events_text_search_gin_idx").using("gin", t.textSearch)],
);

export const eventSources = pgTable(
  "event_sources",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => historicalEvents.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.sourceId] })],
);

export const scholarEvents = pgTable(
  "scholar_events",
  {
    scholarId: uuid("scholar_id")
      .notNull()
      .references(() => scholars.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => historicalEvents.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.scholarId, t.eventId] })],
);
