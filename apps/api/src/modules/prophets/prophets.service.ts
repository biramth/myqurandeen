import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { prophets } from "../../database/schema";

@Injectable()
export class ProphetsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listProphets() {
    return this.db
      .select({
        id: prophets.id,
        name: prophets.name,
        nameArabic: prophets.nameArabic,
        slug: prophets.slug,
        era: prophets.era,
      })
      .from(prophets)
      .orderBy(asc(prophets.orderIndex));
  }

  async getProphet(slug: string) {
    const prophet = await this.db.query.prophets.findFirst({ where: eq(prophets.slug, slug) });
    if (!prophet) {
      throw new NotFoundException(`Prophete "${slug}" introuvable`);
    }
    return prophet;
  }
}
