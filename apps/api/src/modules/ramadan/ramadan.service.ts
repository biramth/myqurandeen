import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq, lt } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { khatmProgress, quranSurahs } from "../../database/schema";
import { getHijriDate } from "../reminders/hijri-calendar";

/**
 * Suivi de khatm (ROADMAP.md, phase 4). `versesCompleted` est toujours
 * derive de la position marquee (lastSurahNumber/lastVerseNumber), jamais
 * saisi directement - garantit qu'il reste coherent avec ce qui est
 * affiche. L'objectif quotidien (versets restants / jours restants du
 * Ramadan) est calcule cote client (features/ramadan/hijri-calendar.ts),
 * comme le reste du calendrier hijri - ce service ne stocke qu'une position.
 */
@Injectable()
export class RamadanService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getKhatmProgress(userId: string) {
    const [row] = await this.db.select().from(khatmProgress).where(eq(khatmProgress.userId, userId)).limit(1);
    return row ?? null;
  }

  async upsertKhatmProgress(userId: string, input: { surahNumber: number; verseNumber: number }) {
    const surah = await this.db.query.quranSurahs.findFirst({ where: eq(quranSurahs.number, input.surahNumber) });
    if (!surah) throw new NotFoundException(`Sourate ${input.surahNumber} introuvable`);
    if (input.verseNumber > surah.versesCount) {
      throw new BadRequestException(`La sourate ${input.surahNumber} ne compte que ${surah.versesCount} versets`);
    }

    // Somme des versets des sourates precedentes + la position dans la sourate courante.
    const precedingSurahs = await this.db.query.quranSurahs.findMany({
      columns: { versesCount: true },
      where: lt(quranSurahs.number, input.surahNumber),
    });
    const versesCompleted = precedingSurahs.reduce((sum, s) => sum + s.versesCount, 0) + input.verseNumber;

    const hijriYear = getHijriDate().year;
    const existing = await this.getKhatmProgress(userId);
    // Annee hijri differente de celle stockee = nouveau cycle : on repart de zero
    // plutot que de laisser une ancienne date de fin polluer le nouveau cycle.
    const isNewCycle = !existing || existing.hijriYear !== hijriYear;
    const completedAt = !isNewCycle && existing?.completedAt ? existing.completedAt : versesCompleted >= 6236 ? new Date() : null;

    const [row] = await this.db
      .insert(khatmProgress)
      .values({
        userId,
        hijriYear,
        lastSurahNumber: input.surahNumber,
        lastVerseNumber: input.verseNumber,
        versesCompleted,
        completedAt,
      })
      .onConflictDoUpdate({
        target: khatmProgress.userId,
        set: {
          hijriYear,
          lastSurahNumber: input.surahNumber,
          lastVerseNumber: input.verseNumber,
          versesCompleted,
          completedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async deleteKhatmProgress(userId: string) {
    await this.db.delete(khatmProgress).where(eq(khatmProgress.userId, userId));
    return { deleted: true };
  }
}
