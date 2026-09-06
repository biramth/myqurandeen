import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { historicalEvents, scholarEvents, scholars, scholarSchools, schools, sources } from "../../database/schema";

@Injectable()
export class ScholarsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listScholars() {
    return this.db
      .select({
        id: scholars.id,
        name: scholars.name,
        nameArabic: scholars.nameArabic,
        slug: scholars.slug,
        bornYear: scholars.bornYear,
        diedYear: scholars.diedYear,
        expertise: scholars.expertise,
      })
      .from(scholars)
      .orderBy(asc(scholars.bornYear));
  }

  async getScholar(slug: string) {
    const scholar = await this.db.query.scholars.findFirst({ where: eq(scholars.slug, slug) });
    if (!scholar) {
      throw new NotFoundException(`Savant "${slug}" introuvable`);
    }

    const [relatedSchools, [sourceRow], relatedEvents] = await Promise.all([
      this.db
        .select({ id: schools.id, name: schools.name, slug: schools.slug })
        .from(scholarSchools)
        .innerJoin(schools, eq(schools.id, scholarSchools.schoolId))
        .where(eq(scholarSchools.scholarId, scholar.id)),
      scholar.sourceId
        ? this.db.select({ title: sources.title }).from(sources).where(eq(sources.id, scholar.sourceId))
        : Promise.resolve([]),
      this.db
        .select({ id: historicalEvents.id, title: historicalEvents.title, slug: historicalEvents.slug })
        .from(scholarEvents)
        .innerJoin(historicalEvents, eq(historicalEvents.id, scholarEvents.eventId))
        .where(eq(scholarEvents.scholarId, scholar.id)),
    ]);

    return { ...scholar, schools: relatedSchools, sourceTitle: sourceRow?.title ?? null, events: relatedEvents };
  }
}
