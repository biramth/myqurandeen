import { asc, eq, sql } from "drizzle-orm";
import type { Database } from "../database.module";
import { quranReciters, quranSurahs, quranVerseAudio, quranVerses } from "../schema";

/**
 * Import des URLs de recitation audio du Coran depuis l'open CDN Islamic
 * Network (Al Quran Cloud). Aucun fichier n'est heberge par le projet - on
 * enregistre uniquement les URLs CDN par verset/recitateur, ce qui evite
 * toute infra de stockage et tout cout de sortie pour un contenu qui ne
 * change pas.
 *
 * Format des URLs (documente sur https://alquran.cloud/cdn) :
 *   https://cdn.islamic.network/quran/audio/{bitrate}/{edition}/{ayahGlobal}.mp3
 * avec `ayahGlobal` = numero absolu du verset dans le Coran (1..6236),
 * calcule ici depuis la somme des versets des sourates precedentes.
 *
 * Le script est idempotent : les recitateurs sont en upsert par slug, les
 * paires (verset, recitateur) sont inserees avec onConflictDoNothing, donc
 * relancer le script ne duplique rien. Chaque edition de RECITERS a ete
 * verifiee manuellement (HTTP 200, content-type audio/mpeg).
 */

const CDN_BASE = "https://cdn.islamic.network/quran/audio";

interface ReciterConfig {
  slug: string;
  nameArabic: string;
  nameTransliterated: string;
  style: string;
  editionCode: string;
  bitrate: number;
  source: string;
  sourceUrl: string;
  license: string;
}

/** Recitateurs retenus : murattal populaires, bitrate le plus eleve verifie. */
const RECITERS: ReciterConfig[] = [
  {
    slug: "alafasy",
    nameArabic: "مشاري راشد العفاسي",
    nameTransliterated: "Mishary Rashid Alafasy",
    style: "murattal",
    editionCode: "ar.alafasy",
    bitrate: 128,
    source: "Al Quran Cloud (Islamic Network)",
    sourceUrl: "https://alquran.cloud/cdn",
    license: "Recitation diffusee librement via l'open CDN Islamic Network (alquran.cloud/cdn).",
  },
  {
    slug: "husary",
    nameArabic: "محمود خليل الحصري",
    nameTransliterated: "Mahmoud Khalil Al-Husary",
    style: "murattal",
    editionCode: "ar.husary",
    bitrate: 128,
    source: "Al Quran Cloud (Islamic Network)",
    sourceUrl: "https://alquran.cloud/cdn",
    license: "Recitation diffusee librement via l'open CDN Islamic Network (alquran.cloud/cdn).",
  },
  {
    slug: "minshawi",
    nameArabic: "محمد صديق المنشاوي",
    nameTransliterated: "Muhammad Siddiq Al-Minshawi",
    style: "murattal",
    editionCode: "ar.minshawi",
    bitrate: 128,
    source: "Al Quran Cloud (Islamic Network)",
    sourceUrl: "https://alquran.cloud/cdn",
    license: "Recitation diffusee librement via l'open CDN Islamic Network (alquran.cloud/cdn).",
  },
  {
    slug: "mahermuaiqly",
    nameArabic: "ماهر المعيقلي",
    nameTransliterated: "Maher Al Muaiqly",
    style: "murattal",
    editionCode: "ar.mahermuaiqly",
    bitrate: 128,
    source: "Al Quran Cloud (Islamic Network)",
    sourceUrl: "https://alquran.cloud/cdn",
    license: "Recitation diffusee librement via l'open CDN Islamic Network (alquran.cloud/cdn).",
  },
  {
    slug: "abdulbasitmurattal",
    nameArabic: "عبد الباسط عبد الصمد",
    nameTransliterated: "Abdul Basit Abdus-Samad",
    style: "murattal",
    editionCode: "ar.abdulbasitmurattal",
    bitrate: 64,
    source: "Al Quran Cloud (Islamic Network)",
    sourceUrl: "https://alquran.cloud/cdn",
    license: "Recitation diffusee librement via l'open CDN Islamic Network (alquran.cloud/cdn).",
  },
];

async function upsertReciters(db: Database): Promise<Map<string, string>> {
  const reciterIdBySlug = new Map<string, string>();
  for (const reciter of RECITERS) {
    const [row] = await db
      .insert(quranReciters)
      .values({
        slug: reciter.slug,
        nameArabic: reciter.nameArabic,
        nameTransliterated: reciter.nameTransliterated,
        style: reciter.style,
        editionCode: reciter.editionCode,
        bitrate: reciter.bitrate,
        source: reciter.source,
        sourceUrl: reciter.sourceUrl,
        license: reciter.license,
      })
      .onConflictDoUpdate({
        target: quranReciters.slug,
        set: {
          nameArabic: sql`excluded.name_arabic`,
          nameTransliterated: sql`excluded.name_transliterated`,
          style: sql`excluded.style`,
          editionCode: sql`excluded.edition_code`,
          bitrate: sql`excluded.bitrate`,
          source: sql`excluded.source`,
          sourceUrl: sql`excluded.source_url`,
          license: sql`excluded.license`,
        },
      })
      .returning();
    reciterIdBySlug.set(reciter.slug, row.id);
  }
  return reciterIdBySlug;
}

export async function importQuranAudio(db: Database): Promise<void> {
  const reciterIdBySlug = await upsertReciters(db);

  // Decalage en ayahs absolus par sourate (numero du premier verset de la
  // sourate dans le Coran entier).
  const surahs = await db
    .select({ number: quranSurahs.number, versesCount: quranSurahs.versesCount })
    .from(quranSurahs)
    .orderBy(asc(quranSurahs.number));
  const offsetByNumber = new Map<number, number>();
  let cumulative = 0;
  for (const surah of surahs) {
    offsetByNumber.set(surah.number, cumulative);
    cumulative += surah.versesCount;
  }

  const verses = await db
    .select({
      id: quranVerses.id,
      surahNumber: quranSurahs.number,
      numberInSurah: quranVerses.numberInSurah,
    })
    .from(quranVerses)
    .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId));

  for (const reciter of RECITERS) {
    const reciterId = reciterIdBySlug.get(reciter.slug);
    if (!reciterId) {
      throw new Error(`Recitateur introuvable apres upsert: ${reciter.slug}`);
    }

    const rows = verses.map((verse) => ({
      verseId: verse.id,
      reciterId,
      url: `${CDN_BASE}/${reciter.bitrate}/${reciter.editionCode}/${
        (offsetByNumber.get(verse.surahNumber) ?? 0) + verse.numberInSurah
      }.mp3`,
    }));

    let inserted = 0;
    const BATCH_SIZE = 2000;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      await db.insert(quranVerseAudio).values(chunk).onConflictDoNothing();
      inserted += chunk.length;
    }

    console.log(`Import audio: recitateur "${reciter.slug}" -> ${inserted} versets.`);
  }

  console.log(`Import audio termine: ${RECITERS.length} recitateurs, ${verses.length} versets.`);
}