import { pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";

/**
 * Groupes de destinataires marketing (ex. "Beta testeurs", "Contributeurs") -
 * permet de cibler une campagne a un sous-ensemble de la base plutot qu'a
 * tout le monde. Rien a voir avec les roles RBAC (roles = permissions dans
 * l'app, groupes = segmentation d'audience email).
 */
export const marketingGroups = pgTable("marketing_groups", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  description: text("description"),
  ...timestamps,
});

export const marketingGroupMembers = pgTable(
  "marketing_group_members",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => marketingGroups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.userId] })],
);
