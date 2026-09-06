import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { eventSources, historicalEvents, historicalPeriods, scholarEvents, scholars, sources } from "../../database/schema";

@Injectable()
export class HistoryService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listPeriods() {
    return this.db
      .select()
      .from(historicalPeriods)
      .orderBy(asc(historicalPeriods.startYear));
  }

  async getPeriod(slug: string) {
    const period = await this.db.query.historicalPeriods.findFirst({ where: eq(historicalPeriods.slug, slug) });
    if (!period) {
      throw new NotFoundException(`Periode "${slug}" introuvable`);
    }

    const events = await this.db
      .select({
        id: historicalEvents.id,
        title: historicalEvents.title,
        slug: historicalEvents.slug,
        dateApprox: historicalEvents.dateApprox,
        eventType: historicalEvents.eventType,
        description: historicalEvents.description,
      })
      .from(historicalEvents)
      .where(eq(historicalEvents.periodId, period.id))
      .orderBy(asc(historicalEvents.createdAt));

    return { ...period, events };
  }

  async getEvent(slug: string) {
    const event = await this.db.query.historicalEvents.findFirst({ where: eq(historicalEvents.slug, slug) });
    if (!event) {
      throw new NotFoundException(`Evenement "${slug}" introuvable`);
    }

    const [period, eventSourceRows, relatedScholars] = await Promise.all([
      this.db.query.historicalPeriods.findFirst({ where: eq(historicalPeriods.id, event.periodId) }),
      this.db
        .select({ title: sources.title, url: sources.url })
        .from(eventSources)
        .innerJoin(sources, eq(sources.id, eventSources.sourceId))
        .where(eq(eventSources.eventId, event.id)),
      this.db
        .select({ id: scholars.id, name: scholars.name, slug: scholars.slug })
        .from(scholarEvents)
        .innerJoin(scholars, eq(scholars.id, scholarEvents.scholarId))
        .where(eq(scholarEvents.eventId, event.id)),
    ]);

    return {
      event,
      period: period ? { slug: period.slug, name: period.name } : null,
      sources: eventSourceRows,
      relatedScholars,
    };
  }
}
