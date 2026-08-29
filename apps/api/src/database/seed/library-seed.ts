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
      "Recueil de hadiths compilé par Muhammad ibn Ismail al-Bukhari, considère par consensus sunnite comme le recueil le plus authentique après le Coran. Il aurait examiné des centaines de milliers de hadiths avant de retenir environ 7 275 traditions (avec répétitions) repondant à ses critères rigoureux d'authenticité.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Sahih Muslim",
    authorName: "Muslim ibn al-Hajjaj",
    authorEra: "206-261 AH / 821-875",
    description:
      "Second des deux recueils de hadiths les plus authentiques (avec Sahih al-Bukhari) selon le consensus sunnite. Muslim ibn al-Hajjaj est reconnu pour la rigueur de sa méthode de classement des chaînes de transmission et pour avoir regroupe les différentes versions d'un même hadith sous une seule entrée.",
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
      "Recueil reconnu pour avoir systématiquement indiqué le degré d'authenticité de chaque hadith et signalé les divergences d'interprétation entre savants sur un même texte, ce qui en fait une référence privilégiée pour l'étude comparee du fiqh.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Sunan an-Nasa'i",
    authorName: "An-Nasa'i",
    authorEra: "215-303 AH / 829-915",
    description:
      "L'un des quatre Sunan, connu pour la rigueur particulière apportee à l'examen des chaînes de transmission et pour un taux relativement faible de hadiths faibles compare a d'autres recueils de la même période.",
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
      "L'un des plus anciens recueils organisant hadiths et positions juridiques par thèmes, rédigé par l'imam Malik, fondateur de l'école malikite. Il accorde une place importante à la pratique vivante des habitants de Médine comme témoignage de la Sunna.",
    language: "ar",
    era: "IIe siècle AH / VIIIe siècle",
    categories: ["Hadith", "Fiqh"],
  },
  {
    title: "Riyad as-Salihin",
    authorName: "An-Nawawi",
    authorEra: "631-676 AH / 1233-1277",
    description:
      "Compilation thematique de hadiths centree sur l'éthique, la spiritualité et le comportement quotidien, organisée par l'imam An-Nawawi en chapitres consacres a des vertus spécifiques (sincérité, patience, misericorde...).",
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
      "Premier ouvrage systématique de méthodologie juridique islamique (usul al-fiqh), rédigé par l'imam Ash-Shafi'i. Il y hierarchise les sources du droit (Coran, Sunna, consensus, analogie) et pose des bases méthodologiques reprises par l'ensemble des écoles ulterieures.",
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
      "Biographie du Prophète ﷺ fondée sur la recension par Ibn Hisham de la sira, plus ancienne biographie prophétique, initialement rédigée par Ibn Ishaq. C'est l'une des sources classiques les plus utilisées pour l'étude de la vie du Prophète ﷺ.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Sira", "Histoire"],
  },
  {
    title: "Qisas al-Anbiya",
    authorName: "Ibn Kathir",
    authorEra: "701-774 AH / 1300-1373",
    description:
      "Recueil des récits des prophètes anterieurs a Muhammad ﷺ tels que rapportes par le Coran et la tradition islamique, source de référence pour la section Prophètes de cette plateforme.",
    language: "ar",
    era: "VIIIe siècle AH / XIVe siècle",
    categories: ["Sira"],
  },
  {
    title: "Ihya Ulum ad-Din",
    authorName: "Al-Ghazali",
    authorEra: "450-505 AH / 1058-1111",
    description:
      "Œuvre majeure de synthese entre droit, théologie et spiritualité, structurée en quatre parties (culte, usages sociaux, vices de l'ame, vertus salvatrices), l'un des ouvrages les plus lus de la littérature spirituelle islamique classique.",
    language: "ar",
    era: "Ve-VIe siècle AH / XIe-XIIe siècle",
    categories: ["Spiritualité"],
  },
  {
    title: "Al-Aqida at-Tahawiyya",
    authorName: "At-Tahawi",
    authorEra: "239-321 AH / 853-933",
    description:
      "Exposé concis des croyances fondamentales de l'Islam, rédigé par Abu Ja'far at-Tahawi pour présenter, selon ses propres termes, la croyance des savants de la voie sunnite ; largement étudié et commente à travers les siècles dans différents courants du sunnisme.",
    language: "ar",
    era: "IIIe-IVe siècle AH / IXe-Xe siècle",
    categories: ["Aqida"],
  },
  {
    title: "Nukhbat al-Fikar",
    authorName: "Ibn Hajar al-Asqalani",
    authorEra: "773-852 AH / 1372-1449",
    description:
      "Traité concis de terminologie du hadith (mustalah al-hadith), servant de référence classique pour la classification des hadiths (sahih, hasan, da'if...) et la compréhension des chaînes de transmission.",
    language: "ar",
    era: "VIIIe-IXe siècle AH / XIVe-XVe siècle",
    categories: ["Sciences du hadith"],
  },
  {
    title: "Fath al-Bari",
    authorName: "Ibn Hajar al-Asqalani",
    authorEra: "773-852 AH / 1372-1449",
    description:
      "Commentaire de référence sur Sahih al-Bukhari, considère comme l'un des commentaires les plus complets et les plus rigoureux jamais rédigés sur ce recueil de hadiths.",
    language: "ar",
    era: "VIIIe-IXe siècle AH / XIVe-XVe siècle",
    categories: ["Sciences du hadith", "Hadith"],
  },
  {
    title: "Lisan al-Arab",
    authorName: "Ibn Manzur",
    authorEra: "630-711 AH / 1233-1312",
    description:
      "L'un des dictionnaires de langue arabe classique les plus complets, rassemblant les usages et significations attestes du vocabulaire arabe à travers la poésie preislamique, le Coran et le hadith.",
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
  {
    title: "Al-Jami' li-Ahkam al-Qur'an (Tafsir al-Qurtubi)",
    authorName: "Al-Qurtubi",
    authorEra: "m. 671 AH / 1273",
    description:
      "Commentaire du Coran particulièrement centré sur l'extraction des règles juridiques (ahkam) contenues dans chaque verset, tout en rassemblant de nombreuses opinions exégétiques et linguistiques antérieures.",
    language: "ar",
    era: "VIIe siècle AH / XIIIe siècle",
    categories: ["Tafsir"],
  },
  {
    title: "Taysir al-Karim ar-Rahman (Tafsir as-Sa'di)",
    authorName: "As-Sa'di",
    authorEra: "1307-1376 AH / 1889-1956",
    description:
      "Commentaire moderne du Coran rédigé dans un style volontairement concis et accessible, largement diffuse et traduit dans plusieurs langues comme introduction a l'exégèse coranique.",
    language: "ar",
    era: "XXe siècle",
    categories: ["Tafsir"],
  },
  {
    title: "Zad al-Masir fi 'Ilm at-Tafsir",
    authorName: "Ibn al-Jawzi",
    authorEra: "508-597 AH / 1116-1201",
    description:
      "Commentaire du Coran de format concis, rassemblant et synthetisant les principales opinions exégétiques antérieures verset par verset, rédigé par le savant hanbalite Ibn al-Jawzi.",
    language: "ar",
    era: "VIe siècle AH / XIIe siècle",
    categories: ["Tafsir"],
  },
  {
    title: "Al-Umm",
    authorName: "Ash-Shafi'i",
    authorEra: "150-204 AH / 767-820",
    description:
      "Compendium fondateur du fiqh shafi'ite rédigé par l'imam Ash-Shafi'i lui-même, couvrant l'ensemble des questions juridiques a la lumière de la méthodologie exposee dans son Ar-Risala.",
    language: "ar",
    era: "IIe-IIIe siècle AH / VIIIe-IXe siècle",
    categories: ["Fiqh"],
  },
  {
    title: "Al-Hidaya",
    authorName: "Al-Marghinani",
    authorEra: "m. 593 AH / 1197",
    description:
      "Ouvrage de référence du fiqh hanafite, structure de manière particulièrement claire et pedagogique, largement etudie dans les cursus traditionnels de cette école a travers les siècles.",
    language: "ar",
    era: "VIe siècle AH / XIIe siècle",
    categories: ["Fiqh"],
  },
  {
    title: "Al-Mughni",
    authorName: "Ibn Qudama",
    authorEra: "541-620 AH / 1147-1223",
    description:
      "Somme juridique majeure du fiqh hanbalite rédigée par Ibn Qudama, qui exposé systématiquement chaque question en presentant également les positions des autres écoles et leurs arguments respectifs.",
    language: "ar",
    era: "VIe-VIIe siècle AH / XIIe-XIIIe siècle",
    categories: ["Fiqh", "Fiqh comparé"],
  },
  {
    title: "Bidayat al-Mujtahid wa Nihayat al-Muqtasid",
    authorName: "Ibn Rushd",
    authorEra: "520-595 AH / 1126-1198",
    description:
      "Ouvrage de fiqh comparé rédigé par le juriste et philosophe Ibn Rushd (Averroès), qui exposé methodiquement les positions des différentes écoles juridiques sur chaque question avec leurs preuves respectives et les causes de leur divergence.",
    language: "ar",
    era: "VIe siècle AH / XIIe siècle",
    categories: ["Fiqh comparé"],
  },
  {
    title: "Al-Waraqat",
    authorName: "Al-Juwayni",
    authorEra: "419-478 AH / 1028-1085",
    description:
      "Court traité introductif de méthodologie juridique (usul al-fiqh), traditionnellement utilisé comme premier support d'enseignement de cette discipline dans les cursus classiques.",
    language: "ar",
    era: "Ve siècle AH / XIe siècle",
    categories: ["Usul al-fiqh"],
  },
  {
    title: "Al-Fiqh al-Akbar",
    authorName: "Abu Hanifa",
    authorEra: "80-150 AH / 699-767",
    description:
      "Court traité de croyance (aqida) attribué a l'imam Abu Hanifa, fondateur de l'école hanafite, parmi les plus anciens textes structurant systématiquement les articles de foi islamiques.",
    language: "ar",
    era: "IIe siècle AH / VIIIe siècle",
    categories: ["Aqida"],
  },
  {
    title: "Al-'Aqida al-Wasitiyya",
    authorName: "Ibn Taymiyya",
    authorEra: "661-728 AH / 1263-1328",
    description:
      "Traité de croyance rédigé par Ibn Taymiyya a la demande d'un juge de la ville de Wasit, presentant ce que l'auteur considère comme la croyance des premières générations musulmanes (salaf) sur les questions relatives aux attributs divins.",
    language: "ar",
    era: "VIIe-VIIIe siècle AH / XIIIe-XIVe siècle",
    categories: ["Aqida"],
  },
  {
    title: "Al-Adab al-Mufrad",
    authorName: "Al-Bukhari",
    authorEra: "194-256 AH / 810-870",
    description:
      "Recueil de hadiths distinct de Sahih al-Bukhari, entièrement consacre aux règles de bienséance, de politesse et de comportement (adab) dans la vie quotidienne et les relations sociales.",
    language: "ar",
    era: "IIIe siècle AH / IXe siècle",
    categories: ["Hadith"],
  },
  {
    title: "Muqaddimat Ibn as-Salah",
    authorName: "Ibn as-Salah",
    authorEra: "577-643 AH / 1181-1245",
    description:
      "Ouvrage fondateur qui a systematise pour la première fois de manière aussi complète la terminologie des sciences du hadith, servant de base a de nombreux traités ulterieurs sur le sujet, dont le Nukhbat al-Fikar d'Ibn Hajar.",
    language: "ar",
    era: "VIe-VIIe siècle AH / XIIe-XIIIe siècle",
    categories: ["Sciences du hadith"],
  },
  {
    title: "Al-Hikam al-'Ata'iyya",
    authorName: "Ibn Ata Allah al-Iskandari",
    authorEra: "658-709 AH / 1260-1309",
    description:
      "Recueil d'aphorismes spirituels traitant de la sincérité, du détachement et de la relation du cœur a Dieu, parmi les textes de spiritualité islamique (tasawwuf) les plus lus et commentes a travers les siècles.",
    language: "ar",
    era: "VIIe-VIIIe siècle AH / XIIIe-XIVe siècle",
    categories: ["Spiritualité"],
  },
  {
    title: "Ar-Rahiq al-Makhtum",
    authorName: "Safi ar-Rahman al-Mubarakpuri",
    authorEra: "1362-1427 AH / 1943-2006",
    description:
      "Biographie moderne du Prophète ﷺ rédigée au XXe siècle, distinguee lors d'un concours international consacre a la sira, largement traduite (dont en français) et diffusee comme référence contemporaine accessible.",
    language: "ar",
    era: "XXe siècle",
    categories: ["Sira", "Histoire"],
  },
  {
    title: "Al-Ajrumiyyah",
    authorName: "Ibn Ajurrum",
    authorEra: "672-723 AH / 1273-1323",
    description:
      "Court traité introductif de grammaire arabe, traditionnellement le tout premier texte etudie par les debutants avant d'aborder des ouvrages plus avances comme l'Alfiyyat Ibn Malik.",
    language: "ar",
    era: "VIIe-VIIIe siècle AH / XIIIe-XIVe siècle",
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
