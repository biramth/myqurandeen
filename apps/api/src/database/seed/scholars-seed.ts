import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { schools, scholars, scholarSchools } from "../schema";

/**
 * Base de savants : figures classiques majeures, avec biographie concise.
 * Dates de naissance/décès en calendrier hegirien (AH) et gregorien
 * approximatif, d'après le consensus biographique standard. Les liens vers
 * une école ne sont etablis que lorsqu'ils sont incontestes (fondateurs de
 * madhab, affiliations largement documentees).
 */

interface ScholarSeed {
  name: string;
  nameArabic: string;
  slug: string;
  bornYear: number | null;
  diedYear: number | null;
  place: string;
  bio: string;
  expertise: string[];
  schoolSlug?: string;
}

const SCHOLARS: ScholarSeed[] = [
  {
    name: "Abu Hanifa",
    nameArabic: "أبو حنيفة",
    slug: "abu-hanifa",
    bornYear: 699,
    diedYear: 767,
    place: "Kufa, Irak",
    bio: "Fondateur de l'école hanafite, Abu Hanifa an-Nu'man est reconnu pour son usage rigoureux du raisonnement analogique face aux situations non explicitement traitées par les textes. Son enseignement a été transmis et systématisé par ses élèves, notamment Abu Yusuf et Muhammad ash-Shaybani.",
    expertise: ["Fiqh", "Usul al-fiqh"],
    schoolSlug: "hanafite",
  },
  {
    name: "Malik ibn Anas",
    nameArabic: "مالك بن أنس",
    slug: "malik-ibn-anas",
    bornYear: 711,
    diedYear: 795,
    place: "Médine, Hijaz",
    bio: "Fondateur de l'école malikite, l'imam Malik est l'auteur du Muwatta, l'un des plus anciens recueils de hadiths et de droit organises par thèmes. Il accordait une importance particulière à la pratique vivante des habitants de Médine comme témoignage de la Sunna.",
    expertise: ["Fiqh", "Hadith"],
    schoolSlug: "malikite",
  },
  {
    name: "Ash-Shafi'i",
    nameArabic: "الشافعي",
    slug: "ash-shafii",
    bornYear: 767,
    diedYear: 820,
    place: "Gaza puis Le Caire",
    bio: "Fondateur de l'école shafi'ite, Muhammad ibn Idris ash-Shafi'i est l'auteur d'Ar-Risala, premier ouvrage systématique de méthodologie juridique islamique (usul al-fiqh). Son approche a fortement influence la manière dont les juristes ulterieurs, toutes écoles confondues, ont structure leur raisonnement.",
    expertise: ["Fiqh", "Usul al-fiqh"],
    schoolSlug: "shafiite",
  },
  {
    name: "Ahmad ibn Hanbal",
    nameArabic: "أحمد بن حنبل",
    slug: "ahmad-ibn-hanbal",
    bornYear: 780,
    diedYear: 855,
    place: "Bagdad, Irak",
    bio: "Fondateur de l'école hanbalite, l'imam Ahmad est également célèbre pour son immense recueil de hadiths, le Musnad. Il est connu pour avoir resiste, au prix d'emprisonnements, à la pression du pouvoir abbasside durant l'épisode de la mihna concernant la nature du Coran.",
    expertise: ["Fiqh", "Hadith", "Aqida"],
    schoolSlug: "hanbalite",
  },
  {
    name: "Al-Bukhari",
    nameArabic: "البخاري",
    slug: "al-bukhari",
    bornYear: 810,
    diedYear: 870,
    place: "Boukhara (actuel Ouzbekistan)",
    bio: "Compilateur de Sahih al-Bukhari, recueil de hadiths considère par consensus sunnite comme le plus authentique après le Coran. Il aurait examiné des centaines de milliers de hadiths avant de retenir ceux repondant à ses critères rigoureux d'authenticité.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Muslim ibn al-Hajjaj",
    nameArabic: "مسلم بن الحجاج",
    slug: "muslim-ibn-al-hajjaj",
    bornYear: 821,
    diedYear: 875,
    place: "Nishapur, Perse",
    bio: "Compilateur de Sahih Muslim, second des deux recueils de hadiths les plus authentiques (avec Sahih al-Bukhari) selon le consensus sunnite, reconnu pour la rigueur de sa méthode de classement des chaînes de transmission.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Abu Dawud",
    nameArabic: "أبو داود",
    slug: "abu-dawud",
    bornYear: 817,
    diedYear: 889,
    place: "Sijistan (actuel Iran/Afghanistan)",
    bio: "Compilateur de Sunan Abu Dawud, l'un des quatre Sunan, particulièrement centre sur les hadiths a portée juridique (ahkam).",
    expertise: ["Sciences du hadith", "Fiqh"],
  },
  {
    name: "At-Tirmidhi",
    nameArabic: "الترمذي",
    slug: "at-tirmidhi",
    bornYear: 824,
    diedYear: 892,
    place: "Tirmidh (actuel Ouzbekistan)",
    bio: "Compilateur de Jami at-Tirmidhi, reconnu pour avoir systématiquement indiqué le degré d'authenticité de chaque hadith et signalé les divergences d'interprétation entre savants.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "An-Nasa'i",
    nameArabic: "النسائي",
    slug: "an-nasai",
    bornYear: 829,
    diedYear: 915,
    place: "Nasa (actuel Turkmenistan)",
    bio: "Compilateur de Sunan an-Nasa'i, l'un des quatre Sunan, connu pour la rigueur particulière apportee à l'examen des chaînes de transmission.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Ibn Majah",
    nameArabic: "ابن ماجه",
    slug: "ibn-majah",
    bornYear: 824,
    diedYear: 887,
    place: "Qazvin, Perse",
    bio: "Compilateur de Sunan Ibn Majah, sixième recueil retenu dans les Kutub as-Sittah (les six livres canoniques de hadiths sunnites).",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "At-Tabari",
    nameArabic: "الطبري",
    slug: "at-tabari",
    bornYear: 839,
    diedYear: 923,
    place: "Tabaristan puis Bagdad",
    bio: "Historien, exegete et juriste, auteur de deux ouvrages majeurs : Tarikh al-Rusul wal-Muluk (histoire universelle jusqu'à son époque) et Jami al-Bayan, l'un des plus anciens et des plus vastes tafsirs complets du Coran.",
    expertise: ["Histoire", "Tafsir"],
  },
  {
    name: "Ibn Kathir",
    nameArabic: "ابن كثير",
    slug: "ibn-kathir",
    bornYear: 1300,
    diedYear: 1373,
    place: "Damas, Syrie",
    bio: "Savant shafi'ite connu pour son tafsir (Tafsir al-Qur'an al-'Azim), son ouvrage historique Al-Bidaya wan-Nihaya et son recueil sur les récits prophetiques anterieurs (Qisas al-Anbiya). Son tafsir est particulièrement estime pour son usage systématique du Coran et de la Sunna pour expliquer le texte coranique.",
    expertise: ["Tafsir", "Histoire", "Hadith"],
    schoolSlug: "shafiite",
  },
  {
    name: "Al-Ghazali",
    nameArabic: "الغزالي",
    slug: "al-ghazali",
    bornYear: 1058,
    diedYear: 1111,
    place: "Tus, Perse",
    bio: "Théologien, juriste et penseur majeur, auteur d'Ihya Ulum ad-Din (\"Revivification des sciences de la religion\"), œuvre de synthese entre droit, théologie et spiritualité. Il a également marqué la théologie ash'arite et le rapport entre philosophie grecque et pensée islamique.",
    expertise: ["Théologie", "Fiqh", "Spiritualité"],
    schoolSlug: "shafiite",
  },
  {
    name: "Ibn Taymiyyah",
    nameArabic: "ابن تيمية",
    slug: "ibn-taymiyyah",
    bornYear: 1263,
    diedYear: 1328,
    place: "Harran puis Damas",
    bio: "Savant hanbalite influent, connu pour ses positions théologiques atharites et ses ecrits abondants sur le fiqh, l'aqida et la refutation de courants qu'il jugeait deviants. Figure controversee de son vivant, emprisonne a plusieurs reprises, il demeure une référence importante pour certains courants contemporains.",
    expertise: ["Fiqh", "Aqida", "Théologie"],
    schoolSlug: "hanbalite",
  },
  {
    name: "Ibn Hisham",
    nameArabic: "ابن هشام",
    slug: "ibn-hisham",
    bornYear: null,
    diedYear: 833,
    place: "Égypte",
    bio: "Editeur et transmetteur de la biographie du Prophète ﷺ (As-Sira an-Nabawiyya), à partir de la version plus ancienne d'Ibn Ishaq. Son ouvrage demeure l'une des sources sira les plus citees dans l'étude de la vie du Prophète ﷺ.",
    expertise: ["Sira", "Histoire"],
  },
];

export async function seedScholars(db: Database): Promise<void> {
  let count = 0;
  let linkCount = 0;

  for (const s of SCHOLARS) {
    const [row] = await db
      .insert(scholars)
      .values({
        name: s.name,
        nameArabic: s.nameArabic,
        slug: s.slug,
        bornYear: s.bornYear,
        diedYear: s.diedYear,
        place: s.place,
        bio: s.bio,
        expertise: s.expertise,
      })
      .onConflictDoUpdate({
        target: scholars.slug,
        set: {
          name: s.name,
          nameArabic: s.nameArabic,
          bornYear: s.bornYear,
          diedYear: s.diedYear,
          place: s.place,
          bio: s.bio,
          expertise: s.expertise,
        },
      })
      .returning();
    count++;

    if (s.schoolSlug) {
      const school = await db.query.schools.findFirst({ where: eq(schools.slug, s.schoolSlug) });
      if (school) {
        await db.insert(scholarSchools).values({ scholarId: row.id, schoolId: school.id }).onConflictDoNothing();
        linkCount++;
      }
    }
  }

  console.log(`Savants: ${count} fiches, ${linkCount} liens vers des écoles seedes.`);
}
