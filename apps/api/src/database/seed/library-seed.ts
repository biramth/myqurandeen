import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, bookCategories, bookCategoryLinks, books } from "../schema";

/**
 * Catalogue d'ouvrages de référence : œuvres classiques reelles, de domaine
 * public (compilees il y a plusieurs siècles), decrites factuellement sans
 * prendre parti théologique ou juridique. Aucun lien externe invente : le
 * champ externalUrl reste vide tant qu'une URL stable n'a pas été vérifiée.
 */

interface BookSeed {
  title: string;
  authorName: string;
  authorEra: string;
  description: string;
  language: string;
  era: string;
  categories: string[];
}

const BOOKS: BookSeed[] = [
  {
    title: "Sahih al-Bukhari",
    authorName: "Al-Bukhari",
    authorEra: "194-256 AH / 810-870",
    description:
      "Recueil de hadiths compilé par Muhammad ibn Ismail al-Bukhari, considère par consensus sunnite comme le recueil le plus authentique après le Coran. Il aurait examine des centaines de milliers de hadiths avant de retenir environ 7 275 traditions (avec repetitions) repondant à ses criteres rigoureux d'authenticité.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Sahih Muslim",
    authorName: "Muslim ibn al-Hajjaj",
    authorEra: "206-261 AH / 821-875",
    description:
      "Second des deux recueils de hadiths les plus authentiques (avec Sahih al-Bukhari) selon le consensus sunnite. Muslim ibn al-Hajjaj est reconnu pour la rigueur de sa méthode de classement des chaines de transmission et pour avoir regroupe les differentes versions d'un même hadith sous une seule entree.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Sunan Abu Dawud",
    authorName: "Abu Dawud",
    authorEra: "202-275 AH / 817-889",
    description:
      "L'un des quatre Sunan, particulièrement centre sur les hadiths a portée juridique (ahkam). Abu Dawud y précise souvent, lorsqu'il le juge nécessaire, le degré de fiabilite des hadiths qu'il rapporte.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Jami at-Tirmidhi",
    authorName: "At-Tirmidhi",
    authorEra: "209-279 AH / 824-892",
    description:
      "Recueil reconnu pour avoir systématiquement indique le degré d'authenticité de chaque hadith et signale les divergences d'interprétation entre savants sur un même texte, ce qui en fait une référence privilegiee pour l'étude comparee du fiqh.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Sunan an-Nasa'i",
    authorName: "An-Nasa'i",
    authorEra: "215-303 AH / 829-915",
    description:
      "L'un des quatre Sunan, connu pour la rigueur particulière apportee à l'examen des chaines de transmission et pour un taux relativement faible de hadiths faibles compare a d'autres recueils de la même période.",
    language: "ar",
    era: "IIIe-IVe siècle AH / IXe-Xe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Sunan Ibn Majah",
    authorName: "Ibn Majah",
    authorEra: "209-273 AH / 824-887",
    description:
      "Sixième recueil retenu dans les Kutub as-Sittah (les six livres canoniques de hadiths sunnites), organise par chapitres thematiques couvrant le culte comme les relations sociales.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Al-Muwatta",
    authorName: "Malik ibn Anas",
    authorEra: "93-179 AH / 711-795",
    description:
      "L'un des plus anciens recueils organisant hadiths et positions juridiques par thèmes, redige par l'imam Malik, fondateur de l'école malikite. Il accorde une place importante à la pratique vivante des habitants de Médine comme témoignage de la Sunna.",
    language: "ar",
    era: "IIe siècle AH / VIIIe siècle",
    categories: ["Hadith", "Fiqh"],
  },
  {
    title: "Riyad as-Salihin",
    authorName: "An-Nawawi",
    authorEra: "631-676 AH / 1233-1277",
    description:
      "Compilation thematique de hadiths centree sur l'éthique, la spiritualite et le comportement quotidien, organisée par l'imam An-Nawawi en chapitres consacres a des vertus spécifiques (sincérité, patience, misericorde...).",
    language: "ar",
    era: "VIIe siècle AH / XIIIe siècle",
    categories: ["Hadith", "Spiritualité"],
  },
  {
    title: "Al-Arba'un an-Nawawiyya",
    authorName: "An-Nawawi",
    authorEra: "631-676 AH / 1233-1277",
    description:
      "Recueil de quarante-deux hadiths fondamentaux selectionnes par l'imam An-Nawawi pour leur portée synthetique sur les fondements de la pratique et de l'éthique islamiques, largement utilisé comme premier support d'enseignement du hadith.",
    language: "ar",
    era: "VIIe siècle AH / XIIIe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Tafsir al-Qur'an al-'Azim (Tafsir Ibn Kathir)",
    authorName: "Ibn Kathir",
    authorEra: "701-774 AH / 1300-1373",
    description:
      "Commentaire du Coran particulièrement estime pour son usage systématique du Coran et de la Sunna comme première source d'explication, dans la tradition du tafsir bi'l-ma'thur.",
    language: "ar",
    era: "VIIIe siècle AH / XIVe siècle",
    categories: ["Tafsir"],
  },
  {
    title: "Jami al-Bayan (Tafsir at-Tabari)",
    authorName: "At-Tabari",
    authorEra: "224-310 AH / 839-923",
    description:
      "L'un des plus anciens et des plus vastes commentaires complets du Coran, rassemblant un très grand nombre de transmissions exégétiques anterieures à son auteur.",
    language: "ar",
    era: "IIIe-IVe siècle AH / IXe-Xe siècle",
    categories: ["Tafsir"],
  },
  {
    title: "Ar-Risala",
    authorName: "Ash-Shafi'i",
    authorEra: "150-204 AH / 767-820",
    description:
      "Premier ouvrage systématique de méthodologie juridique islamique (usul al-fiqh), redige par l'imam Ash-Shafi'i. Il y hierarchise les sources du droit (Coran, Sunna, consensus, analogie) et pose des bases méthodologiques reprises par l'ensemble des écoles ulterieures.",
    language: "ar",
    era: "IIe-IIIe siècle AH / VIIIe-IXe siècle",
    categories: ["Usul al-fiqh"],
  },
  {
    title: "Al-Muwafaqat",
    authorName: "Ash-Shatibi",
    authorEra: "m. 790 AH / 1388",
    description:
      "Ouvrage majeur de méthodologie juridique centre sur les finalites superieures du droit islamique (maqasid ash-shari'a), influent dans les approches contemporaines du fiqh attentives à l'esprit des textes autant qu'à leur lettre.",
    language: "ar",
    era: "VIIIe siècle AH / XIVe siècle",
    categories: ["Usul al-fiqh"],
  },
  {
    title: "Al-Fiqh ala al-Madhahib al-Arba'a",
    authorName: "Abd ar-Rahman al-Jaziri",
    authorEra: "1300-1360 AH / 1882-1941",
    description:
      "Ouvrage de référence moderne comparant systématiquement les positions des quatre écoles juridiques sunnites (hanafite, malikite, shafi'ite, hanbalite) sur l'ensemble des questions de fiqh, utilisé comme source pour le comparateur de cette plateforme.",
    language: "ar",
    era: "XXe siècle",
    categories: ["Fiqh comparé"],
  },
  {
    title: "Al-Bidaya wan-Nihaya",
    authorName: "Ibn Kathir",
    authorEra: "701-774 AH / 1300-1373",
    description:
      "Ouvrage historique retracant l'histoire depuis la création jusqu'à l'époque de l'auteur, couvrant notamment en détail la vie du Prophète ﷺ et les premiers siècles de l'histoire islamique.",
    language: "ar",
    era: "VIIIe siècle AH / XIVe siècle",
    categories: ["Histoire"],
  },
  {
    title: "Tarikh al-Rusul wal-Muluk",
    authorName: "At-Tabari",
    authorEra: "224-310 AH / 839-923",
    description:
      "Histoire universelle depuis la création jusqu'à l'époque de l'auteur, l'une des sources historiques les plus anciennes et les plus completes pour l'étude des premiers siècles de l'Islam.",
    language: "ar",
    era: "IIIe-IVe siècle AH / IXe-Xe siècle",
    categories: ["Histoire"],
  },
  {
    title: "As-Sira an-Nabawiyya",
    authorName: "Ibn Hisham",
    authorEra: "m. 218 AH / 833",
    description:
      "Biographie du Prophète ﷺ fondée sur la recension par Ibn Hisham de la sira, plus ancienne biographie prophétique, initialement redigee par Ibn Ishaq. C'est l'une des sources classiques les plus utilisées pour l'étude de la vie du Prophète ﷺ.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Sira", "Histoire"],
  },
  {
    title: "Qisas al-Anbiya",
    authorName: "Ibn Kathir",
    authorEra: "701-774 AH / 1300-1373",
    description:
      "Recueil des recits des prophètes anterieurs a Muhammad ﷺ tels que rapportes par le Coran et la tradition islamique, source de référence pour la section Prophètes de cette plateforme.",
    language: "ar",
    era: "VIIIe siècle AH / XIVe siècle",
    categories: ["Sira"],
  },
  {
    title: "Ihya Ulum ad-Din",
    authorName: "Al-Ghazali",
    authorEra: "450-505 AH / 1058-1111",
    description:
      "Œuvre majeure de synthese entre droit, théologie et spiritualite, structurée en quatre parties (culte, usages sociaux, vices de l'ame, vertus salvatrices), l'un des ouvrages les plus lus de la litterature spirituelle islamique classique.",
    language: "ar",
    era: "Ve-VIe siècle AH / XIe-XIIe siècle",
    categories: ["Spiritualité"],
  },
  {
    title: "Al-Aqida at-Tahawiyya",
    authorName: "At-Tahawi",
    authorEra: "239-321 AH / 853-933",
    description:
      "Expose concis des croyances fondamentales de l'Islam, redige par Abu Ja'far at-Tahawi pour présenter, selon ses propres termes, la croyance des savants de la voie sunnite ; largement étudié et commente à travers les siècles dans differents courants du sunnisme.",
    language: "ar",
    era: "IIIe-IVe siècle AH / IXe-Xe siècle",
    categories: ["Aqida"],
  },
  {
    title: "Nukhbat al-Fikar",
    authorName: "Ibn Hajar al-Asqalani",
    authorEra: "773-852 AH / 1372-1449",
    description:
      "Traité concis de terminologie du hadith (mustalah al-hadith), servant de référence classique pour la classification des hadiths (sahih, hasan, da'if...) et la compréhension des chaines de transmission.",
    language: "ar",
    era: "VIIIe-IXe siècle AH / XIVe-XVe siècle",
    categories: ["Sciences du hadith"],
  },
  {
    title: "Fath al-Bari",
    authorName: "Ibn Hajar al-Asqalani",
    authorEra: "773-852 AH / 1372-1449",
    description:
      "Commentaire de référence sur Sahih al-Bukhari, considère comme l'un des commentaires les plus complets et les plus rigoureux jamais rediges sur ce recueil de hadiths.",
    language: "ar",
    era: "VIIIe-IXe siècle AH / XIVe-XVe siècle",
    categories: ["Sciences du hadith", "Hadith"],
  },
  {
    title: "Lisan al-Arab",
    authorName: "Ibn Manzur",
    authorEra: "630-711 AH / 1233-1312",
    description:
      "L'un des dictionnaires de langue arabe classique les plus complets, rassemblant les usages et significations attestes du vocabulaire arabe à travers la poesie preislamique, le Coran et le hadith.",
    language: "ar",
    era: "VIIe-VIIIe siècle AH / XIIIe-XIVe siècle",
    categories: ["Langue arabe"],
  },
  {
    title: "Alfiyyat Ibn Malik",
    authorName: "Ibn Malik",
    authorEra: "600-672 AH / 1204-1274",
    description:
      "Poeme didactique de mille vers resumant l'ensemble de la grammaire arabe classique, memorise traditionnellement par les etudiants en sciences islamiques comme fondement de l'analyse grammaticale des textes.",
    language: "ar",
    era: "VIIe siècle AH / XIIIe siècle",
    categories: ["Langue arabe"],
  },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function seedLibrary(db: Database): Promise<void> {
  const categoryIdByName = new Map<string, string>();
  let bookCount = 0;

  for (const b of BOOKS) {
    const [authorRow] = await db
      .insert(authors)
      .values({ name: b.authorName, era: b.authorEra })
      .onConflictDoNothing()
      .returning();
    const author = authorRow ?? (await db.query.authors.findFirst({ where: eq(authors.name, b.authorName) }));

    const slug = slugify(b.title);
    const [book] = await db
      .insert(books)
      .values({
        title: b.title,
        slug,
        authorId: author?.id,
        description: b.description,
        language: b.language,
        era: b.era,
        publicDomain: true,
        license: "Domaine public",
      })
      .onConflictDoUpdate({
        target: books.slug,
        set: {
          description: b.description,
          language: b.language,
          era: b.era,
          authorId: author?.id,
        },
      })
      .returning();
    bookCount++;

    for (const categoryName of b.categories) {
      let categoryId = categoryIdByName.get(categoryName);
      if (!categoryId) {
        const [categoryRow] = await db
          .insert(bookCategories)
          .values({ name: categoryName })
          .onConflictDoNothing()
          .returning();
        const category =
          categoryRow ?? (await db.query.bookCategories.findFirst({ where: eq(bookCategories.name, categoryName) }));
        categoryId = category!.id;
        categoryIdByName.set(categoryName, categoryId);
      }
      await db.insert(bookCategoryLinks).values({ bookId: book.id, categoryId }).onConflictDoNothing();
    }
  }

  console.log(`Bibliothèque: ${bookCount} ouvrages, ${categoryIdByName.size} categories seedes.`);
}
