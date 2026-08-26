import { eq, sql } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, quranSurahs, quranVerses, sources, translations, verseTranslations } from "../schema";

/**
 * Import du texte coranique et de plusieurs traductions depuis des sources
 * ouvertes et verifiables. Aucun texte n'est genere ou approxime par ce
 * script - voir CONTRIBUTING.md (principe des sources verifiables).
 *
 * - Texte arabe (rasm Uthmani) : Tanzil Project (https://tanzil.net), dont
 *   les conditions autorisent la redistribution du texte non modifie avec
 *   attribution. Recupere ici via l'API Al Quran Cloud qui sert ce meme
 *   corpus (https://alquran.cloud).
 * - Traductions : editions largement et librement diffusees depuis des
 *   decennies par leurs detenteurs de droits (complexes du Roi Fahd pour
 *   Hamidullah/Bubenheim, autorites religieuses officielles pour
 *   Diyanet/Kemenag, etc.) ou explicitement dans le domaine public
 *   (Pickthall, 1930). Chaque edition est tracee jusqu'a son traducteur
 *   via les tables `authors`/`sources`. Si une traduction s'avere
 *   problematique au niveau des droits, retirez-la de `TRANSLATION_EDITIONS`
 *   ci-dessous et relancez ce script (upsert, aucune perte de donnees pour
 *   les autres editions).
 */

const API_BASE = "https://api.alquran.cloud/v1";

interface ApiAyah {
  number: number;
  numberInSurah: number;
  text: string;
}

interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  ayahs: ApiAyah[];
}

interface ApiQuranResponse {
  data: { surahs: ApiSurah[] };
}

interface TranslationEditionConfig {
  identifier: string;
  language: string;
  editionLabel: string;
  translatorName: string;
  translatorEra?: string;
  sourceTitle: string;
  sourceUrl: string;
}

/** Editions dont la diffusion libre est etablie de longue date. Voir note ci-dessus. */
const TRANSLATION_EDITIONS: TranslationEditionConfig[] = [
  {
    identifier: "en.pickthall",
    language: "en",
    editionLabel: "Pickthall (1930, domaine public)",
    translatorName: "Mohammed Marmaduke Pickthall",
    translatorEra: "1875-1936",
    sourceTitle: "The Meaning of the Glorious Qur'an (1930, domaine public)",
    sourceUrl: "https://alquran.cloud",
  },
  {
    identifier: "fr.hamidullah",
    language: "fr",
    editionLabel: "Hamidullah (Complexe du Roi Fahd)",
    translatorName: "Muhammad Hamidullah",
    translatorEra: "1908-2002",
    sourceTitle: "Le Saint Coran - traduction Hamidullah, diffusion Complexe du Roi Fahd",
    sourceUrl: "https://alquran.cloud",
  },
  {
    identifier: "es.cortes",
    language: "es",
    editionLabel: "Julio Cortes",
    translatorName: "Julio Cortes",
    sourceTitle: "El Coran - traduccion Julio Cortes",
    sourceUrl: "https://alquran.cloud",
  },
  {
    identifier: "de.bubenheim",
    language: "de",
    editionLabel: "Bubenheim & Elyas (Komplex des Königs Fahd)",
    translatorName: "A. S. F. Bubenheim und N. Elyas",
    sourceTitle: "Der edle Qur'an - Übersetzung Bubenheim & Elyas",
    sourceUrl: "https://alquran.cloud",
  },
  {
    identifier: "tr.diyanet",
    language: "tr",
    editionLabel: "Diyanet Isleri (traduction officielle)",
    translatorName: "Diyanet Isleri Baskanligi",
    sourceTitle: "Kur'an-i Kerim Meali - Diyanet Isleri Baskanligi",
    sourceUrl: "https://alquran.cloud",
  },
  {
    identifier: "ur.jalandhry",
    language: "ur",
    editionLabel: "Fateh Muhammad Jalandhry",
    translatorName: "Fateh Muhammad Jalandhry",
    sourceTitle: "Quran Urdu Translation - Jalandhry",
    sourceUrl: "https://alquran.cloud",
  },
  {
    identifier: "id.indonesian",
    language: "id",
    editionLabel: "Kementerian Agama RI (traduction officielle)",
    translatorName: "Kementerian Agama Republik Indonesia",
    sourceTitle: "Al-Qur'an dan Terjemahnya - Kementerian Agama RI",
    sourceUrl: "https://alquran.cloud",
  },
  {
    identifier: "ru.kuliev",
    language: "ru",
    editionLabel: "Elmir Kuliev",
    translatorName: "Elmir Kuliev",
    sourceTitle: "Perevod smyslov Korana - Elmir Kuliev",
    sourceUrl: "https://alquran.cloud",
  },
];

async function fetchEdition(identifier: string): Promise<ApiSurah[]> {
  const res = await fetch(`${API_BASE}/quran/${identifier}`);
  if (!res.ok) {
    throw new Error(`Echec du telechargement de l'edition ${identifier}: HTTP ${res.status}`);
  }
  const json = (await res.json()) as ApiQuranResponse;
  return json.data.surahs;
}

async function upsertTranslationEdition(
  db: Database,
  config: TranslationEditionConfig,
  arabicSurahs: ApiSurah[],
  surahIdByNumber: Map<number, string>,
  verseIdByKey: Map<string, string>,
): Promise<number> {
  console.log(`Import Coran: telechargement de la traduction ${config.identifier}...`);
  const editionSurahs = await fetchEdition(config.identifier);

  const [author] = await db
    .insert(authors)
    .values({ name: config.translatorName, era: config.translatorEra })
    .onConflictDoNothing()
    .returning();
  const authorRow = author ?? (await db.query.authors.findFirst({ where: eq(authors.name, config.translatorName) }));

  const [source] = await db
    .insert(sources)
    .values({
      title: config.sourceTitle,
      type: "website",
      authorId: authorRow?.id,
      url: config.sourceUrl,
      language: config.language,
    })
    .onConflictDoNothing()
    .returning();
  const sourceRow = source ?? (await db.query.sources.findFirst({ where: eq(sources.title, config.sourceTitle) }));

  const [translation] = await db
    .insert(translations)
    .values({
      name: config.editionLabel,
      language: config.language,
      translatorAuthorId: authorRow?.id,
      sourceId: sourceRow?.id,
    })
    .onConflictDoNothing()
    .returning();
  const translationRow =
    translation ?? (await db.query.translations.findFirst({ where: eq(translations.name, config.editionLabel) }));

  if (!translationRow) {
    throw new Error(`Impossible de creer/retrouver l'edition de traduction ${config.identifier}`);
  }

  let count = 0;
  for (const surah of arabicSurahs) {
    const surahId = surahIdByNumber.get(surah.number);
    const editionSurah = editionSurahs.find((s) => s.number === surah.number);
    if (!surahId || !editionSurah) continue;

    const values = editionSurah.ayahs
      .map((ayah) => {
        const verseId = verseIdByKey.get(`${surahId}:${ayah.numberInSurah}`);
        if (!verseId) return null;
        return { verseId, translationId: translationRow.id, text: ayah.text };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (values.length > 0) {
      await db
        .insert(verseTranslations)
        .values(values)
        .onConflictDoUpdate({
          target: [verseTranslations.verseId, verseTranslations.translationId],
          set: { text: sql`excluded.text` },
        });
      count += values.length;
    }
  }

  console.log(`Import Coran: traduction ${config.identifier} associee a ${count} versets.`);
  return count;
}

export async function importQuran(db: Database): Promise<void> {
  console.log("Import Coran: telechargement du texte arabe (Tanzil / quran-uthmani)...");
  const arabicSurahs = await fetchEdition("quran-uthmani");

  const [tanzilSource] = await db
    .insert(sources)
    .values({
      title: "Tanzil Project - Texte coranique (rasm Uthmani)",
      type: "website",
      url: "https://tanzil.net",
      language: "ar",
    })
    .onConflictDoNothing()
    .returning();
  const tanzilSourceRow =
    tanzilSource ??
    (await db.query.sources.findFirst({ where: eq(sources.title, "Tanzil Project - Texte coranique (rasm Uthmani)") }));

  const surahIdByNumber = new Map<number, string>();
  const verseIdByKey = new Map<string, string>();
  let importedVerses = 0;

  for (const surah of arabicSurahs) {
    const revelationPlace = surah.revelationType === "Meccan" ? "mecca" : "medina";

    const [surahRow] = await db
      .insert(quranSurahs)
      .values({
        number: surah.number,
        nameArabic: surah.name,
        nameTransliterated: surah.englishName,
        nameTranslated: surah.englishNameTranslation,
        versesCount: surah.ayahs.length,
        revelationPlace,
      })
      .onConflictDoUpdate({
        target: quranSurahs.number,
        set: {
          nameArabic: sql`excluded.name_arabic`,
          nameTransliterated: sql`excluded.name_transliterated`,
          nameTranslated: sql`excluded.name_translated`,
          versesCount: sql`excluded.verses_count`,
          revelationPlace: sql`excluded.revelation_place`,
        },
      })
      .returning();

    surahIdByNumber.set(surah.number, surahRow.id);

    const verseRows = await db
      .insert(quranVerses)
      .values(
        surah.ayahs.map((ayah) => ({
          surahId: surahRow.id,
          numberInSurah: ayah.numberInSurah,
          textArabic: ayah.text,
        })),
      )
      .onConflictDoUpdate({
        target: [quranVerses.surahId, quranVerses.numberInSurah],
        set: { textArabic: sql`excluded.text_arabic` },
      })
      .returning();

    for (const verse of verseRows) {
      verseIdByKey.set(`${surahRow.id}:${verse.numberInSurah}`, verse.id);
    }

    importedVerses += verseRows.length;
  }

  console.log(
    `Import Coran: ${arabicSurahs.length} sourates, ${importedVerses} versets. Source: Tanzil (${tanzilSourceRow?.url ?? "https://tanzil.net"}).`,
  );

  for (const editionConfig of TRANSLATION_EDITIONS) {
    await upsertTranslationEdition(db, editionConfig, arabicSurahs, surahIdByNumber, verseIdByKey);
  }

  console.log(`Import Coran termine: ${TRANSLATION_EDITIONS.length} traductions importees.`);
}
