import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { concepts, conceptDivergences, conceptRelations, sources } from "../schema";

/**
 * Encyclopédie des concepts islamiques. Definitions standards, non
 * sectaires, compilees a partir du Coran et de la terminologie islamique
 * établie. Les divergences de compréhension entre courants sont notees
 * separement (concept_divergences), sans trancher.
 */

const QURAN_SOURCE_TITLE = "Le Coran (référence terminologique)";

interface ConceptSeed {
  term: string;
  termArabic: string;
  slug: string;
  definition: string;
  origin: string;
  explanation: string;
  relatedSlugs: string[];
  divergence?: string;
}

const CONCEPTS: ConceptSeed[] = [
  {
    term: "Tawhid",
    termArabic: "التوحيد",
    slug: "tawhid",
    definition: "L'unicité absolue de Dieu (Allah), pilier central de la croyance islamique.",
    origin: "Racine arabe w-h-d, exprimant l'idee d'unicité.",
    explanation:
      "Le tawhid affirme qu'il n'existe qu'un seul Dieu, sans associe, sans égal et sans partenaire, dans Son essence, Ses attributs et Son adoration. Il est traditionnellement decompose en trois volets par les théologiens : l'unicité de la seigneurie (rububiyya), l'unicité de l'adoration (uluhiyya) et l'unicité des noms et attributs divins (asma wa sifat).",
    relatedSlugs: ["shirk", "iman"],
  },
  {
    term: "Salah",
    termArabic: "الصلاة",
    slug: "salah",
    definition: "La prière rituelle islamique, effectuee cinq fois par jour.",
    origin: "Terme coranique, deuxième pilier de l'Islam.",
    explanation:
      "La salah designe la prière rituelle obligatoire accomplie cinq fois par jour a des horaires determines, comprenant des postures et récitations spécifiques. Elle constitue le deuxième des cinq piliers de l'Islam et est considérée comme le lien direct entre le croyant et Dieu.",
    relatedSlugs: ["wudu", "iman"],
  },
  {
    term: "Zakat",
    termArabic: "الزكاة",
    slug: "zakat",
    definition: "L'aumone obligatoire prelevee annuellement sur certains biens.",
    origin: "Racine arabe z-k-w, évoquant la purification et la croissance.",
    explanation:
      "La zakat est une aumone obligatoire, troisième pilier de l'Islam, due annuellement par les musulmans disposant de biens depassant un seuil minimal (nisab), et redistribuee a des categories de beneficiaires définies par le Coran (sourate At-Tawba, 9:60). Elle est concue à la fois comme un acte d'adoration et un mecanisme de redistribution sociale.",
    relatedSlugs: ["sawm"],
  },
  {
    term: "Sawm",
    termArabic: "الصوم",
    slug: "sawm",
    definition: "Le jeune, notamment celui du mois de Ramadan.",
    origin: "Terme coranique, quatrième pilier de l'Islam.",
    explanation:
      "Le sawm designe l'abstinence de nourriture, de boisson et de rapports intimes du lever au coucher du soleil, principalement durant le mois de Ramadan. Quatrième pilier de l'Islam, il est présente dans le Coran (sourate Al-Baqara, 2:183) comme un moyen d'acceder à la piété (taqwa).",
    relatedSlugs: ["taqwa", "zakat"],
  },
  {
    term: "Hajj",
    termArabic: "الحج",
    slug: "hajj",
    definition: "Le grand pelerinage à La Mecque, cinquième pilier de l'Islam.",
    origin: "Terme coranique associe au sanctuaire de la Kaaba.",
    explanation:
      "Le hajj est le pelerinage annuel à La Mecque, obligatoire une fois dans la vie pour tout musulman qui en à la capacite physique et financiere. Il comprend une série de rites accomplis durant le mois de Dhul-Hijja, sur les lieux associes à la tradition d'Ibrahim et Isma'il.",
    relatedSlugs: [],
  },
  {
    term: "Iman",
    termArabic: "الإيمان",
    slug: "iman",
    definition: "La foi islamique, comprenant la croyance intérieure et son expression.",
    origin: "Racine arabe a-m-n, évoquant la securite et la confiance.",
    explanation:
      "L'iman designe la foi, généralement decrite comme reposant sur six articles : la croyance en Dieu, en Ses anges, en Ses livres, en Ses messagers, au Jour dernier et au décret divin (qadar). Elle est étroitement liée à l'islam (la soumission pratique) et à l'ihsan (l'excellence spirituelle).",
    relatedSlugs: ["tawhid", "ihsan"],
    divergence:
      "Les théologiens divergent sur la définition précise de l'iman : pour les hanafites et maturidites, l'iman relève essentiellement de la croyance du cœur et de son expression verbale, tandis que pour d'autres courants, dont une partie des ash'arites et les hanbalites/atharites, les œuvres font partie integrante de l'iman, qui peut ainsi augmenter ou diminuer.",
  },
  {
    term: "Ihsan",
    termArabic: "الإحسان",
    slug: "ihsan",
    definition: "L'excellence spirituelle dans l'adoration et le comportement.",
    origin: "Racine arabe h-s-n, évoquant la beaute et le bien-faire.",
    explanation:
      "L'ihsan est défini dans un hadith célèbre (rapporte par Muslim) comme le fait \"d'adorer Dieu comme si tu Le voyais, et si tu ne Le vois pas, sache que Lui te voit\". Il représente le degré le plus élevé de la pratique religieuse, au-dela de la simple observance des règles (islam) et de la croyance (iman).",
    relatedSlugs: ["iman", "taqwa"],
  },
  {
    term: "Taqwa",
    termArabic: "التقوى",
    slug: "taqwa",
    definition: "La conscience de Dieu et la crainte révérencielle qui en découle.",
    origin: "Racine arabe w-q-y, évoquant la protection.",
    explanation:
      "La taqwa designe un état de conscience constante de Dieu, conduisant a se proteger de Son mécontentement par l'obéissance et l'évitement du peche. Le Coran la présente frequemment comme le critere de la supériorité spirituelle (sourate Al-Hujurat, 49:13).",
    relatedSlugs: ["ihsan", "sawm"],
  },
  {
    term: "Shirk",
    termArabic: "الشرك",
    slug: "shirk",
    definition: "Le fait d'associer des partenaires ou des égaux à Dieu.",
    origin: "Racine arabe sh-r-k, évoquant l'association et le partage.",
    explanation:
      "Le shirk est l'oppose du tawhid : il consiste a attribuer à une entite autre que Dieu des qualites, un pouvoir ou un droit à l'adoration qui Lui reviennent exclusivement. Il est considère dans le Coran comme la faute la plus grave (sourate An-Nisa, 4:48).",
    relatedSlugs: ["tawhid"],
  },
  {
    term: "Fiqh",
    termArabic: "الفقه",
    slug: "fiqh",
    definition: "La compréhension et l'élaboration du droit islamique.",
    origin: "Racine arabe f-q-h, évoquant la compréhension approfondie.",
    explanation:
      "Le fiqh designe la discipline juridique islamique, c'est-a-dire l'ensemble des règles pratiques deduites des sources scripturaires (Coran, Sunna) par les savants, à l'aide d'une méthodologie (usul al-fiqh). Il couvre aussi bien le culte (ibadat) que les relations sociales (mu'amalat).",
    relatedSlugs: [],
  },
  {
    term: "Sunnah",
    termArabic: "السنة",
    slug: "sunnah",
    definition: "La tradition et la pratique du Prophète Muhammad ﷺ.",
    origin: "Terme arabe designant à l'origine une voie ou une pratique établie.",
    explanation:
      "La sunnah renvoie à l'ensemble des paroles, actes et approbations tacites attribues au Prophète ﷺ, transmis par la tradition du hadith. Elle constitue, avec le Coran, l'une des deux sources scripturaires principales de l'Islam.",
    relatedSlugs: ["fiqh", "bidah"],
  },
  {
    term: "Bid'ah",
    termArabic: "البدعة",
    slug: "bidah",
    definition: "Une innovation introduite dans la pratique religieuse.",
    origin: "Racine arabe b-d-'a, évoquant la création d'une chose nouvelle.",
    explanation:
      "La bid'ah designe une pratique religieuse introduite sans précédent dans le Coran ou la Sunna. La portée exacte du terme - notamment la distinction entre innovations religieuses condamnables et nouveautes purement pratiques (moyens de communication, outils, etc.) - fait l'objet de discussions classiques parmi les savants.",
    relatedSlugs: ["sunnah"],
  },
  {
    term: "Wudu",
    termArabic: "الوضوء",
    slug: "wudu",
    definition: "Les petites ablutions rituelles preparant à la prière.",
    origin: "Racine arabe w-d-a, évoquant la proprete et l'eclat.",
    explanation:
      "Le wudu est l'ablution rituelle requise avant la prière, decrite dans le Coran (sourate Al-Ma'ida, 5:6) : lavage du visage, des mains et avant-bras, essuyage de la tete et lavage des pieds. Certains actes (voir la section Fiqh/comparateur) sont discutes quant à leur capacite à l'invalider.",
    relatedSlugs: ["salah"],
  },
  {
    term: "Halal",
    termArabic: "الحلال",
    slug: "halal",
    definition: "Ce qui est licite ou permis selon le droit islamique.",
    origin: "Racine arabe h-l-l, évoquant ce qui est denoue ou autorise.",
    explanation:
      "Le halal designe tout acte, aliment ou pratique autorise par le droit islamique, par opposition au haram (interdit). Le terme est le plus souvent associe à l'alimentation, mais s'applique plus largement à l'ensemble des actes de la vie quotidienne.",
    relatedSlugs: ["haram"],
  },
  {
    term: "Haram",
    termArabic: "الحرام",
    slug: "haram",
    definition: "Ce qui est illicite ou formellement interdit selon le droit islamique.",
    origin: "Racine arabe h-r-m, évoquant l'interdiction et le caractere sacre.",
    explanation:
      "Le haram designe un acte formellement interdit par les textes scripturaires, dont l'accomplissement constitue une faute. Il s'oppose au halal (licite) dans la classification des actions en droit islamique (ahkam), qui comprend également des categories intermediaires (recommande, deteste, permis neutre).",
    relatedSlugs: ["halal"],
  },
  {
    term: "Qadar",
    termArabic: "القدر",
    slug: "qadar",
    definition: "Le décret et la prédestination divine.",
    origin: "Racine arabe q-d-r, évoquant la mesure et la determination.",
    explanation:
      "Le qadar renvoie à la croyance selon laquelle Dieu connait et a décrété de toute éternité tout ce qui adviendra, tout en laissant à l'être humain une responsabilité reelle sur ses actes. L'articulation entre décret divin et libre arbitre humain a fait l'objet de debats théologiques historiques (notamment avec le mu'tazilisme).",
    relatedSlugs: ["iman"],
  },
  {
    term: "Tawakkul",
    termArabic: "التوكل",
    slug: "tawakkul",
    definition: "L'abandon confiant en Dieu après avoir pris les moyens nécessaires.",
    origin: "Racine arabe w-k-l, évoquant le fait de confier une affaire a quelqu'un.",
    explanation:
      "Le tawakkul designe la confiance placee en Dieu quant à l'issue des affaires, tout en accomplissant les efforts et moyens raisonnables à sa disposition. Il est souvent illustre par le hadith invitant a \"attacher sa chamelle, puis s'en remettre à Dieu\".",
    relatedSlugs: ["qadar"],
  },
  {
    term: "Sabr",
    termArabic: "الصبر",
    slug: "sabr",
    definition: "La patience et l'endurance face aux épreuves.",
    origin: "Racine arabe s-b-r, évoquant le fait de se retenir et d'endurer.",
    explanation:
      "Le sabr designe la capacite a perseverer avec constance face aux difficultes, aux tentations ou dans l'accomplissement des obligations religieuses. Le Coran le présente a de nombreuses reprises comme une vertu recompensee sans limite (sourate Az-Zumar, 39:10).",
    relatedSlugs: ["tawakkul"],
  },
  {
    term: "Kufr",
    termArabic: "الكفر",
    slug: "kufr",
    definition: "Le rejet ou l'occultation de la foi en Dieu.",
    origin: "Racine arabe k-f-r, évoquant à l'origine le fait de couvrir ou dissimuler.",
    explanation:
      "Le kufr designe le rejet de la foi islamique, que ce soit par négation explicite ou par occultation volontaire de la vérité recue. Le terme est l'oppose conceptuel de l'iman, et sa qualification précise dans des cas individuels est traditionnellement traitee avec une grande prudence méthodologique par les savants.",
    relatedSlugs: ["iman", "shirk"],
  },
  {
    term: "Umma",
    termArabic: "الأمة",
    slug: "umma",
    definition: "La communauté des croyants musulmans, au-dela des frontieres et des origines.",
    origin: "Racine arabe a-m-m, évoquant un groupe ou une nation.",
    explanation:
      "L'umma designe la communauté globale des musulmans, concue comme une entite unie par la foi plutôt que par l'origine ethnique, linguistique ou nationale. Le concept trouvé ses fondements dans le Coran et dans la \"Constitution de Médine\" établie par le Prophète ﷺ.",
    relatedSlugs: ["tawhid"],
  },
  // --- Aqida : au-dela du tawhid et de l'iman ---
  {
    term: "Rububiyya (Seigneurie divine)",
    termArabic: "الربوبية",
    slug: "rububiyya",
    definition: "L'unicité de Dieu en tant que Seigneur, créateur et pourvoyeur unique de l'univers.",
    origin: "Racine arabe r-b-b, évoquant la seigneurie et l'entretien.",
    explanation:
      "Le tawhid ar-rububiyya est le premier des trois volets classiquement distingues dans l'étude du tawhid : il affirme que Dieu seul créé, possède, gouverne et pourvoit à l'univers, sans associe dans ces fonctions.\n\nLes théologiens soulignent que ce volet du tawhid etait déjà largement reconnu par les polytheistes contemporains du Prophète ﷺ, comme le rappelle le Coran (sourate Al-Ankabut, 29:61) : reconnaitre Dieu comme créateur ne suffit donc pas a lui seul, d'où la nécessite des deux autres volets, l'uluhiyya et les asma wa sifat.",
    relatedSlugs: ["tawhid", "uluhiyya", "asma-wa-sifat"],
  },
  {
    term: "Uluhiyya (Unicité de l'adoration)",
    termArabic: "الألوهية",
    slug: "uluhiyya",
    definition: "L'unicité de Dieu dans le droit exclusif a être adore.",
    origin: "Racine arabe a-l-h, dont derive le nom Allah.",
    explanation:
      "Le tawhid al-uluhiyya, second volet du tawhid, affirme que Dieu seul a le droit d'être adore, à l'exclusion de toute autre entite - qu'il s'agisse de prières, de sacrifices, de vœux ou de tout autre acte d'adoration.\n\nCe volet est présente par les théologiens comme le cœur du message de tous les prophètes, chacun ayant appele son peuple a n'adorer que Dieu seul (sourate An-Nahl, 16:36).",
    relatedSlugs: ["tawhid", "rububiyya", "shirk"],
  },
  {
    term: "Al-Asma wa-s-Sifat (Noms et attributs divins)",
    termArabic: "الأسماء والصفات",
    slug: "asma-wa-sifat",
    definition: "L'unicité de Dieu dans Ses noms et attributs, tels qu'Il Se les attribue Lui-même.",
    origin: "Composition arabe de asma (noms) et sifat (attributs).",
    explanation:
      "Ce troisième volet du tawhid consiste a affirmer les noms et attributs que Dieu S'attribue Lui-même dans le Coran et que le Prophète ﷺ Lui attribue, sans les nier, sans les denaturer, sans en demander la modalite précise, et sans les comparer à la création.\n\nLa manière précise d'aborder ces textes - affirmation directe sans interprétation (approche atharite) ou interprétation allegorique de certains termes ambigus (approche ash'arite/maturidite) - constitue l'un des points de divergence historiques majeurs de la théologie islamique classique, presentes de manière descriptive dans la section Écoles de cette plateforme.",
    relatedSlugs: ["tawhid", "rububiyya", "uluhiyya"],
  },
  {
    term: "Nubuwwa (Prophétie)",
    termArabic: "النبوة",
    slug: "nubuwwa",
    definition: "L'institution divine de la prophétie, par laquelle Dieu communique Son message à l'humanite.",
    origin: "Racine arabe n-b-a, évoquant l'annonce d'une information importante.",
    explanation:
      "La nubuwwa designe la mission confiee par Dieu a des individus choisis - les prophètes (anbiya) et messagers (rusul) - pour transmettre Son message à l'humanite. La croyance en la prophétie de Muhammad ﷺ, dernier maillon de cette chaine, est l'un des deux temoignages de la shahada.\n\nLa distinction entre nabi (prophète recevant une révélation sans mission de la transmettre à un nouveau peuple) et rasul (messager charge d'un message, et souvent d'une loi nouvelle) est une distinction classique, tous les rusul etant consideres comme des anbiya, mais non l'inverse.",
    relatedSlugs: ["wahy", "iman"],
  },
  {
    term: "Wahy (Révélation)",
    termArabic: "الوحي",
    slug: "wahy",
    definition: "La révélation divine transmise aux prophètes.",
    origin: "Racine arabe w-h-y, évoquant une communication rapide et discrete.",
    explanation:
      "Le wahy designe le processus par lequel Dieu communique Son message aux prophètes, que ce soit directement, par inspiration, ou par l'intermédiaire d'un ange (généralement identifie a Jibril). Le Coran est considère comme le wahy transmis intégralement et littéralement au Prophète ﷺ.\n\nLa tradition islamique distingue le wahy matlu (récite, c'est-a-dire le texte coranique lui-même) du wahy ghayr matlu (non récite, dont le sens général aurait été inspiré mais formule par le Prophète ﷺ, comme les hadiths) - une distinction qui a des implications sur le statut juridique et rituel de chacun.",
    relatedSlugs: ["nubuwwa", "sunnah"],
  },
  {
    term: "Al-Akhira (L'au-dela)",
    termArabic: "الآخرة",
    slug: "akhira",
    definition: "La vie future, après la résurrection et le Jugement dernier.",
    origin: "Terme arabe signifiant littéralement \"la derniere\", par opposition a ad-dunya (la vie présente).",
    explanation:
      "La croyance en l'akhira, l'un des six articles de la foi, affirme qu'après la mort et la résurrection, chaque être humain sera juge sur ses actes et connaitra une retribution éternelle, au paradis (jannah) ou en enfer (jahannam).\n\nCette croyance est présentée dans le Coran comme structurant profondément l'éthique islamique : la vie présente (ad-dunya) y est decrite comme un lieu d'épreuve temporaire, dont la valeur se mesure à l'aune de ses consequences dans l'au-dela.",
    relatedSlugs: ["jannah", "jahannam", "iman"],
  },
  {
    term: "Al-Jannah (Le Paradis)",
    termArabic: "الجنة",
    slug: "jannah",
    definition: "Le séjour éternel de récompense promis aux croyants dans l'au-dela.",
    origin: "Terme arabe signifiant littéralement \"jardin\".",
    explanation:
      "La jannah designe, dans la croyance islamique, le lieu de felicite éternelle accorde par la grâce de Dieu a ceux qu'Il agree, decrit dans le Coran par de nombreuses images (jardins, rivieres, compagnie des justes) comprises par la majorite des exégètes comme des réalités véritables, dont la nature exacte demeure connue de Dieu seul.",
    relatedSlugs: ["akhira", "jahannam"],
  },
  {
    term: "Jahannam (L'Enfer)",
    termArabic: "جهنم",
    slug: "jahannam",
    definition: "Le séjour de châtiment promis dans l'au-dela a ceux que Dieu y destine.",
    origin: "Terme arabe d'origine semitique ancienne, designant un abime profond.",
    explanation:
      "Jahannam designe le lieu de châtiment dans l'au-dela, decrit dans le Coran comme la consequence du rejet obstine de la foi ou de fautes graves non pardonnees. La tradition islamique insiste sur le fait que la misericorde de Dieu y demeure première, et que le statut final de chaque individu Lui appartient seul.",
    relatedSlugs: ["akhira", "jannah"],
  },
  {
    term: "Malaika (Les Anges)",
    termArabic: "الملائكة",
    slug: "malaika",
    definition: "Des créatures spirituelles créées par Dieu pour L'adorer et executer Ses ordres.",
    origin: "Terme arabe derive de la racine l-a-k, évoquant le message et la mission.",
    explanation:
      "La croyance aux anges, second article de la foi, reconnaît l'existence d'entites créées à partir de lumiere, depourvues de libre arbitre au sens humain et vouees à une obéissance totale à Dieu. Certains anges sont nommés dans le Coran et charges de missions spécifiques, comme Jibril (la révélation), Mika'il ou Israfil.\n\nLes anges sont distingues à la fois des jinns (créés de feu, dotes de libre arbitre) et des demons, avec lesquels ils ne doivent pas être confondus.",
    relatedSlugs: ["iman", "wahy", "jinn"],
  },
  {
    term: "Jinn",
    termArabic: "الجن",
    slug: "jinn",
    definition: "Des créatures invisibles à l'œil humain, créés de feu, dotées de libre arbitre.",
    origin: "Racine arabe j-n-n, évoquant ce qui est cache ou dissimule.",
    explanation:
      "Les jinns sont, selon le Coran, des créatures créés d'une flamme de feu (sourate Al-Hijr, 15:27), dotées comme les humains d'un libre arbitre et donc soumises à une responsabilité religieuse - certains croyant, d'autres non, comme le rapporte la sourate Al-Jinn. Le diable (Shaytan/Iblis) est traditionnellement identifie comme un jinn, non comme un ange dechu.",
    relatedSlugs: ["malaika", "shaytan"],
  },
  {
    term: "Shaytan (Satan)",
    termArabic: "الشيطان",
    slug: "shaytan",
    definition: "La figure du diable, incitant les êtrès humains et les jinns à la désobéissance envers Dieu.",
    origin: "Racine arabe sh-t-n, évoquant l'éloignement et la rebellion.",
    explanation:
      "Iblis, identifie par le Coran comme un jinn, refusa par orgueil de se prosterner devant Adam sur ordre de Dieu et devint ainsi Shaytan, symbole et instigateur de la désobéissance. Le terme shaytan designe par extension toute force ou tentation poussant vers le mal, chez les jinns comme chez les humains.\n\nLe Coran précise que le pouvoir du Shaytan sur l'être humain se limite à la suggestion (waswasa) : il ne peut contraindre personne, la responsabilité finale des actes revenant a chaque individu.",
    relatedSlugs: ["jinn", "shirk"],
  },
  // --- Akhlaq : éthique et caractere ---
  {
    term: "Ikhlas (Sincérité)",
    termArabic: "الإخلاص",
    slug: "ikhlas",
    definition: "La sincérité de l'intention, consistant a accomplir un acte pour Dieu seul.",
    origin: "Racine arabe kh-l-s, évoquant la purete et l'exemption de tout melange.",
    explanation:
      "L'ikhlas designe le fait de purifier son intention (niyyah) dans l'adoration et les bonnes actions, en les accomplissant uniquement pour rechercher l'agrement de Dieu, sans rechercher la reconnaissance ou l'admiration d'autrui. Un hadith célèbre rapporte que \"les actes ne valent que par les intentions\" (Al-Bukhari, Muslim).\n\nL'ikhlas est traditionnellement présente comme la condition d'acceptation de toute adoration, quelle que soit sa forme extérieure, et s'oppose directement à la riya.",
    relatedSlugs: ["riya", "ihsan"],
  },
  {
    term: "Riya (Ostentation)",
    termArabic: "الرياء",
    slug: "riya",
    definition: "Le fait d'accomplir un acte religieux pour être vu ou loue par les gens plutôt que pour Dieu.",
    origin: "Racine arabe r-a-y, évoquant le fait de voir et de montrer.",
    explanation:
      "La riya consiste a accomplir un acte d'adoration ou une bonne action en recherchant, en tout ou partie, le regard et l'estime des autres plutôt que l'agrement exclusif de Dieu. Elle est parfois designee dans la tradition comme \"le petit associationnisme\" (ash-shirk al-asghar), en raison du risque qu'elle fait courir à la sincérité de l'intention.",
    relatedSlugs: ["ikhlas", "shirk"],
  },
  {
    term: "Tawadu' (Humilite)",
    termArabic: "التواضع",
    slug: "tawadu",
    definition: "L'humilite, l'absence d'orgueil envers Dieu et envers autrui.",
    origin: "Racine arabe w-d-a, évoquant le fait de s'abaisser.",
    explanation:
      "Le tawadu' designe une disposition de modestie et d'humilite, tant dans la relation au Créateur (reconnaitre sa dépendance totale envers Dieu) que dans les relations sociales (ne pas se considerer supérieur aux autres). Il est présente dans plusieurs hadiths comme une vertu elevant en réalité le statut de celui qui la pratique, à l'inverse du kibr (orgueil).",
    relatedSlugs: ["kibr", "ihsan"],
  },
  {
    term: "Kibr (Orgueil)",
    termArabic: "الكبر",
    slug: "kibr",
    definition: "L'orgueil, consistant a rejeter la vérité ou a mepriser autrui par sentiment de supériorité.",
    origin: "Racine arabe k-b-r, évoquant la grandeur.",
    explanation:
      "Le kibr est défini dans un hadith rapporte par Muslim comme \"le rejet de la vérité et le mepris des gens\". Il est présente comme l'un des vices les plus graves en Islam, l'exemple coranique le plus marquant etant le refus d'Iblis de se prosterner devant Adam par sentiment de supériorité.",
    relatedSlugs: ["tawadu", "shaytan"],
  },
  {
    term: "Hilm (Maîtrise de soi)",
    termArabic: "الحلم",
    slug: "hilm",
    definition: "La maîtrise de soi et la retenue face à la colère ou à la provocation.",
    origin: "Racine arabe h-l-m, évoquant la douceur et la patience réfléchie.",
    explanation:
      "Le hilm designe la capacite a rester calme, mesure et indulgent face à une provocation, une injustice ou une colère justifiee, plutôt que de reagir avec precipitation. Cette vertu est particulièrement associee dans la Sira à l'attitude du Prophète ﷺ envers ceux qui l'ont maltraite, comme lors de l'épisode de Ta'if.",
    relatedSlugs: ["sabr", "adl"],
  },
  {
    term: "Adl (Justice)",
    termArabic: "العدل",
    slug: "adl",
    definition: "La justice et l'équité, valeur centrale de l'éthique islamique.",
    origin: "Racine arabe a-d-l, évoquant l'équilibre et la droiture.",
    explanation:
      "L'adl designe l'obligation de rendre justice et d'agir avec équité, y compris envers ceux que l'on n'apprecie pas. Le Coran (sourate An-Nisa, 4:135 ; Al-Ma'ida, 5:8) insiste explicitement sur le fait que l'inimitie envers autrui ne doit jamais conduire à l'injustice.",
    relatedSlugs: ["zulm", "hilm"],
  },
  {
    term: "Rahma (Misericorde)",
    termArabic: "الرحمة",
    slug: "rahma",
    definition: "La misericorde, attribut divin premier et vertu recommandee entre les croyants.",
    origin: "Racine arabe r-h-m, partagee avec le mot \"matrice\" (rahim), évoquant la tendresse.",
    explanation:
      "La rahma est l'attribut divin le plus frequemment cite dans le Coran, chaque sourate (sauf une) s'ouvrant par la formule \"Au nom de Dieu, le Tout Misericordieux, le Très Misericordieux\". Elle designe aussi la vertu de compassion recommandee au croyant envers les autres créatures, le Prophète ﷺ etant lui-même decrit comme \"une misericorde pour l'univers\" (sourate Al-Anbiya, 21:107).",
    relatedSlugs: ["ihsan", "adl"],
  },
  {
    term: "Amanah (Le depot de confiance)",
    termArabic: "الأمانة",
    slug: "amanah",
    definition: "La fidélité aux engagements et aux responsabilites qui nous sont confiees.",
    origin: "Racine arabe a-m-n, la même que celle du mot iman.",
    explanation:
      "L'amanah designe la fidélité envers tout ce qui est confie à une personne - biens, secrets, responsabilites publiques ou privees. Le Coran (sourate Al-Ahzab, 33:72) présente même la responsabilité religieuse elle-même comme un \"depot de confiance\" propose aux cieux, à la terre et aux montagnes, qui l'ont refusee, et que l'être humain a accepte de porter.",
    relatedSlugs: ["sidq", "adl"],
  },
  {
    term: "Sidq (Véracité)",
    termArabic: "الصدق",
    slug: "sidq",
    definition: "La véracité et l'honnêteté dans la parole et les actes.",
    origin: "Racine arabe s-d-q, dont derive également le mot sadaqa (aumone).",
    explanation:
      "Le sidq designe la conformite entre ce que l'on dit, ce que l'on pense et ce que l'on fait. Il est présente dans le Coran comme étroitement lie à la foi (sourate At-Tawba, 9:119), et le Prophète ﷺ etait connu, avant même sa mission prophétique, sous le surnom d'\"Al-Amin\" (le digne de confiance) en raison de sa véracité reconnue par tous.",
    relatedSlugs: ["amanah", "ikhlas"],
  },
  {
    term: "Haya' (Pudeur)",
    termArabic: "الحياء",
    slug: "hayaa",
    definition: "La pudeur et la retenue morale face à ce qui est inconvenant.",
    origin: "Racine arabe h-y-y, partagee avec le mot \"vie\", évoquant la sensibilite morale.",
    explanation:
      "Le haya' designe un sentiment de retenue qui detourne des comportements inconvenants ou immoraux, tant dans l'apparence que dans le comportement. Un hadith rapporte que \"le haya' fait partie de la foi\" (Al-Bukhari, Muslim), le présentant comme une vertu structurante plutôt que comme une simple timidite.",
    relatedSlugs: ["sidq"],
  },
  {
    term: "Ghiba (Médisance)",
    termArabic: "الغيبة",
    slug: "ghiba",
    definition: "Le fait de parler d'une personne absente d'une manière qui lui déplairait.",
    origin: "Racine arabe gh-y-b, évoquant l'absence.",
    explanation:
      "La ghiba, définie par le Prophète ﷺ comme le fait de \"mentionner ton frère d'une manière qu'il n'aimerait pas\" (rapporte par Muslim), même si le propos est vrai, est explicitement condamnee dans le Coran, comparee a \"manger la chair de son frère mort\" (sourate Al-Hujurat, 49:12).",
    relatedSlugs: ["zulm"],
  },
  {
    term: "Zulm (Injustice)",
    termArabic: "الظلم",
    slug: "zulm",
    definition: "L'injustice, consistant a placer une chose hors de sa juste place.",
    origin: "Racine arabe z-l-m, évoquant l'obscurite et le deplacement hors du droit chemin.",
    explanation:
      "Le zulm designe, dans son sens le plus large, le fait de placer une chose là où elle ne devrait pas être - envers Dieu (le shirk etant qualifié de \"zulm immense\", sourate Luqman, 31:13), envers soi-même, ou envers autrui. Il constitue l'opposé direct de l'adl (justice).",
    relatedSlugs: ["adl", "shirk"],
  },
  // --- Fiqh : notions juridiques ---
  {
    term: "Nikah (Mariage)",
    termArabic: "النكاح",
    slug: "nikah",
    definition: "Le contrat de mariage islamique, union licite entre un homme et une femme.",
    origin: "Terme coranique designant l'union matrimoniale.",
    explanation:
      "Le nikah est un contrat encadre par le droit islamique, comprenant des conditions (consentement, témoins, dot) et des droits et devoirs reciproques entre les epoux, présente dans le Coran comme un signe divin favorisant la tranquillite et l'affection mutuelle (sourate Ar-Rum, 30:21). Les modalites précises de certaines de ses conditions varient selon les écoles juridiques.",
    relatedSlugs: ["fiqh"],
  },
  {
    term: "Riba (Usure)",
    termArabic: "الربا",
    slug: "riba",
    definition: "L'intérêt ou le surplus injustifié percu dans un prêt ou un échange, interdit en Islam.",
    origin: "Racine arabe r-b-w, évoquant l'augmentation et le surplus.",
    explanation:
      "Le riba designe tout surplus injustifié exige dans un prêt d'argent ou dans certains échanges de biens de même categorie, formellement interdit par le Coran (sourate Al-Baqara, 2:275-279). Cette interdiction est à l'origine du développement de la finance islamique contemporaine, qui cherche des structures contractuelles alternatives (partage de profits et pertes, vente a marge...).",
    relatedSlugs: ["fiqh", "halal", "haram"],
  },
  {
    term: "Ijtihad (Effort d'interprétation)",
    termArabic: "الاجتهاد",
    slug: "ijtihad",
    definition: "L'effort intellectuel fourni par un juriste qualifié pour déduire une règle a partir des sources.",
    origin: "Racine arabe j-h-d, évoquant l'effort soutenu.",
    explanation:
      "L'ijtihad designe l'effort methodique fourni par un savant qualifié (mujtahid) pour déduire une règle juridique a partir du Coran, de la Sunna et des outils de l'usul al-fiqh, lorsque la question n'est pas explicitement tranchee par un texte univoque. Les grands imams fondateurs des écoles juridiques sont les exemples classiques de mujtahid absolu.",
    relatedSlugs: ["taqlid", "fiqh"],
  },
  {
    term: "Taqlid (Suivi d'une autorite juridique)",
    termArabic: "التقليد",
    slug: "taqlid",
    definition: "Le fait de suivre l'avis d'un savant ou d'une école juridique sans en examiner soi-même les preuves détaillées.",
    origin: "Racine arabe q-l-d, évoquant le fait de porter un collier, au sens figure de se referer à une autorite.",
    explanation:
      "Le taqlid designe le fait, pour un non-specialiste, de suivre les conclusions juridiques d'un savant ou d'une école reconnue plutôt que de déduire lui-même une règle a partir des textes. La question de sa portée - notamment l'obligation ou non de suivre une seule école en toute chose - a fait l'objet de discussions méthodologiques classiques parmi les juristes.",
    relatedSlugs: ["ijtihad", "fiqh"],
  },
  {
    term: "Ijma' (Consensus)",
    termArabic: "الإجماع",
    slug: "ijma",
    definition: "Le consensus des savants qualifiés d'une époque sur une question de droit.",
    origin: "Racine arabe j-m-a, évoquant le rassemblement et l'accord.",
    explanation:
      "L'ijma' designe l'accord unanime des juristes qualifiés d'une generation sur une règle donnée, reconnu par la majorite des écoles sunnites comme la troisième source du droit islamique après le Coran et la Sunna. Sa portée pratique reste toutefois discutee, tant sur les modalites de son établissement que sur son perimetre exact.",
    relatedSlugs: ["qiyas", "fiqh"],
  },
  {
    term: "Qiyas (Raisonnement analogique)",
    termArabic: "القياس",
    slug: "qiyas",
    definition: "Le raisonnement par analogie, etendant une règle connue à un cas nouveau partageant sa cause.",
    origin: "Racine arabe q-y-s, évoquant la mesure et la comparaison.",
    explanation:
      "Le qiyas consiste a étendre une règle établie par un texte à un cas non explicitement traité, sur la base d'une cause commune ('illa) identifiee entre les deux situations. Quatrième source classique du droit islamique, son usage et ses limites varient sensiblement d'une école à l'autre, les hanafites en faisant un usage plus systématique que les hanbalites, par exemple.",
    relatedSlugs: ["ijma", "fiqh"],
  },
  // --- Sciences du Coran et du hadith ---
  {
    term: "Isnad (Chaine de transmission)",
    termArabic: "الإسناد",
    slug: "isnad",
    definition: "La chaine des transmetteurs successifs d'un hadith, remontant jusqu'au Prophète ﷺ.",
    origin: "Racine arabe s-n-d, évoquant le fait de s'appuyer sur quelque chose.",
    explanation:
      "L'isnad est la liste des rapporteurs successifs par lesquels un hadith a été transmis. Son examen minutieux - continuite, fiabilite et memoire de chaque rapporteur - constitue le cœur de la méthodologie d'authentification des hadiths (mustalah al-hadith), une specificite méthodologique de la tradition islamique.",
    relatedSlugs: ["sunnah"],
  },
  {
    term: "Naskh (Abrogation)",
    termArabic: "النسخ",
    slug: "naskh",
    definition: "Le remplacement de la portée pratique d'un verset par un autre verset révèle ulterieurement.",
    origin: "Racine arabe n-s-kh, évoquant la copie et le remplacement.",
    explanation:
      "Le naskh designe les cas, discutes par les exégètes classiques, ou un verset coranique voit sa portée législative modifiee par un verset révèle plus tardivement sur le même sujet. Cette discipline est traitee avec une grande prudence méthodologique, les commentateurs distinguant les cas d'abrogation averee des cas de simple specification ou de complementarite entre versets.",
    relatedSlugs: ["wahy"],
  },
  {
    term: "Asbab al-Nuzul (Circonstances de la révélation)",
    termArabic: "أسباب النزول",
    slug: "asbab-al-nuzul",
    definition: "Les circonstances historiques ayant entoure la révélation d'un verset ou d'un passage coranique.",
    origin: "Composition arabe de asbab (causes) et nuzul (descente, révélation).",
    explanation:
      "L'étude des asbab al-nuzul vise a identifier le contexte precis - une question posee au Prophète ﷺ, un événement particulier - dans lequel un verset a été révèle, afin de mieux en saisir la portée et d'éviter une lecture isolee de son contexte historique.",
    relatedSlugs: ["naskh", "wahy"],
  },
  // --- Adoration et spiritualite ---
  {
    term: "Dhikr (Rappel de Dieu)",
    termArabic: "الذكر",
    slug: "dhikr",
    definition: "Le rappel et l'evocation de Dieu, par la parole ou par le cœur.",
    origin: "Racine arabe dh-k-r, évoquant la memoire et la mention.",
    explanation:
      "Le dhikr designe toute forme d'evocation de Dieu - formules de glorification, lecture du Coran, ou simple presence du cœur - recommandee frequemment dans le Coran comme une source d'apaisement (sourate Ar-Ra'd, 13:28).",
    relatedSlugs: ["dua", "taqwa"],
  },
  {
    term: "Du'a (Invocation)",
    termArabic: "الدعاء",
    slug: "dua",
    definition: "L'invocation et la supplication adressee à Dieu.",
    origin: "Racine arabe d-a-w, évoquant l'appel.",
    explanation:
      "Le du'a designe l'acte de s'adresser directement à Dieu pour Lui demander Son aide, Son pardon ou Sa guidance, considère dans un hadith rapporte par At-Tirmidhi comme \"l'essence même de l'adoration\".",
    relatedSlugs: ["dhikr", "tawakkul"],
  },
  {
    term: "Tawba (Repentir)",
    termArabic: "التوبة",
    slug: "tawba",
    definition: "Le retour vers Dieu après une faute, par le regret sincère et la résolution de ne pas y revenir.",
    origin: "Racine arabe t-w-b, évoquant le retour.",
    explanation:
      "La tawba designe le processus de repentir sincère, comprenant classiquement la reconnaissance de la faute, le regret, l'arret immédiat de l'acte fautif et la résolution de ne pas y revenir - accompagnee, si la faute concerne un tiers, de la reparation due. Le Coran présente Dieu comme infiniment accueillant envers quiconque se repent sincèrement (sourate Az-Zumar, 39:53).",
    relatedSlugs: ["istighfar"],
  },
  {
    term: "Istighfar (Demande de pardon)",
    termArabic: "الاستغفار",
    slug: "istighfar",
    definition: "La demande explicite du pardon divin.",
    origin: "Racine arabe gh-f-r, évoquant le fait de couvrir et de pardonner.",
    explanation:
      "L'istighfar designe l'acte de demander pardon à Dieu, souvent associe à la tawba dont il constitue l'expression verbale. Le Prophète ﷺ, bien qu'infaillible dans sa mission, est rapporte comme demandant pardon à Dieu de nombreuses fois par jour, présentant ainsi l'istighfar comme une pratique constante plutôt que réservée aux seules fautes graves.",
    relatedSlugs: ["tawba"],
  },
  // --- Communauté et gouvernance ---
  {
    term: "Khilafa (Califat)",
    termArabic: "الخلافة",
    slug: "khilafa",
    definition: "L'institution historique de direction politique de la communauté musulmane après le Prophète ﷺ.",
    origin: "Racine arabe kh-l-f, évoquant la succession.",
    explanation:
      "La khilafa designe l'institution de direction de la communauté établie après le décès du Prophète ﷺ, inauguree par les quatre califes dits \"bien-guidés\" (Abu Bakr, Omar, Uthman, Ali), puis poursuivie sous des formes dynastiques (omeyyade, abbasside...) jusqu'à son abolition formelle en 1924.",
    relatedSlugs: ["shura"],
  },
  {
    term: "Shura (Consultation)",
    termArabic: "الشورى",
    slug: "shura",
    definition: "Le principe de consultation mutuelle dans la prise de decision collective.",
    origin: "Racine arabe sh-w-r, évoquant le fait de consulter.",
    explanation:
      "La shura designe le principe, mentionne dans le Coran (sourate Ash-Shura, 42:38 ; Al Imran, 3:159) recommandant au Prophète ﷺ lui-même de consulter ses Compagnons, applique historiquement à la designation des premiers califes et plus largement présente comme un principe de gouvernance et de prise de decision collective en Islam.",
    relatedSlugs: ["khilafa"],
  },
  {
    term: "Da'wa (Invitation à l'Islam)",
    termArabic: "الدعوة",
    slug: "dawa",
    definition: "L'invitation et la transmission pacifique du message islamique.",
    origin: "Racine arabe d-a-w, évoquant l'appel.",
    explanation:
      "La da'wa designe l'acte de transmettre et d'expliquer le message islamique a autrui, par la parole, l'exemple ou l'ecrit. Le Coran (sourate An-Nahl, 16:125) en précise la méthode recommandee : \"par la sagesse et la belle exhortation\", en excluant toute contrainte (sourate Al-Baqara, 2:256).",
    relatedSlugs: ["nubuwwa"],
  },
];

export async function seedConcepts(db: Database): Promise<void> {
  const [source] = await db
    .insert(sources)
    .values({ title: QURAN_SOURCE_TITLE, type: "book", language: "ar" })
    .onConflictDoNothing()
    .returning();
  const sourceRow = source ?? (await db.query.sources.findFirst({ where: eq(sources.title, QURAN_SOURCE_TITLE) }));

  const idBySlug = new Map<string, string>();

  for (const c of CONCEPTS) {
    const [row] = await db
      .insert(concepts)
      .values({
        term: c.term,
        termArabic: c.termArabic,
        slug: c.slug,
        definition: c.definition,
        origin: c.origin,
        explanation: c.explanation,
        sourceId: sourceRow?.id,
      })
      .onConflictDoUpdate({
        target: concepts.slug,
        set: { term: c.term, termArabic: c.termArabic, definition: c.definition, origin: c.origin, explanation: c.explanation },
      })
      .returning();
    idBySlug.set(c.slug, row.id);
  }

  let relationCount = 0;
  for (const c of CONCEPTS) {
    const conceptId = idBySlug.get(c.slug);
    if (!conceptId) continue;
    for (const relatedSlug of c.relatedSlugs) {
      const relatedId = idBySlug.get(relatedSlug);
      if (!relatedId) continue;
      await db.insert(conceptRelations).values({ conceptId, relatedConceptId: relatedId }).onConflictDoNothing();
      relationCount++;
    }
  }

  let divergenceCount = 0;
  for (const c of CONCEPTS) {
    if (!c.divergence) continue;
    const conceptId = idBySlug.get(c.slug);
    if (!conceptId) continue;
    const existing = await db.query.conceptDivergences.findFirst({ where: eq(conceptDivergences.conceptId, conceptId) });
    if (!existing) {
      await db.insert(conceptDivergences).values({ conceptId, explanation: c.divergence, sourceId: sourceRow?.id });
      divergenceCount++;
    }
  }

  console.log(`Concepts: ${CONCEPTS.length} concepts, ${relationCount} relations, ${divergenceCount} divergences seedes.`);
}
