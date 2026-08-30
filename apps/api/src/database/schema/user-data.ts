import { boolean, index, pgTable, text, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";
import { TARGET_TYPES } from "@qurandeen/shared";

/** target_type/target_id : cible polymorphe legere, validee cote code. */
export const notes = pgTable(
  "notes",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: varchar("target_type", { length: 32, enum: TARGET_TYPES }).notNull(),
    targetId: uuid("target_id").notNull(),
    content: text("content").notNull(),
    isPrivate: boolean("is_private").default(true).notNull(),
    ...timestamps,
  },
  (t) => [index("notes_user_id_idx").on(t.userId), index("notes_target_idx").on(t.targetType, t.targetId)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: varchar("target_type", { length: 32, enum: TARGET_TYPES }).notNull(),
    targetId: uuid("target_id").notNull(),
    ...timestamps,
  },
  (t) => [unique("bookmarks_user_target_uidx").on(t.userId, t.targetType, t.targetId)],
);

export const collections = pgTable(
  "collections",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    ...timestamps,
  },
  (t) => [index("collections_user_id_idx").on(t.userId)],
);

export const collectionItems = pgTable(
  "collection_items",
  {
    id: id(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    targetType: varchar("target_type", { length: 32, enum: TARGET_TYPES }).notNull(),
    targetId: uuid("target_id").notNull(),
    ...timestamps,
  },
  (t) => [unique("collection_items_collection_target_uidx").on(t.collectionId, t.targetType, t.targetId)],
);
