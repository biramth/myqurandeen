import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { scholars, scholarSchools, schools } from "../../database/schema";

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

    const relatedSchools = await this.db
      .select({ id: schools.id, name: schools.name, slug: schools.slug })
      .from(scholarSchools)
      .innerJoin(schools, eq(schools.id, scholarSchools.schoolId))
      .where(eq(scholarSchools.scholarId, scholar.id));

    return { ...scholar, schools: relatedSchools };
  }
}
