import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { concepts, conceptDivergences, conceptRelations } from "../../database/schema";

@Injectable()
export class ConceptsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listConcepts() {
    return this.db
      .select({ id: concepts.id, term: concepts.term, termArabic: concepts.termArabic, slug: concepts.slug, definition: concepts.definition })
      .from(concepts)
      .orderBy(asc(concepts.term));
  }

  async getConcept(slug: string) {
    const concept = await this.db.query.concepts.findFirst({ where: eq(concepts.slug, slug) });
    if (!concept) {
      throw new NotFoundException(`Concept "${slug}" introuvable`);
    }

    const [related, divergences] = await Promise.all([
      this.db
        .select({ id: concepts.id, term: concepts.term, slug: concepts.slug })
        .from(conceptRelations)
        .innerJoin(concepts, eq(concepts.id, conceptRelations.relatedConceptId))
        .where(eq(conceptRelations.conceptId, concept.id)),
      this.db
        .select({ explanation: conceptDivergences.explanation })
        .from(conceptDivergences)
        .where(eq(conceptDivergences.conceptId, concept.id)),
    ]);

    return { ...concept, related, divergences };
  }
}
