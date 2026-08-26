import { jsonb, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";
import { REPORT_REASONS, REPORT_STATUSES, TARGET_TYPES } from "@qurandeen/shared";

export const reports = pgTable("reports", {
  id: id(),
  reporterUserId: uuid("reporter_user_id").references(() => users.id, { onDelete: "set null" }),
  targetType: varchar("target_type", { length: 32, enum: TARGET_TYPES }).notNull(),
  targetId: uuid("target_id").notNull(),
  reasonCategory: varchar("reason_category", { length: 32, enum: REPORT_REASONS }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 16, enum: REPORT_STATUSES }).default("SIGNALE").notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
});

export const reportHistory = pgTable("report_history", {
  id: id(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 16, enum: REPORT_STATUSES }).notNull(),
  note: text("note"),
  changedBy: uuid("changed_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
});

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 60 }).notNull(),
  entityId: uuid("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  ip: varchar("ip", { length: 64 }),
  ...timestamps,
});
