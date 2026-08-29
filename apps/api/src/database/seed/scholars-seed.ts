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
    bio: "Fondateur de l'école hanafite, Abu Hanifa an-Nu'man ibn Thabit était d'origine perse et exercait le commerce de la soie a Kufa avant de se consacrer pleinement a l'enseignement du fiqh. Il est reconnu pour son usage rigoureux du raisonnement analogique (qiyas) et de la préférence juridique (istihsan) face aux situations non explicitement traitées par les textes, développant sa doctrine au sein d'un cercle collegial de disciples plutôt que seul. Il refusa la fonction de juge (qadi) que lui proposait le pouvoir abbasside et fut emprisonne pour ce refus, mourant en detention. Son enseignement, jamais couche par écrit de son vivant, a été transmis et systématisé par ses élèves, notamment Abu Yusuf, qui devint grand juge sous Harun al-Rashid et contribua a diffuser l'école dans l'administration abbasside, et Muhammad ash-Shaybani, dont les écrits constituent la base textuelle du madhab hanafite.",
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
    bio: "Fondateur de l'école malikite, l'imam Malik ibn Anas passa toute sa vie a Médine, ou il enseigna pendant des décennies dans la mosquee du Prophète ﷺ et forma des étudiants venus de tout le monde musulman, dont le futur imam ash-Shafi'i. Il est l'auteur du Muwatta, l'un des plus anciens recueils de hadiths et de droit organises par thèmes, qu'il retravailla toute sa vie et qu'Ash-Shafi'i qualifiera plus tard de \"livre le plus digne de confiance après le Coran\". Il accordait une importance particulière a la pratique vivante des habitants de Médine ('amal ahl al-Madina), qu'il considérait comme un témoignage collectif et ininterrompu de la Sunna transmise depuis le Prophète ﷺ, une source distinctive de son école par rapport aux autres madhabs. Il refusa a plusieurs reprises les avances du pouvoir abbasside et fut, selon la tradition, flagelle sur ordre d'un gouverneur pour avoir maintenu une position juridique jugee genante politiquement.",
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
    bio: "Fondateur de l'école shafi'ite, Muhammad ibn Idris ash-Shafi'i étudia successivement auprès de Malik ibn Anas a Médine puis des disciples d'Abu Hanifa en Irak, ce qui lui donna une connaissance approfondie des deux grandes traditions juridiques de son époque. Il est l'auteur d'Ar-Risala, premier ouvrage systématique de méthodologie juridique islamique (usul al-fiqh), dans lequel il codifie la hiérarchie des sources du droit (Coran, Sunna, consensus, analogie) et les règles d'interprétation des textes. Il revisa sa propre doctrine juridique après son installation en Égypte a la fin de sa vie (donnant naissance a la distinction entre son \"ancienne opinion\", qawl qadim, et sa \"nouvelle opinion\", qawl jadid), un exemple souvent cité de rigueur intellectuelle face a des contextes nouveaux. Son approche méthodologique a fortement influence la manière dont les juristes ulterieurs, toutes écoles confondues, ont structure leur raisonnement.",
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
    bio: "Fondateur de l'école hanbalite, l'imam Ahmad ibn Hanbal parcourut le monde musulman de son époque - Irak, Hijaz, Yemen, Syrie - pour recueillir des hadiths aupres de centaines de transmetteurs, avant de compiler son immense recueil, le Musnad, qui reunit environ trente mille traditions classees par compagnon rapporteur. Il est connu pour avoir résiste, au prix de flagellations et d'emprisonnements prolonges, a la pression du pouvoir abbasside durant l'épisode de la mihna (l'\"inquisition\"), lorsque les califes Al-Ma'mun puis ses successeurs tenterent d'imposer par la contrainte la doctrine mu'tazilite selon laquelle le Coran serait \"créé\" et non incree. Son refus de céder, malgré les pressions, en fit une figure de résistance morale largement celebree dans la tradition sunnite ulterieure, bien au-dela des seuls partisans de son école juridique.",
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
    bio: "Compilateur de Sahih al-Bukhari, recueil de hadiths considère par consensus sunnite comme le plus authentique après le Coran. Orphelin de père très jeune et devenu aveugle puis miraculeusement gueri selon la tradition biographique, il commenca a étudier et memoriser les hadiths des l'enfance avant de voyager pendant seize ans a travers la Perse, l'Irak, le Hijaz et l'Égypte pour recueillir des traditions aupres de plus de mille maitres. Il aurait examine plusieurs centaines de milliers de hadiths - le chiffre traditionnel avance est de six cent mille - avant de n'en retenir qu'environ sept mille (avec répétitions) repondant a ses critères rigoureux d'authenticité, notamment la continuité averee de la chaîne de transmetteurs (isnad) et l'integrite morale de chacun d'eux, dont il redigea les biographies dans un ouvrage separe (At-Tarikh al-Kabir).",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Muslim ibn al-Hajjaj",
    nameArabic: "مسلم بن الحجاج",
    slug: "muslim-ibn-al-hajjaj",
    bornYear: 821,
    diedYear: 875,
    place: "Nishapur, Perse",
    bio: "Compilateur de Sahih Muslim, second des deux recueils de hadiths les plus authentiques (avec Sahih al-Bukhari) selon le consensus sunnite - les deux ouvrages étant collectivement designes comme \"les deux Sahih\" (as-Sahihayn). Élève d'Al-Bukhari, dont il reconnaissait la supériorité methodologique, il se distingue par une organisation thematique très soignee de son recueil et par une méthode de classement des chaînes de transmission particulièrement rigoureuse, presentant systématiquement toutes les variantes d'un même hadith regroupees ensemble plutôt que dispersees selon le sujet. Il voyagea en Irak, au Hijaz, en Syrie et en Égypte pour recueillir ses sources, avant de se consacrer a l'enseignement a Nishapur jusqu'a sa mort.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Abu Dawud",
    nameArabic: "أبو داود",
    slug: "abu-dawud",
    bornYear: 817,
    diedYear: 889,
    place: "Sijistan (actuel Iran/Afghanistan)",
    bio: "Compilateur de Sunan Abu Dawud, l'un des quatre Sunan (avec At-Tirmidhi, An-Nasa'i et Ibn Majah), particulièrement centre sur les hadiths a portée juridique (ahkam) plutôt que sur l'ensemble des traditions prophetiques. Il voyagea largement a travers le monde musulman pour recueillir des hadiths et selectionna, sur environ cinq cent mille traditions examinees selon ses propres estimations, un peu plus de quatre mille huit cents hadiths, qu'il classa par sujet de droit islamique en signalant explicitement le degré de fiabilité de chacun lorsqu'il s'ecartait des critères les plus stricts, ce qui fait de son recueil une référence privilégiée pour les juristes.",
    expertise: ["Sciences du hadith", "Fiqh"],
  },
  {
    name: "At-Tirmidhi",
    nameArabic: "الترمذي",
    slug: "at-tirmidhi",
    bornYear: 824,
    diedYear: 892,
    place: "Tirmidh (actuel Ouzbekistan)",
    bio: "Compilateur de Jami at-Tirmidhi, l'un des quatre Sunan, élève d'Al-Bukhari dont il poursuit et complete la méthode. Il se distingue par son habitude d'indiquer systématiquement, après chaque hadith, son degré d'authenticité (sahih, hasan ou da'if) ainsi que les positions juridiques divergentes des différentes écoles qui s'appuient sur ce texte, faisant de son recueil un outil précieux pour l'étude comparee du fiqh. Devenu aveugle vers la fin de sa vie, il continua a enseigner et a transmettre son savoir jusqu'a sa mort a Tirmidh.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "An-Nasa'i",
    nameArabic: "النسائي",
    slug: "an-nasai",
    bornYear: 829,
    diedYear: 915,
    place: "Nasa (actuel Turkmenistan)",
    bio: "Compilateur de Sunan an-Nasa'i (dit aussi Al-Mujtaba), l'un des quatre Sunan, connu pour la rigueur particulière apportee a l'examen des chaînes de transmission - certains spécialistes du hadith considerant ses critères comme les plus stricts après ceux d'Al-Bukhari et Muslim. Il redigea d'abord un recueil plus vaste, As-Sunan al-Kubra, avant d'en extraire une version condensee ne retenant que les hadiths qu'il jugeait les plus fiables. Il s'installa finalement a Damas, ou sa fin de vie, marquee selon certains récits biographiques par des tensions liees a ses positions sur Ali et les proches du Prophète ﷺ, reste discutee parmi les historiens.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "Ibn Majah",
    nameArabic: "ابن ماجه",
    slug: "ibn-majah",
    bornYear: 824,
    diedYear: 887,
    place: "Qazvin, Perse",
    bio: "Compilateur de Sunan Ibn Majah, sixième recueil retenu dans les Kutub as-Sittah (les six livres canoniques de hadiths sunnites), aux côtés des deux Sahih et des trois autres Sunan. Son recueil, organise par chapitres de fiqh comme les autres Sunan, contient un nombre notable de hadiths dits \"zawa'id\" (additionnels) ne figurant dans aucun des cinq autres recueils canoniques, ce qui explique son inclusion tardive mais reconnue dans le canon des six livres malgré des critères de selection généralement juges moins stricts que ceux de ses predecesseurs.",
    expertise: ["Sciences du hadith"],
  },
  {
    name: "At-Tabari",
    nameArabic: "الطبري",
    slug: "at-tabari",
    bornYear: 839,
    diedYear: 923,
    place: "Tabaristan puis Bagdad",
    bio: "Historien, exegete et juriste d'une exceptionnelle productivite, At-Tabari s'installa a Bagdad ou il consacra sa vie a l'étude et a l'enseignement, refusant les postes officiels qui lui étaient proposes pour preserver son independance intellectuelle. Il est l'auteur de deux ouvrages monumentaux restes des références incontournables : Tarikh al-Rusul wal-Muluk (\"Histoire des prophètes et des rois\"), chronique universelle depuis la Creation jusqu'a son époque organisée année par année et fondée sur la compilation critique de multiples récits avec leurs chaînes de transmission, et Jami al-Bayan 'an Ta'wil Ayi al-Qur'an, l'un des plus anciens et des plus vastes tafsirs complets du Coran, qui rassemble systématiquement les interprétations des générations precedentes plutôt que d'imposer une lecture unique. Il developpa également sa propre école juridique minoritaire (jaririte), qui ne survecut pas au-dela de quelques générations.",
    expertise: ["Histoire", "Tafsir"],
  },
  {
    name: "Ibn Kathir",
    nameArabic: "ابن كثير",
    slug: "ibn-kathir",
    bornYear: 1300,
    diedYear: 1373,
    place: "Damas, Syrie",
    bio: "Savant shafi'ite formé notamment aupres d'Ibn Taymiyyah, dont il fut proche et dont il fut influence sur le plan méthodologique, tout en restant rattache a l'école shafi'ite sur le plan juridique. Il est connu pour son tafsir (Tafsir al-Qur'an al-'Azim), particulièrement estime pour son usage systématique du principe consistant a expliquer le Coran par le Coran, puis par la Sunna, puis par les propos des compagnons et des générations suivantes, en ecartant explicitement les récits d'origine judeo-chretienne (isra'iliyyat) juges non fiables. Il est également l'auteur d'Al-Bidaya wan-Nihaya, vaste histoire universelle allant de la Creation jusqu'a son époque, et de Qisas al-Anbiya, recueil de référence sur les récits des prophètes fondé sur le Coran et les hadiths authentiques plutôt que sur les traditions legendaires anterieures. Devenu aveugle vers la fin de sa vie, il continua neanmoins a enseigner jusqu'a sa mort a Damas.",
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
    bio: "Théologien, juriste et penseur majeur, Abu Hamid al-Ghazali enseigna a la prestigieuse madrasa Nizamiyya de Bagdad avant de traverser, selon son propre récit autobiographique (Al-Munqidh min ad-Dalal, \"Ce qui delivre de l'erreur\"), une crise spirituelle profonde qui le poussa a abandonner sa position et a se consacrer pendant plusieurs années a une vie ascetique et contemplative. Il est l'auteur d'Ihya Ulum ad-Din (\"Revivification des sciences de la religion\"), œuvre monumentale de synthese entre droit, théologie et spiritualité soufie, structurée en quatre parties couvrant les actes d'adoration, les usages sociaux, les vices a éviter et les vertus a cultiver. Il a également marqué durablement la théologie ash'arite et le rapport entre philosophie grecque et pensée islamique, notamment par son ouvrage Tahafut al-Falasifa (\"L'incoherence des philosophes\"), critique systématique de certaines positions des philosophes rationalistes musulmans comme Ibn Sina, qui suscitera plus tard une réponse célèbre d'Ibn Rushd.",
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
    bio: "Juriste malikite, médecin et philosophe de Cordoue, connu en Occident latin sous le nom d'Averroes, ou il exerca une influence majeure sur la scolastique medievale europeenne a travers ses commentaires d'Aristote. Il occupa la fonction de qadi (juge) a Séville puis a Cordoue et rediga un ouvrage de fiqh compare, Bidayat al-Mujtahid, encore etudie aujourd'hui pour sa méthode d'analyse des divergences entre écoles juridiques. Il est surtout célèbre pour Tahafut at-Tahafut (\"L'incoherence de l'incoherence\"), réponse detaillee a la critique qu'Al-Ghazali avait adressee aux philosophes, dans laquelle il defend la compatibilite entre raison philosophique et révélation. Ses dernières années furent marquees par une disgrace temporaire aupres du pouvoir almohade, ses ecrits philosophiques etant juges suspects par certains cercles religieux de son époque.",
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
    bio: "Théologien ash'arite et exegete shafi'ite, Fakhr ad-Din ar-Razi est l'auteur d'un immense tafsir, Mafatih al-Ghayb (\"Les clefs de l'invisible\"), qui integre systématiquement des discussions de théologie, de philosophie, de logique et de sciences naturelles de son époque a l'explication des versets, en fait l'un des tafsirs les plus intellectuellement exigeants de la tradition sunnite. Également forme aux sciences rationnelles (kalam, logique, médecine), il chercha tout au long de son œuvre a articuler rigueur rationnelle et fidelite aux textes révélées, dans la continuite de la démarche ash'arite d'Al-Ghazali. Il voyagea et enseigna dans plusieurs régions d'Asie centrale et de Perse avant de s'installer a Herat, ou il mourut.",
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
    bio: "Savant hanbalite influent, ne a Harran (actuelle Turquie) peu avant que sa famille ne fuie l'invasion mongole pour s'installer a Damas. Connu pour ses positions théologiques atharites - privilegiant l'affirmation litterale des textes sur les attributs divins sans interprétation allegorique - et ses ecrits abondants sur le fiqh, l'aqida et la réfutation de courants qu'il jugeait deviants, dont certaines pratiques soufies, le kalam ash'arite et la philosophie hellenisante. Il joua également un rôle actif hors du seul champ théorique, notamment en encourageant la résistance militaire face aux invasions mongoles de Syrie. Figure controversee de son vivant au sein même des milieux savants, il fut emprisonne a plusieurs reprises pour ses positions, mourant en detention a la citadelle de Damas ; son élève Ibn Qayyim al-Jawziyya diffusera et systematisera une grande partie de son enseignement après sa mort. Il demeure une référence importante pour certains courants contemporains, notamment salafis, tout en restant une figure de débat au sein de la tradition sunnite plus large.",
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
    bio: "Savant hanbalite, principal élève et compagnon d'Ibn Taymiyyah, qu'il accompagna jusque dans ses emprisonnements et dont il transmit et developpa l'enseignement après sa mort dans une œuvre ecrite abondante et souvent d'une grande finesse littéraire. Auteur notamment de Zad al-Ma'ad (guide de conduite fondé sur l'exemple prophétique), de Madarij as-Salikin (traité de spiritualité et de cheminement de l'âme) et d'écrits sur la médecine prophetique (At-Tibb an-Nabawi), il aborde une large diversité de sujets - droit, spiritualité, psychologie religieuse, polémique théologique - avec un style considère comme particulièrement accessible malgre la profondeur du contenu.",
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
    bio: "Savant shafi'ite mort jeune (a environ quarante-quatre ans) mais d'une productivite exceptionnelle, connu pour son mode de vie ascetique et son refus persistant des postes et remunerations officielles. Il est l'auteur de Riyad as-Salihin, anthologie de hadiths sur l'ethique et la spiritualité qui reste l'un des recueils les plus largement diffuses et etudies dans le monde musulman contemporain, ainsi que d'un commentaire très etudie du Sahih Muslim et d'un recueil de quarante hadiths fondamentaux (Al-Arba'in an-Nawawiyya) frequemment utilise comme premier support d'apprentissage du hadith. Son ouvrage de fiqh Minhaj at-Talibin demeure une référence classique au sein de l'école shafi'ite.",
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
    bio: "Editeur et transmetteur de la biographie du Prophète ﷺ (As-Sira an-Nabawiyya), a partir de la version plus ancienne et plus volumineuse d'Ibn Ishaq (m. 767), aujourd'hui perdue dans sa forme originelle et connue principalement a travers cette édition. Ibn Hisham revisa le texte d'Ibn Ishaq en retirant certains éléments qu'il jugeait peu fiables ou hors sujet (notamment de la poésie preislamique) et en ajoutant ses propres annotations philologiques et geographiques, produisant une version plus concise et mieux structurée. Son ouvrage demeure, avec les chroniques d'At-Tabari, l'une des sources sira les plus anciennes et les plus citees dans l'étude de la vie du Prophète ﷺ.",
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
