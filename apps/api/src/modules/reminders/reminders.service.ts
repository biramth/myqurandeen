import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  duaCategories,
  duas,
  prayerAlertSettings,
  quranSurahs,
  readingRotationSettings,
  reminders,
  streakAlertSettings,
} from "../../database/schema";
import type { PrayerCalculationMethodKey, PrayerName } from "./prayer-times";
import type { ReminderTargetType } from "@qurandeen/shared";

interface ResolvedTarget {
  label: string;
  href: string;
  surahNumber: number | null;
}

@Injectable()
export class RemindersService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /**
   * Determine le libelle/lien affiches dans la notification a partir de la
   * cible - jamais fournis tels quels par le client, pour rester coherents
   * avec le contenu reel (et eviter qu'un href arbitraire soit stocke).
   */
  private async resolveTarget(
    targetType: ReminderTargetType,
    targetId: string | undefined,
    surahNumber: number | undefined,
  ): Promise<ResolvedTarget> {
    if (targetType === "surah") {
      if (!surahNumber) throw new BadRequestException("surahNumber est requis pour targetType=surah");
      const [surah] = await this.db
        .select({ number: quranSurahs.number, name: quranSurahs.nameTransliterated })
        .from(quranSurahs)
        .where(eq(quranSurahs.number, surahNumber))
        .limit(1);
      if (!surah) throw new NotFoundException("Sourate introuvable");
      return { label: surah.name, href: `/quran/${surah.number}`, surahNumber: surah.number };
    }

    if (!targetId) throw new BadRequestException("targetId est requis pour ce type de rappel");

    if (targetType === "dua") {
      const [row] = await this.db
        .select({ title: duas.title, categorySlug: duaCategories.slug })
        .from(duas)
        .innerJoin(duaCategories, eq(duaCategories.id, duas.categoryId))
        .where(eq(duas.id, targetId))
        .limit(1);
      if (!row) throw new NotFoundException("Dua introuvable");
      return { label: row.title, href: `/duas/${row.categorySlug}`, surahNumber: null };
    }

    // dua_category
    const [category] = await this.db
      .select({ name: duaCategories.name, slug: duaCategories.slug })
      .from(duaCategories)
      .where(eq(duaCategories.id, targetId))
      .limit(1);
    if (!category) throw new NotFoundException("Categorie de dua introuvable");
    return { label: category.name, href: `/duas/${category.slug}`, surahNumber: null };
  }

  async list(userId: string) {
    return this.db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(reminders.timeOfDay);
  }

  async create(
    userId: string,
    input: {
      targetType: ReminderTargetType;
      targetId?: string;
      surahNumber?: number;
      timeOfDay: string;
      daysOfWeek: number[];
      timezone: string;
    },
  ) {
    const target = await this.resolveTarget(input.targetType, input.targetId, input.surahNumber);
    const [row] = await this.db
      .insert(reminders)
      .values({
        userId,
        targetType: input.targetType,
        targetId: input.targetType === "surah" ? null : (input.targetId ?? null),
        surahNumber: target.surahNumber,
        label: target.label,
        href: target.href,
        timeOfDay: input.timeOfDay,
        daysOfWeek: input.daysOfWeek,
        timezone: input.timezone,
      })
      .returning();
    return row;
  }

  async update(
    userId: string,
    id: string,
    input: { timeOfDay?: string; daysOfWeek?: number[]; timezone?: string; isActive?: boolean },
  ) {
    const [row] = await this.db
      .update(reminders)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    if (!row) throw new NotFoundException("Rappel introuvable");
    return row;
  }

  async remove(userId: string, id: string) {
    const [row] = await this.db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning({ id: reminders.id });
    if (!row) throw new NotFoundException("Rappel introuvable");
    return { deleted: true };
  }

  // --- Rotation automatique de lecture ---

  async getRotationSettings(userId: string) {
    const [row] = await this.db
      .select()
      .from(readingRotationSettings)
      .where(eq(readingRotationSettings.userId, userId))
      .limit(1);
    return row ?? null;
  }

  async upsertRotationSettings(
    userId: string,
    input: { timeOfDay: string; daysOfWeek: number[]; timezone: string; isActive: boolean },
  ) {
    const [row] = await this.db
      .insert(readingRotationSettings)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: readingRotationSettings.userId,
        set: { ...input, updatedAt: new Date() },
      })
      .returning();
    return row;
  }

  async deleteRotationSettings(userId: string) {
    await this.db.delete(readingRotationSettings).where(eq(readingRotationSettings.userId, userId));
    return { deleted: true };
  }

  // --- Alerte "garde ta serie" ---

  async getStreakAlertSettings(userId: string) {
    const [row] = await this.db
      .select()
      .from(streakAlertSettings)
      .where(eq(streakAlertSettings.userId, userId))
      .limit(1);
    return row ?? null;
  }

  async upsertStreakAlertSettings(
    userId: string,
    input: { timeOfDay: string; timezone: string; isActive: boolean },
  ) {
    const [row] = await this.db
      .insert(streakAlertSettings)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: streakAlertSettings.userId,
        set: { ...input, updatedAt: new Date() },
      })
      .returning();
    return row;
  }

  async deleteStreakAlertSettings(userId: string) {
    await this.db.delete(streakAlertSettings).where(eq(streakAlertSettings.userId, userId));
    return { deleted: true };
  }

  // --- Notifications aux heures de priere ---

  async getPrayerAlertSettings(userId: string) {
    const [row] = await this.db
      .select()
      .from(prayerAlertSettings)
      .where(eq(prayerAlertSettings.userId, userId))
      .limit(1);
    return row ?? null;
  }

  async upsertPrayerAlertSettings(
    userId: string,
    input: {
      latitude: number;
      longitude: number;
      timezone: string;
      calculationMethod: PrayerCalculationMethodKey;
      enabledPrayers: PrayerName[];
      isActive: boolean;
    },
  ) {
    const [row] = await this.db
      .insert(prayerAlertSettings)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: prayerAlertSettings.userId,
        set: { ...input, updatedAt: new Date() },
      })
      .returning();
    return row;
  }

  async deletePrayerAlertSettings(userId: string) {
    await this.db.delete(prayerAlertSettings).where(eq(prayerAlertSettings.userId, userId));
    return { deleted: true };
  }
}
