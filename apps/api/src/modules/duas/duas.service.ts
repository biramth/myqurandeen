import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { duaCategories, duas, sources } from "../../database/schema";

@Injectable()
export class DuasService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listCategories() {
    return this.db.select().from(duaCategories).orderBy(asc(duaCategories.orderIndex));
  }

  async getCategory(slug: string) {
    const category = await this.db.query.duaCategories.findFirst({ where: eq(duaCategories.slug, slug) });
    if (!category) {
      throw new NotFoundException(`Categorie de dua "${slug}" introuvable`);
    }

    const items = await this.db
      .select({
        id: duas.id,
        title: duas.title,
        arabicText: duas.arabicText,
        transliteration: duas.transliteration,
        translation: duas.translation,
        repeatCount: duas.repeatCount,
        virtue: duas.virtue,
        referenceUrl: duas.referenceUrl,
        sourceTitle: sources.title,
      })
      .from(duas)
      .leftJoin(sources, eq(sources.id, duas.sourceId))
      .where(eq(duas.categoryId, category.id))
      .orderBy(asc(duas.orderIndex));

    return { category, duas: items };
  }
}
