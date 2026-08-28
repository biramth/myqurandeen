import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, quranSurahs, quranVerses, sources, tafsirEntries, tafsirSources } from "../schema";

/**
 * Import de tafsirs depuis le jeu de donnees ouvert spa5k/tafsir_api
 * (https://github.com/spa5k/tafsir_api), qui agrege des tafsirs largement
 * et librement diffuses par leurs editeurs (Complexe du Roi Fahd, Tafsir
 * Center for Quranic Studies rattache a l'universite King Saud, editions
 * Dar-us-Salam pour Ibn Kathir abrege). Aucun texte n'est genere : chaque
 * entree provient telle quelle de l'edition source, verset par verset.
 */

const CDN_BASE = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir";
const SURAH_COUNT = 114;

interface ApiTafsirAyah {
  surah: number;
  ayah: number;
  text: string;
}

interface TafsirEditionConfig {
  slug: string;
  workTitle: string;
  language: string;
  authorName: string;
  authorEra?: string;
  description: string;
}

const TAFSIR_EDITIONS: TafsirEditionConfig[] = [
  {
    slug: "ar-tafsir-muyassar",
    workTitle: "At-Tafsir al-Muyassar",
    language: "ar",
    authorName: "Comité de savants du Complexe du Roi Fahd",
    authorEra: "contemporain",
    description: "Tafsir concis et moderne rédigé par un comité de savants, publié par le Complexe du Roi Fahd pour l'impression du Noble Coran.",
  },
  {
    slug: "ar-tafsir-al-mukhtasar",
    workTitle: "Al-Mukhtasar fi at-Tafsir",
    language: "ar",
    authorName: "Tafsir Center for Quranic Studies",
    authorEra: "contemporain",
    description: "Explication abrégée du sens du Coran, produite par le Tafsir Center for Quranic Studies (rattaché a l'université King Saud).",
  },
  {
    slug: "en-tafsir-al-mukhtasar",
    workTitle: "Al-Mukhtasar fi at-Tafsir",
    language: "en",
    authorName: "Tafsir Center for Quranic Studies",
    authorEra: "contemporain",
    description: "English translation of the abridged explanation of the Quran, produced by the Tafsir Center for Quranic Studies.",
  },
  {
    slug: "french-mokhtasar",
    workTitle: "Al-Mukhtasar fi at-Tafsir",
    language: "fr",
    authorName: "Tafsir Center for Quranic Studies",
    authorEra: "contemporain",
    description: "Traduction française de l'explication abrégée du sens du Coran, produite par le Tafsir Center for Quranic Studies.",
  },
  {
    slug: "ar-tafsir-ibn-kathir",
    workTitle: "Tafsir Ibn Kathir",
    language: "ar",
    authorName: "Ibn Kathir",
    authorEra: "701-774 AH / 1300-1373",
    description: "Tafsir classique d'Isma'il ibn Kathir, l'un des commentaires du Coran les plus reconnus dans la tradition sunnite.",
  },
  {
    slug: "en-tafisr-ibn-kathir",
    workTitle: "Tafsir Ibn Kathir (abrégé)",
    language: "en",
    authorName: "Ibn Kathir",
    authorEra: "701-774 AH / 1300-1373",
    description: "Abridged English translation of the classical tafsir of Isma'il ibn Kathir.",
  },
];

async function fetchSurahTafsir(slug: string, surahNumber: number): Promise<ApiTafsirAyah[] | null> {
  const res = await fetch(`${CDN_BASE}/${slug}/${surahNumber}.json`);
  if (!res.ok) return null;
  return (await res.json()) as ApiTafsirAyah[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

async function importTafsirEdition(
  db: Database,
  config: TafsirEditionConfig,
  verseIdBySurahAndNumber: Map<string, string>,
  datasetSourceId: string | undefined,
) {
  console.log(`Import tafsir: telechargement ${config.slug}...`);

  const [author] = await db
    .insert(authors)
    .values({ name: config.authorName, era: config.authorEra })
    .onConflictDoNothing()
    .returning();
  const authorRow = author ?? (await db.query.authors.findFirst({ where: eq(authors.name, config.authorName) }));

  const tafsirTitle = `${config.workTitle} (${config.language})`;
  const [tafsirSource] = await db
    .insert(tafsirSources)
    .values({
      title: tafsirTitle,
      authorId: authorRow?.id,
      language: config.language,
      description: config.description,
      sourceId: datasetSourceId,
    })
    .onConflictDoNothing()
    .returning();
  const tafsirSourceRow =
    tafsirSource ?? (await db.query.tafsirSources.findFirst({ where: eq(tafsirSources.title, tafsirTitle) }));
  if (!tafsirSourceRow) return;

  let importedCount = 0;
  const surahNumbers = Array.from({ length: SURAH_COUNT }, (_, i) => i + 1);

  for (const batchNumbers of chunk(surahNumbers, 12)) {
    const results = await Promise.all(batchNumbers.map((n) => fetchSurahTafsir(config.slug, n)));

    const values = results
      .flatMap((ayahs) => ayahs ?? [])
      .map((ayah) => {
        const verseId = verseIdBySurahAndNumber.get(`${ayah.surah}:${ayah.ayah}`);
        if (!verseId || !ayah.text?.trim()) return null;
        return { tafsirSourceId: tafsirSourceRow.id, verseStartId: verseId, content: ayah.text };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (values.length > 0) {
      await db.insert(tafsirEntries).values(values);
      importedCount += values.length;
    }
  }

  console.log(`Import tafsir: ${config.slug} - ${importedCount} entrees.`);
}

export async function importTafsirs(db: Database): Promise<void> {
  const [datasetSource] = await db
    .insert(sources)
    .values({
      title: "spa5k/tafsir_api (jeu de données ouvert)",
      type: "website",
      url: "https://github.com/spa5k/tafsir_api",
      language: "en",
    })
    .onConflictDoNothing()
    .returning();
  const datasetSourceRow =
    datasetSource ??
    (await db.query.sources.findFirst({ where: eq(sources.title, "spa5k/tafsir_api (jeu de données ouvert)") }));

  // Repertoire verset par (numero_sourate:numero_verset) -> id, construit une seule fois.
  const surahs = await db.select({ id: quranSurahs.id, number: quranSurahs.number }).from(quranSurahs);
  const verses = await db
    .select({ id: quranVerses.id, surahId: quranVerses.surahId, numberInSurah: quranVerses.numberInSurah })
    .from(quranVerses);
  const surahNumberById = new Map(surahs.map((s) => [s.id, s.number]));
  const verseIdBySurahAndNumber = new Map<string, string>();
  for (const v of verses) {
    const surahNumber = surahNumberById.get(v.surahId);
    if (surahNumber) verseIdBySurahAndNumber.set(`${surahNumber}:${v.numberInSurah}`, v.id);
  }

  if (verseIdBySurahAndNumber.size === 0) {
    throw new Error("Aucun verset en base - lancez d'abord `npm run db:seed:quran`.");
  }

  // Idempotence : on ne re-importe pas une edition deja presente (evite les doublons de tafsir_entries).
  for (const config of TAFSIR_EDITIONS) {
    const tafsirTitle = `${config.workTitle} (${config.language})`;
    const existing = await db.query.tafsirSources.findFirst({ where: eq(tafsirSources.title, tafsirTitle) });
    if (existing) {
      const hasEntries = await db.query.tafsirEntries.findFirst({
        where: eq(tafsirEntries.tafsirSourceId, existing.id),
      });
      if (hasEntries) {
        console.log(`Import tafsir: ${config.slug} deja importe, ignore.`);
        continue;
      }
    }
    await importTafsirEdition(db, config, verseIdBySurahAndNumber, datasetSourceRow?.id);
  }

  console.log(`Import tafsir termine: ${TAFSIR_EDITIONS.length} editions.`);
}
