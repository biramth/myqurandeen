import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { fiqhDivergenceNotes, fiqhPositions, fiqhTopics, schools, sources } from "../../database/schema";

@Injectable()
export class SchoolsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listSchools() {
    return this.db.select().from(schools).orderBy(asc(schools.type), asc(schools.name));
  }

  async getSchool(slug: string) {
    const school = await this.db.query.schools.findFirst({ where: eq(schools.slug, slug) });
    if (!school) {
      throw new NotFoundException(`Ecole "${slug}" introuvable`);
    }
    return school;
  }

  async listFiqhTopics() {
    return this.db
      .select({ id: fiqhTopics.id, title: fiqhTopics.title, slug: fiqhTopics.slug, category: fiqhTopics.category })
      .from(fiqhTopics)
      .orderBy(asc(fiqhTopics.category), asc(fiqhTopics.title));
  }

  async getFiqhTopicComparison(slug: string) {
    const topic = await this.db.query.fiqhTopics.findFirst({ where: eq(fiqhTopics.slug, slug) });
    if (!topic) {
      throw new NotFoundException(`Sujet de fiqh "${slug}" introuvable`);
    }

    const [positions, divergenceNotes] = await Promise.all([
      this.db
        .select({
          schoolId: schools.id,
          schoolName: schools.name,
          schoolSlug: schools.slug,
          positionText: fiqhPositions.positionText,
          sourceTitle: sources.title,
        })
        .from(fiqhPositions)
        .innerJoin(schools, eq(schools.id, fiqhPositions.schoolId))
        .leftJoin(sources, eq(sources.id, fiqhPositions.sourceId))
        .where(eq(fiqhPositions.fiqhTopicId, topic.id))
        .orderBy(asc(schools.name)),
      this.db
        .select({ explanation: fiqhDivergenceNotes.explanation })
        .from(fiqhDivergenceNotes)
        .where(eq(fiqhDivergenceNotes.fiqhTopicId, topic.id)),
    ]);

    return { topic, positions, divergenceNotes };
  }
}
