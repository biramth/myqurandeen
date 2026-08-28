import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, inArray } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { auditLogs, users } from "../../database/schema";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

@Injectable()
export class AuditLogService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(params: { limit?: number; offset?: number; entityType?: string; action?: string }) {
    const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = params.offset ?? 0;

    const conditions = [];
    if (params.entityType) conditions.push(eq(auditLogs.entityType, params.entityType));
    if (params.action) conditions.push(eq(auditLogs.action, params.action));

    const rows = await this.db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const actorIds = Array.from(new Set(rows.map((r) => r.actorUserId).filter((id): id is string => Boolean(id))));
    const actorRows = actorIds.length > 0 ? await this.db.select().from(users).where(inArray(users.id, actorIds)) : [];
    const actorById = new Map(actorRows.map((u) => [u.id, u]));

    return rows.map((r) => ({
      ...r,
      actorName: r.actorUserId ? (actorById.get(r.actorUserId)?.displayName ?? null) : null,
    }));
  }
}
