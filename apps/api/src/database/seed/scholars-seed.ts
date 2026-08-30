import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { schools, scholars, scholarSchools } from "../schema";

/**
 * Base de savants : figures classiques majeures, avec biographie concise.
 * Dates de naissance/décès en calendrier hégirien (AH) et grégorien
 * approximatif, d'après le consensus biographique standard. Les liens vers
 * une école ne sont établis que lorsqu'ils sont incontestés (fondateurs de
 * madhab, affiliations largement documentées).
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
    bio: "Fondateur de l'école hanafite, Abu Hanifa an-Nu'man ibn Thabit était d'origine perse et exerçait le commerce de la soie à Kufa avant de se consacrer pleinement à l'enseignement du fiqh. Il est reconnu pour son usage rigoureux du raisonnement analogique (qiyas) et de la préférence juridique (istihsan) face aux situations non explicitement traitées par les textes, développant sa doctrine au sein d'un cercle collégial de disciples plutôt que seul. Il refusa la fonction de juge (qadi) que lui proposait le pouvoir abbasside et fut emprisonné pour ce refus, mourant en détention. Son enseignement, jamais couché par écrit de son vivant, a été transmis et systématisé par ses élèves, notamment Abu Yusuf, qui devint grand juge sous Harun al-Rashid et contribua à diffuser l'école dans l'administration abbasside, et Muhammad ash-Shaybani, dont les écrits constituent la base textuelle du madhab hanafite.",
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
    bio: "Fondateur de l'école malikite, l'imam Malik ibn Anas passa toute sa vie à Médine, où il enseigna pendant des décennies dans la mosquée du Prophète ﷺ et forma des étudiants venus de tout le monde musulman, dont le futur imam ash-Shafi'i. Il est l'auteur du Muwatta, l'un des plus anciens recueils de hadiths et de droit organisés par thèmes, qu'il retravailla toute sa vie et qu'Ash-Shafi'i qualifiera plus tard de \"livre le plus digne de confiance après le Coran\". Il accordait une importance particulière à la pratique vivante des habitants de Médine ('amal ahl al-Madina), qu'il considérait comme un témoignage collectif et ininterrompu de la Sunna transmise depuis le Prophète ﷺ, une source distinctive de son école par rapport aux autres madhabs. Il refusa à plusieurs reprises les avances du pouvoir abbasside et fut, selon la tradition, flagellé sur ordre d'un gouverneur pour avoir maintenu une position juridique jugée gênante politiquement.",
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
    bio: "Fondateur de l'école shafi'ite, Muhammad ibn Idris ash-Shafi'i étudia successivement auprès de Malik ibn Anas à Médine puis des disciples d'Abu Hanifa en Irak, ce qui lui donna une connaissance approfondie des deux grandes traditions juridiques de son époque. Il est l'auteur d'Ar-Risala, premier ouvrage systématique de méthodologie juridique islamique (usul al-fiqh), dans lequel il codifie la hiérarchie des sources du droit (Coran, Sunna, consensus, analogie) et les règles d'interprétation des textes. Il revisa sa propre doctrine juridique après son installation en Égypte à la fin de sa vie (donnant naissance à la distinction entre son \"ancienne opinion\", qawl qadim, et sa \"nouvelle opinion\", qawl jadid), un exemple souvent cité de rigueur intellectuelle face à des contextes nouveaux. Son approche méthodologique a fortement influencé la manière dont les juristes ultérieurs, toutes écoles confondues, ont structuré leur raisonnement.",
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
    bio: "Fondateur de l'école hanbalite, l'imam Ahmad ibn Hanbal parcourut le monde musulman de son époque - Irak, Hijaz, Yemen, Syrie - pour recueillir des hadiths auprès de centaines de transmetteurs, avant de compiler son immense recueil, le Musnad, qui réunit environ trente mille traditions classées par compagnon rapporteur. Il est connu pour avoir résisté, au prix de flagellations et d'emprisonnements prolongés, à la pression du pouvoir abbasside durant l'épisode de la mihna (l'\"inquisition\"), lorsque les califes Al-Ma'mun puis ses successeurs tentèrent d'imposer par la contrainte la doctrine mu'tazilite selon laquelle le Coran serait \"créé\" et non incréé. Son refus de céder, malgré les pressions, en fit une figure de résistance morale largement célébrée dans la tradition sunnite ultérieure, bien au-delà des seuls partisans de son école juridique.",
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
    bio: "Compilateur de Sahih al-Bukhari, recueil de hadiths considéré par consensus sunnite comme le plus authentique après le Coran. Orphelin de père très jeune et devenu aveugle puis miraculeusement guéri selon la tradition biographique, il commença à étudier et mémoriser les hadiths dès l'enfance avant de voyager pendant seize ans à travers la Perse, l'Irak, le Hijaz et l'Égypte pour recueillir des traditions auprès de plus de mille maîtres. Il aurait examiné plusieurs centaines de milliers de hadiths - le chiffre traditionnel avancé est de six cent mille - avant de n'en retenir qu'environ sept mille (avec répétitions) répondant à ses critères rigoureux d'authenticité, notamment la continuité avérée de la chaîne de transmetteurs (isnad) et l'intégrité morale de chacun d'eux, dont il rédigea les biographies dans un ouvrage séparé (At-Tarikh al-Kabir).",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Muslim ibn al-Hajjaj",
    nameArabic: "مسلم بن الحجاج",
    slug: "muslim-ibn-al-hajjaj",
    bornYear: 821,
    diedYear: 875,
    place: "Nishapur, Perse",
    bio: "Compilateur de Sahih Muslim, second des deux recueils de hadiths les plus authentiques (avec Sahih al-Bukhari) selon le consensus sunnite - les deux ouvrages étant collectivement désignés comme \"les deux Sahih\" (as-Sahihayn). Élève d'Al-Bukhari, dont il reconnaissait la supériorité méthodologique, il se distingue par une organisation thématique très soignée de son recueil et par une méthode de classement des chaînes de transmission particulièrement rigoureuse, présentant systématiquement toutes les variantes d'un même hadith regroupées ensemble plutôt que dispersées selon le sujet. Il voyagea en Irak, au Hijaz, en Syrie et en Égypte pour recueillir ses sources, avant de se consacrer à l'enseignement à Nishapur jusqu'à sa mort.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Abu Dawud",
    nameArabic: "أبو داود",
    slug: "abu-dawud",
    bornYear: 817,
    diedYear: 889,
    place: "Sijistan (actuel Iran/Afghanistan)",
    bio: "Compilateur de Sunan Abu Dawud, l'un des quatre Sunan (avec At-Tirmidhi, An-Nasa'i et Ibn Majah), particulièrement centré sur les hadiths à portée juridique (ahkam) plutôt que sur l'ensemble des traditions prophétiques. Il voyagea largement à travers le monde musulman pour recueillir des hadiths et sélectionna, sur environ cinq cent mille traditions examinées selon ses propres estimations, un peu plus de quatre mille huit cents hadiths, qu'il classa par sujet de droit islamique en signalant explicitement le degré de fiabilité de chacun lorsqu'il s'écartait des critères les plus stricts, ce qui fait de son recueil une référence privilégiée pour les juristes.",
    expertise: ["Sciences du hadith", "Fiqh"],
  },
  {
    name: "At-Tirmidhi",
    nameArabic: "الترمذي",
    slug: "at-tirmidhi",
    bornYear: 824,
    diedYear: 892,
    place: "Tirmidh (actuel Ouzbekistan)",
    bio: "Compilateur de Jami at-Tirmidhi, l'un des quatre Sunan, élève d'Al-Bukhari dont il poursuit et complète la méthode. Il se distingue par son habitude d'indiquer systématiquement, après chaque hadith, son degré d'authenticité (sahih, hasan ou da'if) ainsi que les positions juridiques divergentes des différentes écoles qui s'appuient sur ce texte, faisant de son recueil un outil précieux pour l'étude comparée du fiqh. Devenu aveugle vers la fin de sa vie, il continua à enseigner et à transmettre son savoir jusqu'à sa mort à Tirmidh.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "An-Nasa'i",
    nameArabic: "النسائي",
    slug: "an-nasai",
    bornYear: 829,
    diedYear: 915,
    place: "Nasa (actuel Turkmenistan)",
    bio: "Compilateur de Sunan an-Nasa'i (dit aussi Al-Mujtaba), l'un des quatre Sunan, connu pour la rigueur particulière apportée à l'examen des chaînes de transmission - certains spécialistes du hadith considérant ses critères comme les plus stricts après ceux d'Al-Bukhari et Muslim. Il rédigea d'abord un recueil plus vaste, As-Sunan al-Kubra, avant d'en extraire une version condensée ne retenant que les hadiths qu'il jugeait les plus fiables. Il s'installa finalement à Damas, où sa fin de vie, marquée selon certains récits biographiques par des tensions liées à ses positions sur Ali et les proches du Prophète ﷺ, reste discutée parmi les historiens.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Ibn Majah",
    nameArabic: "ابن ماجه",
    slug: "ibn-majah",
    bornYear: 824,
    diedYear: 887,
    place: "Qazvin, Perse",
    bio: "Compilateur de Sunan Ibn Majah, sixième recueil retenu dans les Kutub as-Sittah (les six livres canoniques de hadiths sunnites), aux côtés des deux Sahih et des trois autres Sunan. Son recueil, organisé par chapitres de fiqh comme les autres Sunan, contient un nombre notable de hadiths dits \"zawa'id\" (additionnels) ne figurant dans aucun des cinq autres recueils canoniques, ce qui explique son inclusion tardive mais reconnue dans le canon des six livres malgré des critères de sélection généralement jugés moins stricts que ceux de ses prédécesseurs.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "At-Tabari",
    nameArabic: "الطبري",
    slug: "at-tabari",
    bornYear: 839,
    diedYear: 923,
    place: "Tabaristan puis Bagdad",
    bio: "Historien, exégète et juriste d'une exceptionnelle productivité, At-Tabari s'installa à Bagdad où il consacra sa vie à l'étude et à l'enseignement, refusant les postes officiels qui lui étaient proposés pour préserver son indépendance intellectuelle. Il est l'auteur de deux ouvrages monumentaux restés des références incontournables : Tarikh al-Rusul wal-Muluk (\"Histoire des prophètes et des rois\"), chronique universelle depuis la Création jusqu'à son époque organisée année par année et fondée sur la compilation critique de multiples récits avec leurs chaînes de transmission, et Jami al-Bayan 'an Ta'wil Ayi al-Qur'an, l'un des plus anciens et des plus vastes tafsirs complets du Coran, qui rassemble systématiquement les interprétations des générations précédentes plutôt que d'imposer une lecture unique. Il développa également sa propre école juridique minoritaire (jaririte), qui ne survécut pas au-delà de quelques générations.",
    expertise: ["Histoire", "Tafsir"],
  },
  {
    name: "Ibn Kathir",
    nameArabic: "ابن كثير",
    slug: "ibn-kathir",
    bornYear: 1300,
    diedYear: 1373,
    place: "Damas, Syrie",
    bio: "Savant shafi'ite formé notamment auprès d'Ibn Taymiyyah, dont il fut proche et dont il fut influencé sur le plan méthodologique, tout en restant rattaché à l'école shafi'ite sur le plan juridique. Il est connu pour son tafsir (Tafsir al-Qur'an al-'Azim), particulièrement estimé pour son usage systématique du principe consistant à expliquer le Coran par le Coran, puis par la Sunna, puis par les propos des compagnons et des générations suivantes, en écartant explicitement les récits d'origine judéo-chrétienne (isra'iliyyat) jugés non fiables. Il est également l'auteur d'Al-Bidaya wan-Nihaya, vaste histoire universelle allant de la Création jusqu'à son époque, et de Qisas al-Anbiya, recueil de référence sur les récits des prophètes fondé sur le Coran et les hadiths authentiques plutôt que sur les traditions légendaires antérieures. Devenu aveugle vers la fin de sa vie, il continua néanmoins à enseigner jusqu'à sa mort à Damas.",
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
    bio: "Théologien, juriste et penseur majeur, Abu Hamid al-Ghazali enseigna à la prestigieuse madrasa Nizamiyya de Bagdad avant de traverser, selon son propre récit autobiographique (Al-Munqidh min ad-Dalal, \"Ce qui délivre de l'erreur\"), une crise spirituelle profonde qui le poussa à abandonner sa position et à se consacrer pendant plusieurs années à une vie ascétique et contemplative. Il est l'auteur d'Ihya Ulum ad-Din (\"Revivification des sciences de la religion\"), œuvre monumentale de synthèse entre droit, théologie et spiritualité soufie, structurée en quatre parties couvrant les actes d'adoration, les usages sociaux, les vices à éviter et les vertus à cultiver. Il a également marqué durablement la théologie ash'arite et le rapport entre philosophie grecque et pensée islamique, notamment par son ouvrage Tahafut al-Falasifa (\"L'incohérence des philosophes\"), critique systématique de certaines positions des philosophes rationalistes musulmans comme Ibn Sina, qui suscitera plus tard une réponse célèbre d'Ibn Rushd.",
    expertise: ["Théologie", "Fiqh", "Spiritualité"],
    schoolSlug: "shafiite",
  },
  {
    name: "Ibn Rushd (Averroes)",
    nameArabic: "ابن رشد",
    slug: "ibn-rushd",
    bornYear: 1126,
    diedYear: 1198,
    place: "Cordoue, Al-Andalus",
    bio: "Juriste malikite, médecin et philosophe de Cordoue, connu en Occident latin sous le nom d'Averroes, où il exerça une influence majeure sur la scolastique médiévale européenne à travers ses commentaires d'Aristote. Il occupa la fonction de qadi (juge) à Séville puis à Cordoue et rédigea un ouvrage de fiqh comparé, Bidayat al-Mujtahid, encore étudié aujourd'hui pour sa méthode d'analyse des divergences entre écoles juridiques. Il est surtout célèbre pour Tahafut at-Tahafut (\"L'incohérence de l'incohérence\"), réponse détaillée à la critique qu'Al-Ghazali avait adressée aux philosophes, dans laquelle il défend la compatibilité entre raison philosophique et révélation. Ses dernières années furent marquées par une disgrâce temporaire auprès du pouvoir almohade, ses écrits philosophiques étant jugés suspects par certains cercles religieux de son époque.",
    expertise: ["Fiqh", "Philosophie", "Médecine"],
    schoolSlug: "malikite",
  },
  {
    name: "Ar-Razi (Fakhr ad-Din)",
    nameArabic: "فخر الدين الرازي",
    slug: "ar-razi",
    bornYear: 1149,
    diedYear: 1209,
    place: "Ray, Perse",
    bio: "Théologien ash'arite et exégète shafi'ite, Fakhr ad-Din ar-Razi est l'auteur d'un immense tafsir, Mafatih al-Ghayb (\"Les clefs de l'invisible\"), qui intègre systématiquement des discussions de théologie, de philosophie, de logique et de sciences naturelles de son époque à l'explication des versets, en fait l'un des tafsirs les plus intellectuellement exigeants de la tradition sunnite. Également formé aux sciences rationnelles (kalam, logique, médecine), il chercha tout au long de son œuvre à articuler rigueur rationnelle et fidélité aux textes révélés, dans la continuité de la démarche ash'arite d'Al-Ghazali. Il voyagea et enseigna dans plusieurs régions d'Asie centrale et de Perse avant de s'installer à Herat, où il mourut.",
    expertise: ["Tafsir", "Théologie", "Philosophie"],
    schoolSlug: "shafiite",
  },
  {
    name: "Ibn Taymiyyah",
    nameArabic: "ابن تيمية",
    slug: "ibn-taymiyyah",
    bornYear: 1263,
    diedYear: 1328,
    place: "Harran puis Damas",
    bio: "Savant hanbalite influent, né à Harran (actuelle Turquie) peu avant que sa famille ne fuie l'invasion mongole pour s'installer à Damas. Connu pour ses positions théologiques atharites - privilégiant l'affirmation littérale des textes sur les attributs divins sans interprétation allégorique - et ses écrits abondants sur le fiqh, l'aqida et la réfutation de courants qu'il jugeait déviants, dont certaines pratiques soufies, le kalam ash'arite et la philosophie hellénisante. Il joua également un rôle actif hors du seul champ théorique, notamment en encourageant la résistance militaire face aux invasions mongoles de Syrie. Figure controversée de son vivant au sein même des milieux savants, il fut emprisonné à plusieurs reprises pour ses positions, mourant en détention à la citadelle de Damas ; son élève Ibn Qayyim al-Jawziyya diffusera et systématisera une grande partie de son enseignement après sa mort. Il demeure une référence importante pour certains courants contemporains, notamment salafis, tout en restant une figure de débat au sein de la tradition sunnite plus large.",
    expertise: ["Fiqh", "Aqida", "Théologie"],
    schoolSlug: "hanbalite",
  },
  {
    name: "Ibn Qayyim al-Jawziyya",
    nameArabic: "ابن قيم الجوزية",
    slug: "ibn-qayyim-al-jawziyya",
    bornYear: 1292,
    diedYear: 1350,
    place: "Damas, Syrie",
    bio: "Savant hanbalite, principal élève et compagnon d'Ibn Taymiyyah, qu'il accompagna jusque dans ses emprisonnements et dont il transmit et développa l'enseignement après sa mort dans une œuvre écrite abondante et souvent d'une grande finesse littéraire. Auteur notamment de Zad al-Ma'ad (guide de conduite fondé sur l'exemple prophétique), de Madarij as-Salikin (traité de spiritualité et de cheminement de l'âme) et d'écrits sur la médecine prophétique (At-Tibb an-Nabawi), il aborde une large diversité de sujets - droit, spiritualité, psychologie religieuse, polémique théologique - avec un style considéré comme particulièrement accessible malgré la profondeur du contenu.",
    expertise: ["Fiqh", "Spiritualité", "Aqida"],
    schoolSlug: "hanbalite",
  },
  {
    name: "An-Nawawi",
    nameArabic: "النووي",
    slug: "an-nawawi",
    bornYear: 1233,
    diedYear: 1277,
    place: "Nawa puis Damas, Syrie",
    bio: "Savant shafi'ite mort jeune (à environ quarante-quatre ans) mais d'une productivité exceptionnelle, connu pour son mode de vie ascétique et son refus persistant des postes et rémunérations officielles. Il est l'auteur de Riyad as-Salihin, anthologie de hadiths sur l'éthique et la spiritualité qui reste l'un des recueils les plus largement diffusés et étudiés dans le monde musulman contemporain, ainsi que d'un commentaire très étudié du Sahih Muslim et d'un recueil de quarante hadiths fondamentaux (Al-Arba'in an-Nawawiyya) fréquemment utilisé comme premier support d'apprentissage du hadith. Son ouvrage de fiqh Minhaj at-Talibin demeure une référence classique au sein de l'école shafi'ite.",
    expertise: ["Sciences du hadith", "Fiqh", "Spiritualité"],
    schoolSlug: "shafiite",
  },
  {
    name: "Ibn Hisham",
    nameArabic: "ابن هشام",
    slug: "ibn-hisham",
    bornYear: null,
    diedYear: 833,
    place: "Égypte",
    bio: "Éditeur et transmetteur de la biographie du Prophète ﷺ (As-Sira an-Nabawiyya), à partir de la version plus ancienne et plus volumineuse d'Ibn Ishaq (m. 767), aujourd'hui perdue dans sa forme originelle et connue principalement à travers cette édition. Ibn Hisham revisa le texte d'Ibn Ishaq en retirant certains éléments qu'il jugeait peu fiables ou hors sujet (notamment de la poésie préislamique) et en ajoutant ses propres annotations philologiques et géographiques, produisant une version plus concise et mieux structurée. Son ouvrage demeure, avec les chroniques d'At-Tabari, l'une des sources sira les plus anciennes et les plus citées dans l'étude de la vie du Prophète ﷺ.",
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
