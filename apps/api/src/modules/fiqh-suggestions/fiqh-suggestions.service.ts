import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq, inArray } from "drizzle-orm";
import type { FiqhSuggestionStatus } from "@qurandeen/shared";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { auditLogs, fiqhSuggestions, users } from "../../database/schema";

@Injectable()
export class FiqhSuggestionsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(userId: string, question: string, context: string | undefined) {
    const [row] = await this.db
      .insert(fiqhSuggestions)
      .values({ submittedBy: userId, question, context })
      .returning();
    return row;
  }

  /** Admin uniquement : liste complete, avec le nom de l'auteur si connu. */
  async list() {
    const rows = await this.db.select().from(fiqhSuggestions).orderBy(desc(fiqhSuggestions.createdAt));

    const userIds = Array.from(
      new Set(rows.flatMap((r) => [r.submittedBy, r.handledBy]).filter((id): id is string => Boolean(id))),
    );
    const userRows = userIds.length > 0 ? await this.db.select().from(users).where(inArray(users.id, userIds)) : [];
    const userById = new Map(userRows.map((u) => [u.id, u]));

    return rows.map((r) => ({
      ...r,
      submittedByName: r.submittedBy ? (userById.get(r.submittedBy)?.displayName ?? null) : null,
      handledByName: r.handledBy ? (userById.get(r.handledBy)?.displayName ?? null) : null,
    }));
  }

  async updateStatus(
    id: string,
    status: FiqhSuggestionStatus,
    adminNote: string | undefined,
    actorId: string,
  ) {
    const existing = await this.db.query.fiqhSuggestions.findFirst({ where: eq(fiqhSuggestions.id, id) });
    if (!existing) throw new NotFoundException("Suggestion introuvable");

    const [updated] = await this.db
      .update(fiqhSuggestions)
      .set({ status, adminNote: adminNote ?? existing.adminNote, handledBy: actorId })
      .where(eq(fiqhSuggestions.id, id))
      .returning();

    await this.db.insert(auditLogs).values({
      actorUserId: actorId,
      action: "fiqh_suggestion.status_change",
      entityType: "fiqh_suggestion",
      entityId: id,
      before: { status: existing.status },
      after: { status },
    });

    return updated;
  }
}
