import { boolean, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";

/** Roles RBAC (SUPER_ADMIN, ADMIN, EDITOR, REVIEWER, MODERATOR, USER). */
export const roles = pgTable("roles", {
  id: id(),
  name: varchar("name", { length: 32 }).notNull().unique(),
  description: text("description"),
  ...timestamps,
});

/** Permission granulaire au format "resource:action" (voir @qurandeen/shared). */
export const permissions = pgTable("permissions", {
  id: id(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  resource: varchar("resource", { length: 64 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  description: text("description"),
  ...timestamps,
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const users = pgTable("users", {
  id: id(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 120 }).notNull(),
  locale: varchar("locale", { length: 8 }).default("fr").notNull(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),
  isActive: boolean("is_active").default(true).notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  ...timestamps,
});
