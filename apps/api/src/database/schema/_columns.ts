import { timestamp, uuid } from "drizzle-orm/pg-core";

/** Cle primaire UUID standard, generee cote base. */
export const id = () => uuid("id").defaultRandom().primaryKey();

/** Colonnes d'horodatage standard, presentes sur toutes les tables. */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};
