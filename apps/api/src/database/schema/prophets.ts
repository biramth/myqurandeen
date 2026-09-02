import { pgTable, smallint, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { sources } from "./sources";
import { users } from "./identity";

/**
 * Les prophetes reconnus par l'Islam (perspective islamique), y compris
 * ceux communs aux traditions juive et chretienne. Contenu compile a
 * partir du Coran et d'ouvrages de reference classiques (voir seed) -
 * aucun recit invente.
 */
export const prophets = pgTable("prophets", {
  id: id(),
  name: varchar("name", { length: 100 }).notNull(),
  nameArabic: varchar("name_arabic", { length: 100 }),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  /** Peuple/nation auquel le prophete a ete envoye, si mentionne dans la tradition. */
  peopleAddressed: varchar("people_addressed", { length: 150 }),
  quranicMentions: text("quranic_mentions"),
  description: text("description").notNull(),
  era: varchar("era", { length: 150 }),
  orderIndex: smallint("order_index").notNull(),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
}).enableRLS();
