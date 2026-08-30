import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq, inArray } from "drizzle-orm";
import type { ReportStatus } from "@qurandeen/shared";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { auditLogs, reportHistory, reports, users } from "../../database/schema";

// Filet de securite : la file de moderation n'a pas encore de pagination
// cote UI admin, mais on evite qu'un `select()` sans limite ne devienne
// couteux si les signalements s'accumulent.
const MAX_REPORTS = 500;

@Injectable()
export class ReportsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listReports() {
    const rows = await this.db.select().from(reports).orderBy(desc(reports.createdAt)).limit(MAX_REPORTS);

    const userIds = Array.from(
      new Set(rows.flatMap((r) => [r.reporterUserId, r.assignedTo]).filter((id): id is string => Boolean(id))),
    );
    const userRows = userIds.length > 0 ? await this.db.select().from(users).where(inArray(users.id, userIds)) : [];
    const userById = new Map(userRows.map((u) => [u.id, u]));

    return rows.map((r) => ({
      ...r,
      reporterName: r.reporterUserId ? (userById.get(r.reporterUserId)?.displayName ?? null) : null,
      assigneeName: r.assignedTo ? (userById.get(r.assignedTo)?.displayName ?? null) : null,
    }));
  }

  async assignReport(reportId: string, moderatorId: string, actorId: string) {
    const report = await this.db.query.reports.findFirst({ where: eq(reports.id, reportId) });
    if (!report) throw new NotFoundException("Signalement introuvable");

    const [updated] = await this.db
      .update(reports)
      .set({ assignedTo: moderatorId, status: "EN_REVUE" })
      .where(eq(reports.id, reportId))
      .returning();

    await this.db.insert(reportHistory).values({
      reportId,
      status: "EN_REVUE",
      note: "Assigne pour revue",
      changedBy: actorId,
    });
    await this.logAction(actorId, "report.assign", "report", reportId, { status: report.status }, { assignedTo: moderatorId });

    return updated;
  }

  async updateStatus(reportId: string, status: ReportStatus, note: string | undefined, actorId: string) {
    const report = await this.db.query.reports.findFirst({ where: eq(reports.id, reportId) });
    if (!report) throw new NotFoundException("Signalement introuvable");

    const [updated] = await this.db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, reportId))
      .returning();

    await this.db.insert(reportHistory).values({ reportId, status, note, changedBy: actorId });
    await this.logAction(actorId, "report.status_change", "report", reportId, { status: report.status }, { status });

    return updated;
  }

  async getHistory(reportId: string) {
    return this.db
      .select()
      .from(reportHistory)
      .where(eq(reportHistory.reportId, reportId))
      .orderBy(desc(reportHistory.createdAt));
  }

  private async logAction(
    actorUserId: string,
    action: string,
    entityType: string,
    entityId: string,
    before: unknown,
    after: unknown,
  ) {
    await this.db.insert(auditLogs).values({ actorUserId, action, entityType, entityId, before, after });
  }
}
