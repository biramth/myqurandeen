import { eq, sql } from "drizzle-orm";
import type { Database } from "../database.module";
import {
  authors,
  hadithBooks,
  hadithCollections,
  hadithGrades,
  hadiths,
  hadithTranslations,
  sources,
  translations,
} from "../schema";

/**
 * Import des six collections canoniques (Kutub al-Sittah) depuis le jeu de
 * donnees ouvert fawazahmed0/hadith-api (MIT, https://github.com/fawazahmed0/hadith-api),
 * lui-meme derive de traductions anglaises largement diffusees librement
 * (texte de reference utilise par la plupart des applications et sites
 * islamiques ouverts, dont sunnah.com). Aucun texte ni classification n'est
 * invente : les degres d'authenticite sont importes tels que rapportes,
 * par verificateur nomme (Al-Albani, Ahmad Muhammad Shakir, etc.) - voir
 * `hadith_grades`. Pour Sahih al-Bukhari et Sahih Muslim, l'edition ne
 * fournit pas de grade par hadith car l'ensemble de ces deux recueils est
 * unanimement considere authentique (Sahih) par consensus des savants du
 * hadith - c'est indique dans la description de la collection, pas invente
 * hadith par hadith.
 */

const CDN_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

interface CollectionConfig {
  slug: string;
  name: string;
  nameArabic: string;
  compilerName: string;
  compilerEra: string;
  arabicEdition: string;
  englishEdition: string;
  /** Editions supplementaires disponibles pour ce recueil (langue -> identifiant). */
  extraEditions?: Record<string, string>;
  description: string;
}

const COLLECTIONS: CollectionConfig[] = [
  {
    slug: "bukhari",
    name: "Sahih al-Bukhari",
    nameArabic: "صحيح البخاري",
    compilerName: "Muhammad ibn Ismail al-Bukhari",
    compilerEra: "194-256 AH / 810-870",
    arabicEdition: "ara-bukhari",
    englishEdition: "eng-bukhari",
    extraEditions: { fr: "fra-bukhari" },
    description:
      "Recueil compilé par l'imam al-Bukhari, considéré par consensus des savants sunnites comme le recueil de hadiths le plus authentique après le Coran.",
  },
  {
    slug: "muslim",
    name: "Sahih Muslim",
    nameArabic: "صحيح مسلم",
    compilerName: "Muslim ibn al-Hajjaj",
    compilerEra: "206-261 AH / 821-875",
    arabicEdition: "ara-muslim",
    englishEdition: "eng-muslim",
    extraEditions: { fr: "fra-muslim" },
    description:
      "Recueil compilé par l'imam Muslim, second des deux Sahihain avec Sahih al-Bukhari, également reconnu comme authentique par consensus.",
  },
  {
    slug: "abudawud",
    name: "Sunan Abu Dawud",
    nameArabic: "سنن أبي داود",
    compilerName: "Abu Dawud al-Sijistani",
    compilerEra: "202-275 AH / 817-889",
    arabicEdition: "ara-abudawud",
    englishEdition: "eng-abudawud",
    extraEditions: { fr: "fra-abudawud" },
    description:
      "Un des quatre Sunan, centre sur les hadiths juridiques (ahkam). Contient des hadiths de degrés variés, précises hadith par hadith.",
  },
  {
    slug: "tirmidhi",
    name: "Jami at-Tirmidhi",
    nameArabic: "جامع الترمذي",
    compilerName: "Muhammad ibn Isa at-Tirmidhi",
    compilerEra: "209-279 AH / 824-892",
    arabicEdition: "ara-tirmidhi",
    englishEdition: "eng-tirmidhi",
    description:
      "Recueil connu pour indiquer systématiquement le degré d'authenticité de chaque hadith et les divergences entre savants du hadith.",
  },
  {
    slug: "nasai",
    name: "Sunan an-Nasa'i",
    nameArabic: "سنن النسائي",
    compilerName: "Ahmad ibn Shu'ayb an-Nasa'i",
    compilerEra: "215-303 AH / 829-915",
    arabicEdition: "ara-nasai",
    englishEdition: "eng-nasai",
    extraEditions: { fr: "fra-nasai" },
    description: "Un des quatre Sunan, reconnu pour la rigueur de sa sélection des chaînes de transmission.",
  },
  {
    slug: "ibnmajah",
    name: "Sunan Ibn Majah",
    nameArabic: "سنن ابن ماجه",
    compilerName: "Muhammad ibn Yazid Ibn Majah",
    compilerEra: "209-273 AH / 824-887",
    arabicEdition: "ara-ibnmajah",
    englishEdition: "eng-ibnmajah",
    extraEditions: { fr: "fra-ibnmajah" },
    description: "Le sixième recueil retenu dans les Kutub al-Sittah, complémentaire aux cinq précédents.",
  },
];

interface ApiHadithItem {
  hadithnumber: number | string;
  text: string;
  grades: { name: string; grade: string }[];
  reference: { book: number; hadith: number | string };
}

interface ApiEditionResponse {
  metadata: {
    sections: Record<string, string>;
  };
  hadiths: ApiHadithItem[];
}

async function fetchEdition(identifier: string): Promise<ApiEditionResponse> {
  const res = await fetch(`${CDN_BASE}/${identifier}.min.json`);
  if (!res.ok) {
    throw new Error(`Echec du telechargement de l'edition ${identifier}: HTTP ${res.status}`);
  }
  return (await res.json()) as ApiEditionResponse;
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

async function importCollection(db: Database, config: CollectionConfig, datasetSourceId: string | undefined) {
  console.log(`Import hadith: telechargement ${config.arabicEdition} / ${config.englishEdition}...`);
  const [arabicEdition, englishEdition] = await Promise.all([
    fetchEdition(config.arabicEdition),
    fetchEdition(config.englishEdition),
  ]);

  const [compiler] = await db
    .insert(authors)
    .values({ name: config.compilerName, era: config.compilerEra })
    .onConflictDoNothing()
    .returning();
  const compilerRow =
    compiler ?? (await db.query.authors.findFirst({ where: eq(authors.name, config.compilerName) }));

  const [collection] = await db
    .insert(hadithCollections)
    .values({
      slug: config.slug,
      name: config.name,
      nameArabic: config.nameArabic,
      compilerAuthorId: compilerRow?.id,
      description: config.description,
      sourceId: datasetSourceId,
    })
    .onConflictDoUpdate({
      target: hadithCollections.slug,
      set: { description: sql`excluded.description` },
    })
    .returning();

  // Livres/chapitres (sections), a l'exclusion de la section "0" (vide, artefact du format source).
  const bookNumberById = new Map<number, string>();
  const sectionEntries = Object.entries(englishEdition.metadata.sections).filter(
    ([num, title]) => num !== "0" && title.trim().length > 0,
  );
  for (const [num, title] of sectionEntries) {
    const [book] = await db
      .insert(hadithBooks)
      .values({ collectionId: collection.id, number: Number(num), title })
      .onConflictDoUpdate({
        target: [hadithBooks.collectionId, hadithBooks.number],
        set: { title: sql`excluded.title` },
      })
      .returning();
    bookNumberById.set(Number(num), book.id);
  }

  const arabicByNumber = new Map(arabicEdition.hadiths.map((h) => [String(h.hadithnumber), h.text]));

  const rows = englishEdition.hadiths
    .map((h) => {
      const hadithBookId = bookNumberById.get(h.reference.book);
      if (!hadithBookId) return null;
      const grades = h.grades ?? [];
      const distinctGrades = new Set(grades.map((g) => g.grade));
      return {
        collectionId: collection.id,
        hadithBookId,
        number: String(h.reference.hadith),
        numberInCollection: String(h.hadithnumber),
        sortOrder: typeof h.hadithnumber === "number" ? h.hadithnumber : parseFloat(h.hadithnumber),
        textArabic: arabicByNumber.get(String(h.hadithnumber)) ?? null,
        textTranslation: h.text,
        authenticityGrade: distinctGrades.size === 1 ? [...distinctGrades][0] : null,
        sourceId: datasetSourceId,
        _grades: grades,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  let insertedCount = 0;
  const hadithIdByNumber = new Map<string, string>();
  for (const batch of chunk(rows, 500)) {
    const inserted = await db
      .insert(hadiths)
      .values(batch.map(({ _grades, ...rest }) => rest))
      .onConflictDoUpdate({
        target: [hadiths.collectionId, hadiths.numberInCollection],
        set: {
          textArabic: sql`excluded.text_arabic`,
          textTranslation: sql`excluded.text_translation`,
          authenticityGrade: sql`excluded.authenticity_grade`,
          sortOrder: sql`excluded.sort_order`,
        },
      })
      .returning({ id: hadiths.id, numberInCollection: hadiths.numberInCollection });

    const gradeValues: { hadithId: string; graderName: string; grade: string }[] = [];
    const insertedByNumber = new Map(inserted.map((r) => [r.numberInCollection, r.id]));
    for (const [num, hid] of insertedByNumber) {
      hadithIdByNumber.set(num, hid);
    }
    for (const row of batch) {
      const hadithId = insertedByNumber.get(row.numberInCollection);
      if (!hadithId) continue;
      for (const g of row._grades) {
        gradeValues.push({ hadithId, graderName: g.name, grade: g.grade });
      }
    }

    for (const gradeBatch of chunk(gradeValues, 500)) {
      if (gradeBatch.length === 0) continue;
      await db
        .insert(hadithGrades)
        .values(gradeBatch)
        .onConflictDoUpdate({
          target: [hadithGrades.hadithId, hadithGrades.graderName],
          set: { grade: sql`excluded.grade` },
        });
    }

    insertedCount += inserted.length;
  }

  console.log(`Import hadith: ${config.slug} - ${insertedCount} hadiths (${sectionEntries.length} chapitres).`);

  for (const [language, editionIdentifier] of Object.entries(config.extraEditions ?? {})) {
    await importHadithTranslation(db, config, language, editionIdentifier, hadithIdByNumber, datasetSourceId);
  }
}

async function importHadithTranslation(
  db: Database,
  config: CollectionConfig,
  language: string,
  editionIdentifier: string,
  hadithIdByNumber: Map<string, string>,
  datasetSourceId: string | undefined,
) {
  console.log(`Import hadith: telechargement ${editionIdentifier} (${language})...`);
  const edition = await fetchEdition(editionIdentifier);

  const editionName = `${config.name} (${language})`;
  const [translation] = await db
    .insert(translations)
    .values({ name: editionName, language, sourceId: datasetSourceId })
    .onConflictDoNothing()
    .returning();
  const translationRow =
    translation ?? (await db.query.translations.findFirst({ where: eq(translations.name, editionName) }));
  if (!translationRow) return;

  const values = edition.hadiths
    .map((h) => {
      const hadithId = hadithIdByNumber.get(String(h.hadithnumber));
      if (!hadithId) return null;
      return { hadithId, translationId: translationRow.id, text: h.text };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  let count = 0;
  for (const batch of chunk(values, 500)) {
    await db
      .insert(hadithTranslations)
      .values(batch)
      .onConflictDoUpdate({
        target: [hadithTranslations.hadithId, hadithTranslations.translationId],
        set: { text: sql`excluded.text` },
      });
    count += batch.length;
  }

  console.log(`Import hadith: ${config.slug} (${language}) - ${count} traductions associees.`);
}

export async function importHadiths(db: Database): Promise<void> {
  const [datasetSource] = await db
    .insert(sources)
    .values({
      title: "fawazahmed0/hadith-api (jeu de données ouvert, MIT)",
      type: "website",
      url: "https://github.com/fawazahmed0/hadith-api",
      language: "en",
    })
    .onConflictDoNothing()
    .returning();
  const datasetSourceRow =
    datasetSource ??
    (await db.query.sources.findFirst({
      where: eq(sources.title, "fawazahmed0/hadith-api (jeu de données ouvert, MIT)"),
    }));

  for (const config of COLLECTIONS) {
    await importCollection(db, config, datasetSourceRow?.id);
  }

  console.log(`Import hadith termine: ${COLLECTIONS.length} collections.`);
}
