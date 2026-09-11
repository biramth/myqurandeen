import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { concepts, conceptDivergences, conceptRelations, sources } from "../schema";

/**
 * Encyclopédie des concepts islamiques. Définitions standards, non
 * sectaires, compilées à partir du Coran et de la terminologie islamique
 * établie. Les divergences de compréhension entre courants sont notées
 * séparément (concept_divergences), sans trancher.
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
    origin: "Racine arabe w-h-d, exprimant l'idée d'unicité.",
    explanation:
      "Le tawhid affirme qu'il n'existe qu'un seul Dieu, sans associé, sans égal et sans partenaire, dans Son essence, Ses attributs et Son adoration. Il constitue le premier des deux témoignages de la shahada et l'axe autour duquel s'organise l'ensemble de la doctrine islamique, tout appel prophétique dans le Coran se ramenant, selon la tradition, à ce même message fondamental (sourate An-Nahl, 16:36).\n\nIl est traditionnellement décomposé en trois volets par les théologiens, détaillés séparément sur cette plateforme : l'unicité de la seigneurie (rububiyya), l'unicité de l'adoration (uluhiyya) et l'unicité des noms et attributs divins (asma wa sifat). Son opposé, le shirk, est présenté dans le Coran comme la seule faute que Dieu ne pardonne pas sans repentir sincère (sourate An-Nisa, 4:48).",
    relatedSlugs: ["shirk", "iman"],
  },
  {
    term: "Salah",
    termArabic: "الصلاة",
    slug: "salah",
    definition: "La prière rituelle islamique, effectuée cinq fois par jour.",
    origin: "Terme coranique, deuxième pilier de l'Islam.",
    explanation:
      "La salah désigne la prière rituelle obligatoire accomplie cinq fois par jour à des horaires déterminés par la position du soleil (aube, mi-journée, après-midi, coucher du soleil, nuit), comprenant des postures (station debout, inclinaison, prosternation) et des récitations coraniques spécifiques. Elle constitue le deuxième des cinq piliers de l'Islam, instituée selon la tradition lors du voyage nocturne et de l'ascension du Prophète ﷺ (Isra wal Mi'raj).\n\nElle est considérée comme le lien direct entre le croyant et Dieu, ne nécessitant aucun intermédiaire, et doit être précédée des petites ablutions (wudu). Le Coran (sourate Al-Ankabut, 29:45) la présente comme un rempart contre \"la turpitude et le blâmable\".",
    relatedSlugs: ["wudu", "iman"],
  },
  {
    term: "Zakat",
    termArabic: "الزكاة",
    slug: "zakat",
    definition: "L'aumône obligatoire prélevée annuellement sur certains biens.",
    origin: "Racine arabe z-k-w, évoquant la purification et la croissance.",
    explanation:
      "La zakat est une aumône obligatoire, troisième pilier de l'Islam, due annuellement par les musulmans disposant de biens dépassant un seuil minimal (nisab) conservé pendant une année lunaire complète, généralement calculée à 2,5% pour l'or, l'argent et les avoirs monétaires. Elle est redistribuée à des catégories de bénéficiaires définies explicitement par le Coran (sourate At-Tawba, 9:60), notamment les pauvres, les nécessiteux et les personnes endettées.\n\nElle est conçue à la fois comme un acte d'adoration purifiant les biens de celui qui la verse (d'où sa racine, évoquant la purification et la croissance) et comme un mécanisme structurel de redistribution sociale, distinct de la sadaqah qui reste volontaire et sans montant fixe.",
    relatedSlugs: ["sawm"],
  },
  {
    term: "Sawm",
    termArabic: "الصوم",
    slug: "sawm",
    definition: "Le jeûne, notamment celui du mois de Ramadan.",
    origin: "Terme coranique, quatrième pilier de l'Islam.",
    explanation:
      "Le sawm désigne l'abstinence complète de nourriture, de boisson et de rapports intimes du lever à la tombée du jour, principalement durant le mois lunaire de Ramadan, mois durant lequel la tradition situe le début de la révélation coranique. Quatrième pilier de l'Islam, il est présenté dans le Coran (sourate Al-Baqara, 2:183) comme un moyen d'accéder à la piété (taqwa), et non comme une fin en soi.\n\nCertaines catégories de personnes (malades, voyageurs, femmes enceintes ou allaitantes...) bénéficient de concessions légales (rukhsa) leur permettant de rompre le jeûne sous condition de rattrapage ou de compensation, selon des modalités qui varient d'une école juridique à l'autre.",
    relatedSlugs: ["taqwa", "zakat"],
  },
  {
    term: "Hajj",
    termArabic: "الحج",
    slug: "hajj",
    definition: "Le grand pèlerinage à La Mecque, cinquième pilier de l'Islam.",
    origin: "Terme coranique associé au sanctuaire de la Kaaba.",
    explanation:
      "Le hajj est le pèlerinage annuel à La Mecque, obligatoire une fois dans la vie pour tout musulman qui en a la capacité physique et financière (istita'a). Il comprend une série de rites accomplis durant les premiers jours du mois de Dhul-Hijja - dont la station à Arafat, le sacrifice, la lapidation des stèles à Mina et les circumambulations autour de la Kaaba - sur des lieux associés à la tradition d'Ibrahim et Isma'il.\n\nDistinct de la 'umra (le \"petit pèlerinage\"), qui peut être accompli à tout moment de l'année et comporte moins de rites, le hajj marque chaque année le rassemblement le plus vaste de musulmans venus du monde entier en un même lieu et un même temps.",
    relatedSlugs: [],
  },
  {
    term: "Iman",
    termArabic: "الإيمان",
    slug: "iman",
    definition: "La foi islamique, comprenant la croyance intérieure et son expression.",
    origin: "Racine arabe a-m-n, évoquant la sécurité et la confiance.",
    explanation:
      "L'iman désigne la foi, généralement décrite - notamment à partir du célèbre \"hadith de Jibril\" rapporté par Muslim - comme reposant sur six articles : la croyance en Dieu, en Ses anges, en Ses livres, en Ses messagers, au Jour dernier et au décret divin (qadar). Elle est étroitement liée à l'islam (la soumission pratique, exprimée par les cinq piliers) et à l'ihsan (l'excellence spirituelle), les trois notions formant ensemble ce que ce même hadith présente comme les trois degrés de la religion.\n\nLes théologiens divergent sur la définition précise de l'iman : pour les hanafites et maturidites, l'iman relève essentiellement de la croyance du cœur et de son expression verbale, tandis que pour d'autres courants, dont une partie des ash'arites et les hanbalites/atharites, les œuvres font partie intégrante de l'iman, qui peut ainsi augmenter ou diminuer selon l'obéissance ou la désobéissance du croyant.",
    relatedSlugs: ["tawhid", "ihsan"],
    divergence:
      "Les théologiens divergent sur la définition précise de l'iman : pour les hanafites et maturidites, l'iman relève essentiellement de la croyance du cœur et de son expression verbale, tandis que pour d'autres courants, dont une partie des ash'arites et les hanbalites/atharites, les œuvres font partie intégrante de l'iman, qui peut ainsi augmenter ou diminuer.",
  },
  {
    term: "Ihsan",
    termArabic: "الإحسان",
    slug: "ihsan",
    definition: "L'excellence spirituelle dans l'adoration et le comportement.",
    origin: "Racine arabe h-s-n, évoquant la beauté et le bien-faire.",
    explanation:
      "L'ihsan est défini dans le hadith de Jibril, rapporté par Muslim, comme le fait \"d'adorer Dieu comme si tu Le voyais, et si tu ne Le vois pas, sache que Lui te voit\". Il représente le troisième et plus élevé des degrés de la religion identifiés par ce hadith, au-delà de la simple observance des règles extérieures (islam) et de la croyance intérieure (iman).\n\nDans son acception la plus large, l'ihsan ne se limite pas à l'adoration rituelle : le Coran l'emploie également pour désigner l'excellence morale dans les relations humaines, notamment envers les parents (sourate Al-Isra, 17:23). Cette double dimension - conscience spirituelle constante et excellence du comportement - en fait une notion centrale de la spiritualité islamique (tasawwuf).",
    relatedSlugs: ["iman", "taqwa"],
  },
  {
    term: "Taqwa",
    termArabic: "التقوى",
    slug: "taqwa",
    definition: "La conscience de Dieu et la crainte révérencielle qui en découle.",
    origin: "Racine arabe w-q-y, évoquant la protection.",
    explanation:
      "La taqwa désigne un état de conscience constante de Dieu, conduisant à se protéger de Son mécontentement par l'obéissance et l'évitement du péché - une vigilance intérieure plutôt qu'une simple crainte passive. Le Coran la présente fréquemment comme le critère de la supériorité spirituelle entre les êtres humains, indépendamment de l'origine ou du statut social (sourate Al-Hujurat, 49:13).\n\nElle est également présentée comme la finalité du jeûne (sourate Al-Baqara, 2:183) et comme une condition de discernement (furqan) accordée par Dieu à celui qui la cultive (sourate Al-Anfal, 8:29), articulant ainsi étroitement dimension éthique et dimension spirituelle.",
    relatedSlugs: ["ihsan", "sawm"],
  },
  {
    term: "Shirk",
    termArabic: "الشرك",
    slug: "shirk",
    definition: "Le fait d'associer des partenaires ou des égaux à Dieu.",
    origin: "Racine arabe sh-r-k, évoquant l'association et le partage.",
    explanation:
      "Le shirk est l'opposé du tawhid : il consiste à attribuer à une entité autre que Dieu des qualités, un pouvoir ou un droit à l'adoration qui Lui reviennent exclusivement, que ce soit de façon manifeste (adoration d'idoles ou d'autres divinités) ou plus subtile. Il est considéré dans le Coran comme la faute la plus grave, la seule que Dieu n'accorde pas de pardonner sans repentir préalable (sourate An-Nisa, 4:48).\n\nLes théologiens distinguent traditionnellement le \"grand shirk\" (ash-shirk al-akbar), qui fait sortir de l'Islam, du \"petit shirk\" (ash-shirk al-asghar) comme la riya (ostentation), qui constitue une faute grave sans annuler la foi elle-même.",
    relatedSlugs: ["tawhid"],
  },
  {
    term: "Fiqh",
    termArabic: "الفقه",
    slug: "fiqh",
    definition: "La compréhension et l'élaboration du droit islamique.",
    origin: "Racine arabe f-q-h, évoquant la compréhension approfondie.",
    explanation:
      "Le fiqh désigne la discipline juridique islamique, c'est-à-dire l'ensemble des règles pratiques déduites des sources scripturaires (Coran, Sunna) par les savants, à l'aide d'une méthodologie codifiée (usul al-fiqh) reposant sur le Coran, la Sunna, le consensus (ijma') et le raisonnement analogique (qiyas). Il couvre aussi bien le culte (ibadat - prière, jeûne, zakat, hajj) que les relations sociales (mu'amalat - contrats, mariage, commerce, droit pénal).\n\nÀ la différence de la théologie (aqida), qui traite des fondements de la croyance, le fiqh se concentre sur la mise en pratique concrète de la religion, un domaine où la divergence licite (ikhtilaf) entre écoles juridiques est largement documentée et acceptée, comme l'illustre le comparateur de fiqh de cette plateforme.",
    relatedSlugs: [],
  },
  {
    term: "Sunnah",
    termArabic: "السنة",
    slug: "sunnah",
    definition: "La tradition et la pratique du Prophète Muhammad ﷺ.",
    origin: "Terme arabe désignant à l'origine une voie ou une pratique établie.",
    explanation:
      "La sunnah renvoie à l'ensemble des paroles, actes et approbations tacites attribués au Prophète ﷺ, transmis par la tradition du hadith à travers des chaînes de rapporteurs (isnad) minutieusement étudiées par les spécialistes du hadith. Elle constitue, avec le Coran, l'une des deux sources scripturaires principales de l'Islam, et joue un rôle indispensable pour expliciter, détailler ou préciser des prescriptions coraniques énoncées de façon générale (par exemple, la manière précise d'accomplir la prière).\n\nLe terme est également employé dans un sens juridique plus restreint pour désigner une catégorie d'actes recommandés (par opposition à fard, l'obligatoire), dont l'accomplissement est méritoire sans être strictement obligatoire.",
    relatedSlugs: ["fiqh", "bidah"],
  },
  {
    term: "Bid'ah",
    termArabic: "البدعة",
    slug: "bidah",
    definition: "Une innovation introduite dans la pratique religieuse.",
    origin: "Racine arabe b-d-'a, évoquant la création d'une chose nouvelle.",
    explanation:
      "La bid'ah désigne une pratique religieuse introduite sans précédent dans le Coran ou la Sunna et présentée comme faisant partie de la religion. Un hadith rapporte par Muslim avertit que \"toute innovation est un égarement\", une mise en garde qui structure fortement l'attitude traditionnelle envers les nouveautés en matière de culte.\n\nLa portée exacte du terme - notamment la distinction entre innovations religieuses condamnables et nouveautés purement pratiques ou organisationnelles sans prétention cultuelle (moyens de communication, outils d'enseignement, etc.) - fait l'objet de discussions classiques parmi les savants ; certains distinguent même, à l'intérieur du champ religieux, des innovations \"louables\" (bid'a hasana) de pratiques manifestement contraires aux textes, une distinction elle-même débattue.",
    relatedSlugs: ["sunnah"],
  },
  {
    term: "Wudu",
    termArabic: "الوضوء",
    slug: "wudu",
    definition: "Les petites ablutions rituelles préparant à la prière.",
    origin: "Racine arabe w-d-a, évoquant la propreté et l'éclat.",
    explanation:
      "Le wudu est l'ablution rituelle requise avant la prière, décrite dans le Coran (sourate Al-Ma'ida, 5:6) : lavage du visage, des mains et avant-bras jusqu'aux coudes, essuyage de la tête et lavage des pieds jusqu'aux chevilles, accompli dans cet ordre et précédé de l'intention (niyya). Il constitue une condition de validité de la prière et de plusieurs autres actes d'adoration, comme le contact avec le texte coranique selon la position juridique majoritaire.\n\nCertains actes du quotidien (sommeil profond, contact physique, émission de gaz...) sont discutés quant à leur capacité à l'invalider, les positions variant sensiblement d'une école juridique à l'autre, comme le détaille le comparateur de fiqh de cette plateforme.",
    relatedSlugs: ["salah"],
  },
  {
    term: "Halal",
    termArabic: "الحلال",
    slug: "halal",
    definition: "Ce qui est licite ou permis selon le droit islamique.",
    origin: "Racine arabe h-l-l, évoquant ce qui est dénoué ou autorisé.",
    explanation:
      "Le halal désigne tout acte, aliment ou pratique autorisé par le droit islamique, par opposition au haram (interdit). Le terme est le plus souvent associé à l'alimentation - notamment l'abattage rituel de la viande - mais s'applique en réalité beaucoup plus largement, à l'ensemble des actes de la vie quotidienne, financière, sociale et professionnelle.\n\nEn droit islamique classique, le halal recouvre en réalité plusieurs catégories distinctes selon le degré de recommandation : l'obligatoire (fard), le recommandé (mustahabb) et le simplement permis sans conséquence particulière (mubah), toutes regroupées sous le terme général de licite par opposition à l'interdit.",
    relatedSlugs: ["haram"],
  },
  {
    term: "Haram",
    termArabic: "الحرام",
    slug: "haram",
    definition: "Ce qui est illicite ou formellement interdit selon le droit islamique.",
    origin: "Racine arabe h-r-m, évoquant l'interdiction et le caractère sacré.",
    explanation:
      "Le haram désigne un acte formellement interdit par les textes scripturaires sur la base d'une preuve univoque, dont l'accomplissement constitue une faute et, selon les cas, une transgression majeure (kabira) ou mineure (saghira). Il s'oppose au halal (licite) dans la classification quintuple des actions en droit islamique (al-ahkam al-khamsa), qui comprend également des catégories intermédiaires : obligatoire (fard), recommandé (mustahabb), détesté (makruh) et permis neutre (mubah).\n\nCertains interdits (le meurtre, l'usure, l'adultère...) sont considérés unanimement établis par l'ensemble des écoles, tandis que d'autres questions plus fines font l'objet de divergences juridiques licites (ikhtilaf) selon les sources et méthodes retenues par chaque école.",
    relatedSlugs: ["halal"],
  },
  {
    term: "Qadar",
    termArabic: "القدر",
    slug: "qadar",
    definition: "Le décret et la prédestination divine.",
    origin: "Racine arabe q-d-r, évoquant la mesure et la détermination.",
    explanation:
      "Le qadar renvoie à la croyance selon laquelle Dieu connaît et a décrété de toute éternité tout ce qui adviendra - un des six articles de la foi énoncés dans le hadith de Jibril - tout en laissant à l'être humain une responsabilité réelle sur ses actes, celui-ci disposant d'une capacité de choix (ikhtiyar) dont il répondra le Jour du Jugement. Cette articulation entre décret divin universel et responsabilité individuelle est présentée par la tradition sunnite comme une tension à préserver plutôt qu'à résoudre unilatéralement dans un sens ou dans l'autre.\n\nL'articulation entre décret divin et libre arbitre humain a fait l'objet de débats théologiques historiques majeurs, notamment avec le mu'tazilisme qui insistait sur la liberté humaine par souci de justice divine, et avec certains courants déterministes (jabrites) à l'opposé ; la position sunnite classique se situe entre ces deux extrêmes.",
    relatedSlugs: ["iman"],
  },
  {
    term: "Tawakkul",
    termArabic: "التوكل",
    slug: "tawakkul",
    definition: "L'abandon confiant en Dieu après avoir pris les moyens nécessaires.",
    origin: "Racine arabe w-k-l, évoquant le fait de confier une affaire à quelqu'un.",
    explanation:
      "Le tawakkul désigne la confiance placée en Dieu quant à l'issue des affaires, tout en accomplissant les efforts et moyens raisonnables à sa disposition - il ne s'agit donc pas d'un fatalisme passif mais d'une combinaison entre effort humain et remise de confiance envers le résultat final, qui appartient à Dieu seul. Il est souvent illustré par le hadith, rapporté par At-Tirmidhi, invitant à \"attacher sa chamelle, puis s'en remettre à Dieu\", en réponse à un compagnon qui demandait s'il devait laisser sa monture libre en professant sa confiance en Dieu.\n\nLe Coran (sourate At-Talaq, 65:3) associe le tawakkul à une promesse de suffisance divine (\"quiconque place sa confiance en Dieu, Il lui suffit\"), en faisant l'une des vertus les plus centrales de la vie spirituelle du croyant.",
    relatedSlugs: ["qadar"],
  },
  {
    term: "Sabr",
    termArabic: "الصبر",
    slug: "sabr",
    definition: "La patience et l'endurance face aux épreuves.",
    origin: "Racine arabe s-b-r, évoquant le fait de se retenir et d'endurer.",
    explanation:
      "Le sabr désigne la capacité à persévérer avec constance face aux difficultés, aux tentations ou dans l'accomplissement des obligations religieuses. Les commentateurs distinguent traditionnellement trois formes de sabr : la patience dans l'obéissance à Dieu, la patience face aux interdits (résister à la tentation) et la patience face aux épreuves et malheurs de la vie.\n\nLe Coran le présente à de nombreuses reprises comme une vertu récompensée sans limite (sourate Az-Zumar, 39:10), et l'associe fréquemment à la prière comme deux ressources complémentaires face aux difficultés (sourate Al-Baqara, 2:153).",
    relatedSlugs: ["tawakkul"],
  },
  {
    term: "Kufr",
    termArabic: "الكفر",
    slug: "kufr",
    definition: "Le rejet ou l'occultation de la foi en Dieu.",
    origin: "Racine arabe k-f-r, évoquant à l'origine le fait de couvrir ou dissimuler.",
    explanation:
      "Le kufr désigne le rejet de la foi islamique, que ce soit par négation explicite ou par occultation volontaire d'une vérité pourtant reconnue - le sens étymologique originel de \"couvrir\" évoquant précisément l'idée de dissimuler une vérité perceptible plutôt que de simplement l'ignorer. Le terme est l'opposé conceptuel de l'iman, et désigne aussi bien le rejet global de la foi islamique que, dans un sens juridique plus technique, certains actes ou paroles graves considérés comme incompatibles avec la foi.\n\nSa qualification précise dans des cas individuels est traditionnellement traitée avec une grande prudence méthodologique par les savants, qui distinguent généralement l'acte de kufr objectif du jugement porté sur la personne elle-même (takfir), réservé avec beaucoup de circonspection en raison de ses conséquences graves.",
    relatedSlugs: ["iman", "shirk"],
  },
  {
    term: "Umma",
    termArabic: "الأمة",
    slug: "umma",
    definition: "La communauté des croyants musulmans, au-delà des frontières et des origines.",
    origin: "Racine arabe a-m-m, évoquant un groupe ou une nation.",
    explanation:
      "L'umma désigne la communauté globale des musulmans, conçue comme une entité unie par la foi plutôt que par l'origine ethnique, linguistique ou nationale - un principe explicitement affirmé dans le célèbre sermon d'adieu du Prophète ﷺ, qui rappelle l'égalité de tous les croyants indépendamment de leur origine. Le concept trouve ses fondements dans le Coran et dans la \"Constitution de Médine\", document établi par le Prophète ﷺ peu après l'Hégire pour organiser les relations entre les différentes composantes de la société médinoise.\n\nLe terme umma est parfois employé dans un sens plus large englobant l'ensemble de l'humanité en tant que destinataire potentiel du message islamique (umma da'wa), à distinguer du sens plus restreint désignant spécifiquement la communauté des croyants (umma ijaba).",
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
      "Le tawhid ar-rububiyya est le premier des trois volets classiquement distingués dans l'étude du tawhid : il affirme que Dieu seul crée, possède, gouverne et pourvoit à l'univers, sans associé dans ces fonctions.\n\nLes théologiens soulignent que ce volet du tawhid était déjà largement reconnu par les polythéistes contemporains du Prophète ﷺ, comme le rappelle le Coran (sourate Al-Ankabut, 29:61) : reconnaître Dieu comme créateur ne suffit donc pas à lui seul, d'où la nécessité des deux autres volets, l'uluhiyya et les asma wa sifat.",
    relatedSlugs: ["tawhid", "uluhiyya", "asma-wa-sifat"],
  },
  {
    term: "Uluhiyya (Unicité de l'adoration)",
    termArabic: "الألوهية",
    slug: "uluhiyya",
    definition: "L'unicité de Dieu dans le droit exclusif à être adoré.",
    origin: "Racine arabe a-l-h, dont dérive le nom Allah.",
    explanation:
      "Le tawhid al-uluhiyya, second volet du tawhid, affirme que Dieu seul a le droit d'être adoré, à l'exclusion de toute autre entité - qu'il s'agisse de prières, de sacrifices, de vœux ou de tout autre acte d'adoration.\n\nCe volet est présenté par les théologiens comme le cœur du message de tous les prophètes, chacun ayant appelé son peuple à n'adorer que Dieu seul (sourate An-Nahl, 16:36).",
    relatedSlugs: ["tawhid", "rububiyya", "shirk"],
  },
  {
    term: "Al-Asma wa-s-Sifat (Noms et attributs divins)",
    termArabic: "الأسماء والصفات",
    slug: "asma-wa-sifat",
    definition: "L'unicité de Dieu dans Ses noms et attributs, tels qu'Il Se les attribue Lui-même.",
    origin: "Composition arabe de asma (noms) et sifat (attributs).",
    explanation:
      "Ce troisième volet du tawhid consiste à affirmer les noms et attributs que Dieu S'attribue Lui-même dans le Coran et que le Prophète ﷺ Lui attribue, sans les nier, sans les dénaturer, sans en demander la modalité précise, et sans les comparer à la création.\n\nLa manière précise d'aborder ces textes - affirmation directe sans interprétation (approche atharite) ou interprétation allégorique de certains termes ambigus (approche ash'arite/maturidite) - constitue l'un des points de divergence historiques majeurs de la théologie islamique classique, présentés de manière descriptive dans la section Écoles de cette plateforme.",
    relatedSlugs: ["tawhid", "rububiyya", "uluhiyya"],
  },
  {
    term: "Nubuwwa (Prophétie)",
    termArabic: "النبوة",
    slug: "nubuwwa",
    definition: "L'institution divine de la prophétie, par laquelle Dieu communique Son message à l'humanité.",
    origin: "Racine arabe n-b-a, évoquant l'annonce d'une information importante.",
    explanation:
      "La nubuwwa désigne la mission confiée par Dieu à des individus choisis - les prophètes (anbiya) et messagers (rusul) - pour transmettre Son message à l'humanité. La croyance en la prophétie de Muhammad ﷺ, dernier maillon de cette chaîne, est l'un des deux témoignages de la shahada.\n\nLa distinction entre nabi (prophète recevant une révélation sans mission de la transmettre à un nouveau peuple) et rasul (messager chargé d'un message, et souvent d'une loi nouvelle) est une distinction classique, tous les rusul étant considérés comme des anbiya, mais non l'inverse.",
    relatedSlugs: ["wahy", "iman"],
  },
  {
    term: "Wahy (Révélation)",
    termArabic: "الوحي",
    slug: "wahy",
    definition: "La révélation divine transmise aux prophètes.",
    origin: "Racine arabe w-h-y, évoquant une communication rapide et discrète.",
    explanation:
      "Le wahy désigne le processus par lequel Dieu communique Son message aux prophètes, que ce soit directement, par inspiration, ou par l'intermédiaire d'un ange (généralement identifié à Jibril). Le Coran est considéré comme le wahy transmis intégralement et littéralement au Prophète ﷺ.\n\nLa tradition islamique distingue le wahy matlu (récité, c'est-à-dire le texte coranique lui-même) du wahy ghayr matlu (non récité, dont le sens général aurait été inspiré mais formulé par le Prophète ﷺ, comme les hadiths) - une distinction qui a des implications sur le statut juridique et rituel de chacun.",
    relatedSlugs: ["nubuwwa", "sunnah"],
  },
  {
    term: "Al-Akhira (L'au-dela)",
    termArabic: "الآخرة",
    slug: "akhira",
    definition: "La vie future, après la résurrection et le Jugement dernier.",
    origin: "Terme arabe signifiant littéralement \"la dernière\", par opposition à ad-dunya (la vie présente).",
    explanation:
      "La croyance en l'akhira, l'un des six articles de la foi, affirme qu'après la mort et la résurrection, chaque être humain sera jugé sur ses actes et connaîtra une rétribution éternelle, au paradis (jannah) ou en enfer (jahannam).\n\nCette croyance est présentée dans le Coran comme structurant profondément l'éthique islamique : la vie présente (ad-dunya) y est décrite comme un lieu d'épreuve temporaire, dont la valeur se mesure à l'aune de ses conséquences dans l'au-delà.",
    relatedSlugs: ["jannah", "jahannam", "iman"],
  },
  {
    term: "Al-Jannah (Le Paradis)",
    termArabic: "الجنة",
    slug: "jannah",
    definition: "Le séjour éternel de récompense promis aux croyants dans l'au-delà.",
    origin: "Terme arabe signifiant littéralement \"jardin\".",
    explanation:
      "La jannah désigne, dans la croyance islamique, le lieu de félicité éternelle accordé par la grâce de Dieu à ceux qu'Il agrée, décrit dans le Coran par de nombreuses images (jardins, rivières, compagnie des justes) comprises par la majorité des exégètes comme des réalités véritables, dont la nature exacte demeure connue de Dieu seul.",
    relatedSlugs: ["akhira", "jahannam"],
  },
  {
    term: "Jahannam (L'Enfer)",
    termArabic: "جهنم",
    slug: "jahannam",
    definition: "Le séjour de châtiment promis dans l'au-delà à ceux que Dieu y destine.",
    origin: "Terme arabe d'origine sémitique ancienne, désignant un abîme profond.",
    explanation:
      "Jahannam désigne le lieu de châtiment dans l'au-delà, décrit dans le Coran comme la conséquence du rejet obstiné de la foi ou de fautes graves non pardonnées. La tradition islamique insiste sur le fait que la miséricorde de Dieu y demeure première, et que le statut final de chaque individu Lui appartient seul.",
    relatedSlugs: ["akhira", "jannah"],
  },
  {
    term: "Malaika (Les Anges)",
    termArabic: "الملائكة",
    slug: "malaika",
    definition: "Des créatures spirituelles créées par Dieu pour L'adorer et exécuter Ses ordres.",
    origin: "Terme arabe dérivé de la racine l-a-k, évoquant le message et la mission.",
    explanation:
      "La croyance aux anges, second article de la foi, reconnaît l'existence d'entités créées à partir de lumière, dépourvues de libre arbitre au sens humain et vouées à une obéissance totale à Dieu. Certains anges sont nommés dans le Coran et chargés de missions spécifiques, comme Jibril (la révélation), Mika'il ou Israfil.\n\nLes anges sont distingués à la fois des jinns (créés de feu, dotés de libre arbitre) et des démons, avec lesquels ils ne doivent pas être confondus.",
    relatedSlugs: ["iman", "wahy", "jinn"],
  },
  {
    term: "Jinn",
    termArabic: "الجن",
    slug: "jinn",
    definition: "Des créatures invisibles à l'œil humain, créées de feu, dotées de libre arbitre.",
    origin: "Racine arabe j-n-n, évoquant ce qui est caché ou dissimule.",
    explanation:
      "Les jinns sont, selon le Coran, des créatures créées d'une flamme de feu (sourate Al-Hijr, 15:27), dotées comme les humains d'un libre arbitre et donc soumises à une responsabilité religieuse - certains croyant, d'autres non, comme le rapporte la sourate Al-Jinn. Le diable (Shaytan/Iblis) est traditionnellement identifié comme un jinn, non comme un ange déchu.",
    relatedSlugs: ["malaika", "shaytan"],
  },
  {
    term: "Shaytan (Satan)",
    termArabic: "الشيطان",
    slug: "shaytan",
    definition: "La figure du diable, incitant les êtres humains et les jinns à la désobéissance envers Dieu.",
    origin: "Racine arabe sh-t-n, évoquant l'éloignement et la rébellion.",
    explanation:
      "Iblis, identifié par le Coran comme un jinn, refusa par orgueil de se prosterner devant Adam sur ordre de Dieu et devint ainsi Shaytan, symbole et instigateur de la désobéissance. Le terme shaytan désigne par extension toute force ou tentation poussant vers le mal, chez les jinns comme chez les humains.\n\nLe Coran précise que le pouvoir du Shaytan sur l'être humain se limite à la suggestion (waswasa) : il ne peut contraindre personne, la responsabilité finale des actes revenant à chaque individu.",
    relatedSlugs: ["jinn", "shirk"],
  },
  // --- Akhlaq : éthique et caractère ---
  {
    term: "Ikhlas (Sincérité)",
    termArabic: "الإخلاص",
    slug: "ikhlas",
    definition: "La sincérité de l'intention, consistant à accomplir un acte pour Dieu seul.",
    origin: "Racine arabe kh-l-s, évoquant la pureté et l'exemption de tout mélange.",
    explanation:
      "L'ikhlas désigne le fait de purifier son intention (niyyah) dans l'adoration et les bonnes actions, en les accomplissant uniquement pour rechercher l'agrément de Dieu, sans rechercher la reconnaissance ou l'admiration d'autrui. Un hadith célèbre rapporte que \"les actes ne valent que par les intentions\" (Al-Bukhari, Muslim).\n\nL'ikhlas est traditionnellement présenté comme la condition d'acceptation de toute adoration, quelle que soit sa forme extérieure, et s'oppose directement à la riya.",
    relatedSlugs: ["riya", "ihsan"],
  },
  {
    term: "Riya (Ostentation)",
    termArabic: "الرياء",
    slug: "riya",
    definition: "Le fait d'accomplir un acte religieux pour être vu ou loué par les gens plutôt que pour Dieu.",
    origin: "Racine arabe r-a-y, évoquant le fait de voir et de montrer.",
    explanation:
      "La riya consiste à accomplir un acte d'adoration ou une bonne action en recherchant, en tout ou partie, le regard et l'estime des autres plutôt que l'agrément exclusif de Dieu. Elle est parfois désignée dans la tradition comme \"le petit associationnisme\" (ash-shirk al-asghar), en raison du risque qu'elle fait courir à la sincérité de l'intention.",
    relatedSlugs: ["ikhlas", "shirk"],
  },
  {
    term: "Tawadu' (Humilite)",
    termArabic: "التواضع",
    slug: "tawadu",
    definition: "L'humilité, l'absence d'orgueil envers Dieu et envers autrui.",
    origin: "Racine arabe w-d-a, évoquant le fait de s'abaisser.",
    explanation:
      "Le tawadu' désigne une disposition de modestie et d'humilité, tant dans la relation au Créateur (reconnaître sa dépendance totale envers Dieu) que dans les relations sociales (ne pas se considérer supérieur aux autres). Il est présenté dans plusieurs hadiths comme une vertu élevant en réalité le statut de celui qui la pratique, à l'inverse du kibr (orgueil).",
    relatedSlugs: ["kibr", "ihsan"],
  },
  {
    term: "Kibr (Orgueil)",
    termArabic: "الكبر",
    slug: "kibr",
    definition: "L'orgueil, consistant à rejeter la vérité ou à mépriser autrui par sentiment de supériorité.",
    origin: "Racine arabe k-b-r, évoquant la grandeur.",
    explanation:
      "Le kibr est défini dans un hadith rapporté par Muslim comme \"le rejet de la vérité et le mépris des gens\". Il est présenté comme l'un des vices les plus graves en Islam, l'exemple coranique le plus marquant étant le refus d'Iblis de se prosterner devant Adam par sentiment de supériorité.",
    relatedSlugs: ["tawadu", "shaytan"],
  },
  {
    term: "Hilm (Maîtrise de soi)",
    termArabic: "الحلم",
    slug: "hilm",
    definition: "La maîtrise de soi et la retenue face à la colère ou à la provocation.",
    origin: "Racine arabe h-l-m, évoquant la douceur et la patience réfléchie.",
    explanation:
      "Le hilm désigne la capacité à rester calme, mesuré et indulgent face à une provocation, une injustice ou une colère justifiée, plutôt que de réagir avec précipitation. Cette vertu est particulièrement associée dans la Sira à l'attitude du Prophète ﷺ envers ceux qui l'ont maltraite, comme lors de l'épisode de Ta'if.",
    relatedSlugs: ["sabr", "adl"],
  },
  {
    term: "Adl (Justice)",
    termArabic: "العدل",
    slug: "adl",
    definition: "La justice et l'équité, valeur centrale de l'éthique islamique.",
    origin: "Racine arabe a-d-l, évoquant l'équilibre et la droiture.",
    explanation:
      "L'adl désigne l'obligation de rendre justice et d'agir avec équité, y compris envers ceux que l'on n'apprécie pas. Le Coran (sourate An-Nisa, 4:135 ; Al-Ma'ida, 5:8) insiste explicitement sur le fait que l'inimitié envers autrui ne doit jamais conduire à l'injustice.",
    relatedSlugs: ["zulm", "hilm"],
  },
  {
    term: "Rahma (Misericorde)",
    termArabic: "الرحمة",
    slug: "rahma",
    definition: "La miséricorde, attribut divin premier et vertu recommandée entre les croyants.",
    origin: "Racine arabe r-h-m, partagée avec le mot \"matrice\" (rahim), évoquant la tendresse.",
    explanation:
      "La rahma est l'attribut divin le plus fréquemment cité dans le Coran, chaque sourate (sauf une) s'ouvrant par la formule \"Au nom de Dieu, le Tout Miséricordieux, le Très Miséricordieux\". Elle désigne aussi la vertu de compassion recommandée au croyant envers les autres créatures, le Prophète ﷺ étant lui-même décrit comme \"une miséricorde pour l'univers\" (sourate Al-Anbiya, 21:107).",
    relatedSlugs: ["ihsan", "adl"],
  },
  {
    term: "Amanah (Le depot de confiance)",
    termArabic: "الأمانة",
    slug: "amanah",
    definition: "La fidélité aux engagements et aux responsabilités qui nous sont confiées.",
    origin: "Racine arabe a-m-n, la même que celle du mot iman.",
    explanation:
      "L'amanah désigne la fidélité envers tout ce qui est confié à une personne - biens, secrets, responsabilités publiques ou privées. Le Coran (sourate Al-Ahzab, 33:72) présente même la responsabilité religieuse elle-même comme un \"dépôt de confiance\" proposé aux cieux, à la terre et aux montagnes, qui l'ont refusée, et que l'être humain a accepté de porter.",
    relatedSlugs: ["sidq", "adl"],
  },
  {
    term: "Sidq (Véracité)",
    termArabic: "الصدق",
    slug: "sidq",
    definition: "La véracité et l'honnêteté dans la parole et les actes.",
    origin: "Racine arabe s-d-q, dont dérive également le mot sadaqa (aumône).",
    explanation:
      "Le sidq désigne la conformité entre ce que l'on dit, ce que l'on pense et ce que l'on fait. Il est présenté dans le Coran comme étroitement lié à la foi (sourate At-Tawba, 9:119), et le Prophète ﷺ était connu, avant même sa mission prophétique, sous le surnom d'\"Al-Amin\" (le digne de confiance) en raison de sa véracité reconnue par tous.",
    relatedSlugs: ["amanah", "ikhlas"],
  },
  {
    term: "Haya' (Pudeur)",
    termArabic: "الحياء",
    slug: "hayaa",
    definition: "La pudeur et la retenue morale face à ce qui est inconvenant.",
    origin: "Racine arabe h-y-y, partagée avec le mot \"vie\", évoquant la sensibilité morale.",
    explanation:
      "Le haya' désigne un sentiment de retenue qui détourne des comportements inconvenants ou immoraux, tant dans l'apparence que dans le comportement. Un hadith rapporte que \"le haya' fait partie de la foi\" (Al-Bukhari, Muslim), le présentant comme une vertu structurante plutôt que comme une simple timidité.",
    relatedSlugs: ["sidq"],
  },
  {
    term: "Ghiba (Médisance)",
    termArabic: "الغيبة",
    slug: "ghiba",
    definition: "Le fait de parler d'une personne absente d'une manière qui lui déplairait.",
    origin: "Racine arabe gh-y-b, évoquant l'absence.",
    explanation:
      "La ghiba, définie par le Prophète ﷺ comme le fait de \"mentionner ton frère d'une manière qu'il n'aimerait pas\" (rapporté par Muslim), même si le propos est vrai, est explicitement condamnée dans le Coran, comparée à \"manger la chair de son frère mort\" (sourate Al-Hujurat, 49:12).",
    relatedSlugs: ["zulm"],
  },
  {
    term: "Zulm (Injustice)",
    termArabic: "الظلم",
    slug: "zulm",
    definition: "L'injustice, consistant à placer une chose hors de sa juste place.",
    origin: "Racine arabe z-l-m, évoquant l'obscurité et le déplacement hors du droit chemin.",
    explanation:
      "Le zulm désigne, dans son sens le plus large, le fait de placer une chose là où elle ne devrait pas être - envers Dieu (le shirk étant qualifié de \"zulm immense\", sourate Luqman, 31:13), envers soi-même, ou envers autrui. Il constitue l'opposé direct de l'adl (justice).",
    relatedSlugs: ["adl", "shirk"],
  },
  // --- Fiqh : notions juridiques ---
  {
    term: "Nikah (Mariage)",
    termArabic: "النكاح",
    slug: "nikah",
    definition: "Le contrat de mariage islamique, union licite entre un homme et une femme.",
    origin: "Terme coranique désignant l'union matrimoniale.",
    explanation:
      "Le nikah est un contrat encadré par le droit islamique, comprenant des conditions (consentement, témoins, dot) et des droits et devoirs réciproques entre les époux, présenté dans le Coran comme un signe divin favorisant la tranquillité et l'affection mutuelle (sourate Ar-Rum, 30:21). Les modalités précises de certaines de ses conditions varient selon les écoles juridiques.",
    relatedSlugs: ["fiqh"],
  },
  {
    term: "Riba (Usure)",
    termArabic: "الربا",
    slug: "riba",
    definition: "L'intérêt ou le surplus injustifié perçu dans un prêt ou un échange, interdit en Islam.",
    origin: "Racine arabe r-b-w, évoquant l'augmentation et le surplus.",
    explanation:
      "Le riba désigne tout surplus injustifié exigé dans un prêt d'argent ou dans certains échanges de biens de même catégorie, formellement interdit par le Coran (sourate Al-Baqara, 2:275-279). Cette interdiction est à l'origine du développement de la finance islamique contemporaine, qui cherche des structures contractuelles alternatives (partage de profits et pertes, vente à marge...).",
    relatedSlugs: ["fiqh", "halal", "haram"],
  },
  {
    term: "Ijtihad (Effort d'interprétation)",
    termArabic: "الاجتهاد",
    slug: "ijtihad",
    definition: "L'effort intellectuel fourni par un juriste qualifié pour déduire une règle à partir des sources.",
    origin: "Racine arabe j-h-d, évoquant l'effort soutenu.",
    explanation:
      "L'ijtihad désigne l'effort méthodique fourni par un savant qualifié (mujtahid) pour déduire une règle juridique à partir du Coran, de la Sunna et des outils de l'usul al-fiqh, lorsque la question n'est pas explicitement tranchée par un texte univoque. Les grands imams fondateurs des écoles juridiques sont les exemples classiques de mujtahid absolu.",
    relatedSlugs: ["taqlid", "fiqh"],
  },
  {
    term: "Taqlid (Suivi d'une autorité juridique)",
    termArabic: "التقليد",
    slug: "taqlid",
    definition: "Le fait de suivre l'avis d'un savant ou d'une école juridique sans en examiner soi-même les preuves détaillées.",
    origin: "Racine arabe q-l-d, évoquant le fait de porter un collier, au sens figuré de se référer à une autorité.",
    explanation:
      "Le taqlid désigne le fait, pour un non-spécialiste, de suivre les conclusions juridiques d'un savant ou d'une école reconnue plutôt que de déduire lui-même une règle à partir des textes. La question de sa portée - notamment l'obligation ou non de suivre une seule école en toute chose - a fait l'objet de discussions méthodologiques classiques parmi les juristes.",
    relatedSlugs: ["ijtihad", "fiqh"],
  },
  {
    term: "Ijma' (Consensus)",
    termArabic: "الإجماع",
    slug: "ijma",
    definition: "Le consensus des savants qualifiés d'une époque sur une question de droit.",
    origin: "Racine arabe j-m-a, évoquant le rassemblement et l'accord.",
    explanation:
      "L'ijma' désigne l'accord unanime des juristes qualifiés d'une génération sur une règle donnée, reconnu par la majorité des écoles sunnites comme la troisième source du droit islamique après le Coran et la Sunna. Sa portée pratique reste toutefois discutée, tant sur les modalités de son établissement que sur son périmètre exact.",
    relatedSlugs: ["qiyas", "fiqh"],
  },
  {
    term: "Qiyas (Raisonnement analogique)",
    termArabic: "القياس",
    slug: "qiyas",
    definition: "Le raisonnement par analogie, etendant une règle connue à un cas nouveau partageant sa cause.",
    origin: "Racine arabe q-y-s, évoquant la mesure et la comparaison.",
    explanation:
      "Le qiyas consiste à étendre une règle établie par un texte à un cas non explicitement traité, sur la base d'une cause commune ('illa) identifiée entre les deux situations. Quatrième source classique du droit islamique, son usage et ses limites varient sensiblement d'une école à l'autre, les hanafites en faisant un usage plus systématique que les hanbalites, par exemple.",
    relatedSlugs: ["ijma", "fiqh"],
  },
  // --- Sciences du Coran et du hadith ---
  {
    term: "Isnad (Chaîne de transmission)",
    termArabic: "الإسناد",
    slug: "isnad",
    definition: "La chaîne des transmetteurs successifs d'un hadith, remontant jusqu'au Prophète ﷺ.",
    origin: "Racine arabe s-n-d, évoquant le fait de s'appuyer sur quelque chose.",
    explanation:
      "L'isnad est la liste des rapporteurs successifs par lesquels un hadith a été transmis. Son examen minutieux - continuité, fiabilité et mémoire de chaque rapporteur - constitue le cœur de la méthodologie d'authentification des hadiths (mustalah al-hadith), une spécificité méthodologique de la tradition islamique.",
    relatedSlugs: ["sunnah"],
  },
  {
    term: "Naskh (Abrogation)",
    termArabic: "النسخ",
    slug: "naskh",
    definition: "Le remplacement de la portée pratique d'un verset par un autre verset révélé ultérieurement.",
    origin: "Racine arabe n-s-kh, évoquant la copie et le remplacement.",
    explanation:
      "Le naskh désigne les cas, discutés par les exégètes classiques, où un verset coranique voit sa portée législative modifiée par un verset révélé plus tardivement sur le même sujet. Cette discipline est traitée avec une grande prudence méthodologique, les commentateurs distinguant les cas d'abrogation avérée des cas de simple spécification ou de complémentarité entre versets.",
    relatedSlugs: ["wahy"],
  },
  {
    term: "Asbab al-Nuzul (Circonstances de la révélation)",
    termArabic: "أسباب النزول",
    slug: "asbab-al-nuzul",
    definition: "Les circonstances historiques ayant entouré la révélation d'un verset ou d'un passage coranique.",
    origin: "Composition arabe de asbab (causes) et nuzul (descente, révélation).",
    explanation:
      "L'étude des asbab al-nuzul vise à identifier le contexte précis - une question posée au Prophète ﷺ, un événement particulier - dans lequel un verset a été révélé, afin de mieux en saisir la portée et d'éviter une lecture isolée de son contexte historique.",
    relatedSlugs: ["naskh", "wahy"],
  },
  // --- Adoration et spiritualite ---
  {
    term: "Dhikr (Rappel de Dieu)",
    termArabic: "الذكر",
    slug: "dhikr",
    definition: "Le rappel et l'évocation de Dieu, par la parole ou par le cœur.",
    origin: "Racine arabe dh-k-r, évoquant la mémoire et la mention.",
    explanation:
      "Le dhikr désigne toute forme d'évocation de Dieu - formules de glorification, lecture du Coran, ou simple présence du cœur - recommandée fréquemment dans le Coran comme une source d'apaisement (sourate Ar-Ra'd, 13:28).",
    relatedSlugs: ["dua", "taqwa"],
  },
  {
    term: "Du'a (Invocation)",
    termArabic: "الدعاء",
    slug: "dua",
    definition: "L'invocation et la supplication adressée à Dieu.",
    origin: "Racine arabe d-a-w, évoquant l'appel.",
    explanation:
      "Le du'a désigne l'acte de s'adresser directement à Dieu pour Lui demander Son aide, Son pardon ou Sa guidance, considéré dans un hadith rapporté par At-Tirmidhi comme \"l'essence même de l'adoration\".",
    relatedSlugs: ["dhikr", "tawakkul"],
  },
  {
    term: "Tawba (Repentir)",
    termArabic: "التوبة",
    slug: "tawba",
    definition: "Le retour vers Dieu après une faute, par le regret sincère et la résolution de ne pas y revenir.",
    origin: "Racine arabe t-w-b, évoquant le retour.",
    explanation:
      "La tawba désigne le processus de repentir sincère, comprenant classiquement la reconnaissance de la faute, le regret, l'arrêt immédiat de l'acte fautif et la résolution de ne pas y revenir - accompagnée, si la faute concerne un tiers, de la réparation due. Le Coran présente Dieu comme infiniment accueillant envers quiconque se repent sincèrement (sourate Az-Zumar, 39:53).",
    relatedSlugs: ["istighfar"],
  },
  {
    term: "Istighfar (Demande de pardon)",
    termArabic: "الاستغفار",
    slug: "istighfar",
    definition: "La demande explicite du pardon divin.",
    origin: "Racine arabe gh-f-r, évoquant le fait de couvrir et de pardonner.",
    explanation:
      "L'istighfar désigne l'acte de demander pardon à Dieu, souvent associé à la tawba dont il constitue l'expression verbale. Le Prophète ﷺ, bien qu'infaillible dans sa mission, est rapporté comme demandant pardon à Dieu de nombreuses fois par jour, présentant ainsi l'istighfar comme une pratique constante plutôt que réservée aux seules fautes graves.",
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
      "La khilafa désigne l'institution de direction de la communauté établie après le décès du Prophète ﷺ, inaugurée par les quatre califes dits \"bien-guidés\" (Abu Bakr, Omar, Uthman, Ali), puis poursuivie sous des formes dynastiques (omeyyade, abbasside...) jusqu'à son abolition formelle en 1924.",
    relatedSlugs: ["shura"],
  },
  {
    term: "Shura (Consultation)",
    termArabic: "الشورى",
    slug: "shura",
    definition: "Le principe de consultation mutuelle dans la prise de décision collective.",
    origin: "Racine arabe sh-w-r, évoquant le fait de consulter.",
    explanation:
      "La shura désigne le principe, mentionné dans le Coran (sourate Ash-Shura, 42:38 ; Al Imran, 3:159) recommandant au Prophète ﷺ lui-même de consulter ses Compagnons, appliqué historiquement à la désignation des premiers califes et plus largement présenté comme un principe de gouvernance et de prise de décision collective en Islam.",
    relatedSlugs: ["khilafa"],
  },
  {
    term: "Da'wa (Invitation à l'Islam)",
    termArabic: "الدعوة",
    slug: "dawa",
    definition: "L'invitation et la transmission pacifique du message islamique.",
    origin: "Racine arabe d-a-w, évoquant l'appel.",
    explanation:
      "La da'wa désigne l'acte de transmettre et d'expliquer le message islamique à autrui, par la parole, l'exemple ou l'écrit. Le Coran (sourate An-Nahl, 16:125) en précise la méthode recommandée : \"par la sagesse et la belle exhortation\", en excluant toute contrainte (sourate Al-Baqara, 2:256).",
    relatedSlugs: ["nubuwwa"],
  },
  {
    term: "Barakah (Bénédiction)",
    termArabic: "البركة",
    slug: "barakah",
    definition: "La bénédiction ou l'accroissement du bien accordé par Dieu dans une chose, un temps ou une personne.",
    origin: "Racine arabe b-r-k, évoquant l'idée de stabilité et d'abondance.",
    explanation:
      "La barakah désigne une grâce divine qui rend une chose durablement bénéfique au-delà de sa mesure apparente : un temps, un repas, une relation ou une connaissance peuvent en être empreints. Elle est traditionnellement recherchée par la prière, le rappel de Dieu (dhikr) et la conformité aux enseignements prophétiques dans les gestes du quotidien.",
    relatedSlugs: ["dhikr", "dua"],
  },
  {
    term: "Fitrah (Nature innée)",
    termArabic: "الفطرة",
    slug: "fitrah",
    definition: "La disposition naturelle et innée de l'être humain, orientée vers la reconnaissance de Dieu.",
    origin: "Racine arabe f-t-r, évoquant la création originelle.",
    explanation:
      "La fitrah désigne l'état originel dans lequel chaque être humain est créé : une disposition naturelle à reconnaître l'existence d'un Créateur unique. Un hadith rapporte que \"tout nouveau-né naît selon la fitrah\", ses parents ou son environnement l'orientant ensuite vers une croyance particulière. Ce concept sous-tend l'idée que la foi en Dieu répond à une inclination naturelle plutôt qu'à une contrainte extérieure.",
    relatedSlugs: ["tawhid", "iman"],
  },
  {
    term: "Ghusl (Grande ablution)",
    termArabic: "الغسل",
    slug: "ghusl",
    definition: "La grande ablution rituelle, consistant à faire couler l'eau sur l'ensemble du corps.",
    origin: "Terme coranique (Coran 5:6), distinct des petites ablutions (wudu).",
    explanation:
      "Le ghusl est requis après certains états d'impureté majeure - notamment les rapports intimes, les menstrues et les lochies - ainsi qu'avant certains actes recommandés comme la prière du vendredi. Il consiste à faire parvenir l'eau à l'ensemble du corps, précédé de l'intention. Les éléments précisément obligatoires du ghusl font l'objet de nuances entre écoles juridiques, documentées dans le comparateur de fiqh de cette plateforme.",
    relatedSlugs: ["wudu", "salah"],
  },
  {
    term: "Tayammum (Ablution sèche)",
    termArabic: "التيمم",
    slug: "tayammum",
    definition: "L'ablution sèche remplaçant le wudu ou le ghusl en l'absence d'eau ou en cas d'impossibilité de l'utiliser.",
    origin: "Terme coranique (Coran 4:43 et 5:6).",
    explanation:
      "Le tayammum consiste à passer les mains sur une surface terrestre puis sur le visage et les avant-bras, en remplacement de l'eau lorsque celle-ci est indisponible, insuffisante ou que son usage présenterait un risque pour la santé. Il permet ainsi à la prière de rester accessible en toute circonstance, sans que la pureté rituelle ne devienne un obstacle insurmontable.",
    relatedSlugs: ["wudu", "ghusl"],
  },
  {
    term: "Ikhtilaf (Divergence licite)",
    termArabic: "الاختلاف",
    slug: "ikhtilaf",
    definition: "La divergence d'opinion licite entre savants sur une question religieuse, notamment juridique.",
    origin: "Racine arabe kh-l-f, évoquant la différence.",
    explanation:
      "L'ikhtilaf désigne les divergences d'interprétation reconnues comme légitimes entre savants et écoles juridiques, résultant de méthodologies différentes d'analyse des textes plutôt que d'une opposition de principe. Il est traditionnellement distingué du désaccord sur les fondements de la foi, qui relève d'une autre catégorie. Le comparateur de fiqh de cette plateforme illustre concrètement cette pluralité légitime.",
    relatedSlugs: ["ijtihad", "qiyas"],
  },
  {
    term: "Istikhara (Prière de consultation)",
    termArabic: "الاستخارة",
    slug: "istikhara",
    definition: "La prière de consultation par laquelle le croyant demande à Dieu de le guider vers le meilleur choix.",
    origin: "Racine arabe kh-y-r, évoquant le choix du meilleur.",
    explanation:
      "L'istikhara est une prière de deux unités suivie d'une invocation spécifique, accomplie lorsqu'une personne hésite entre plusieurs choix licites et souhaite s'en remettre au jugement de Dieu plutôt qu'à sa seule raison. Elle ne produit pas nécessairement un signe surnaturel immédiat : elle vise avant tout à ancrer la décision dans la confiance en Dieu (tawakkul).",
    relatedSlugs: ["salah", "tawakkul"],
  },
  {
    term: "Khushu' (Humilité recueillie)",
    termArabic: "الخشوع",
    slug: "khushu",
    definition: "L'humilité et la concentration intérieure du cœur, en particulier durant la prière.",
    origin: "Racine arabe kh-sh-'.",
    explanation:
      "Le khushu' désigne un état de présence intérieure et de crainte révérencielle envers Dieu, mentionné dans le Coran comme une qualité des croyants qui réussissent (sourate Al-Mu'minun, 23:1-2). Il est particulièrement recherché durant la prière, où il s'oppose à une récitation mécanique dénuée de conscience du sens des paroles prononcées.",
    relatedSlugs: ["salah", "taqwa"],
  },
  {
    term: "Maslaha (Intérêt général)",
    termArabic: "المصلحة",
    slug: "maslaha",
    definition: "L'intérêt général ou le bien commun, pris en compte comme finalité du droit islamique.",
    origin: "Racine arabe s-l-h, évoquant ce qui est bénéfique.",
    explanation:
      "La maslaha désigne la prise en compte de l'intérêt général comme critère dans l'élaboration ou l'application du droit islamique, notamment lorsque les textes ne traitent pas explicitement une situation nouvelle. Son usage comme source complémentaire du droit varie selon les écoles juridiques, l'école malikite lui accordant traditionnellement une place plus explicite que d'autres.",
    relatedSlugs: ["fiqh", "ijtihad"],
  },
  {
    term: "Qiyamah (Résurrection)",
    termArabic: "القيامة",
    slug: "qiyamah",
    definition: "Le Jour de la Résurrection, où l'ensemble de l'humanité sera ressuscitée pour être jugée.",
    origin: "Terme coranique, l'un des noms donnés au Jour dernier (yawm al-qiyama).",
    explanation:
      "La croyance au Jour de la Résurrection constitue l'un des six piliers de la foi islamique. Elle désigne le moment où, selon la croyance islamique, toute l'humanité sera ressuscitée pour rendre compte de ses actes devant Dieu, avant d'être orientée vers le Paradis (al-Jannah) ou l'Enfer (Jahannam) selon la justice divine.",
    relatedSlugs: ["akhira", "jannah", "jahannam"],
  },
  {
    term: "Ruh (Esprit)",
    termArabic: "الروح",
    slug: "ruh",
    definition: "L'âme ou l'esprit insufflé par Dieu en l'être humain.",
    origin: "Terme coranique (notamment Coran 15:29 et 17:85).",
    explanation:
      "Le ruh désigne le souffle de vie insufflé par Dieu à l'être humain, dont la nature exacte est présentée dans le Coran comme relevant du domaine du savoir divin (\"Dis : l'esprit relève de l'ordre de mon Seigneur\", sourate Al-Isra, 17:85). Il est distingué du nafs (l'âme dans sa dimension psychologique et morale) bien que les deux termes soient parfois employés de manière proche selon les contextes.",
    relatedSlugs: ["akhira", "qadar"],
  },
  {
    term: "Nafs (Âme, soi)",
    termArabic: "النفس",
    slug: "nafs",
    definition: "L'âme ou le soi, dans sa dimension psychologique et morale.",
    origin: "Terme coranique, employé pour désigner la personne, le soi ou l'ego selon le contexte.",
    explanation:
      "Le nafs désigne la dimension intérieure de l'être humain, siège des désirs, des intentions et du jugement moral. Le Coran en distingue plusieurs états : le nafs incitant au mal (ammara bi-s-su', sourate Yusuf, 12:53), le nafs qui se blâme lui-même (lawwama, sourate Al-Qiyama, 75:2), et le nafs apaisé (mutma'inna, sourate Al-Fajr, 89:27), considéré comme l'aboutissement d'un travail de purification spirituelle (tazkiyah).",
    relatedSlugs: ["ruh", "sabr"],
  },
  {
    term: "Tazkiyah (Purification de l'âme)",
    termArabic: "التزكية",
    slug: "tazkiyah",
    definition: "La purification de l'âme, visant à s'éloigner des vices et à cultiver les vertus.",
    origin: "Racine arabe z-k-w, partagée avec le mot zakat, évoquant la croissance et la purification.",
    explanation:
      "La tazkiyah désigne un processus continu de purification intérieure, par lequel le croyant cherche à se défaire de vices tels que l'orgueil (kibr) ou l'ostentation (riya) pour cultiver des vertus comme la sincérité (ikhlas) et l'humilité (tawadu'). Le Coran affirme que \"réussit celui qui la purifie\" (sourate Ash-Shams, 91:9), faisant de ce travail intérieur une condition du succès spirituel.",
    relatedSlugs: ["ikhlas", "riya", "nafs"],
  },
  {
    term: "Zuhd (Détachement)",
    termArabic: "الزهد",
    slug: "zuhd",
    definition: "Le détachement intérieur à l'égard des attraits de ce bas monde.",
    origin: "Racine arabe z-h-d, évoquant le renoncement.",
    explanation:
      "Le zuhd désigne une attitude de détachement envers les biens et plaisirs matériels, non pas nécessairement par leur rejet total, mais par l'absence d'attachement excessif du cœur à leur égard. Il ne s'agit pas d'un ascétisme prescrit comme obligation générale, mais d'une vertu spirituelle particulièrement valorisée dans la littérature de spiritualité islamique (tasawwuf).",
    relatedSlugs: ["tawakkul", "sabr"],
  },
  {
    term: "Yaqin (Certitude)",
    termArabic: "اليقين",
    slug: "yaqin",
    definition: "La certitude ferme de la foi, exempte de doute.",
    origin: "Racine arabe y-q-n.",
    explanation:
      "Le yaqin désigne un degré de certitude intérieure dans la croyance, considéré comme un aboutissement de la foi (iman) au-delà de la simple adhésion intellectuelle. Les auteurs spirituels distinguent traditionnellement plusieurs degrés de certitude, de la connaissance rapportée à l'expérience directe, la certitude la plus complète étant associée à une conscience constante de la présence divine.",
    relatedSlugs: ["iman", "tawakkul"],
  },
  {
    term: "Wasatiyyah (Voie du juste milieu)",
    termArabic: "الوسطية",
    slug: "wasatiyyah",
    definition: "La modération et l'équilibre, présentés comme un trait caractéristique de la communauté musulmane.",
    origin: "Terme coranique (sourate Al-Baqara, 2:143 : \"nous avons fait de vous une communauté du juste milieu\").",
    explanation:
      "La wasatiyyah désigne un principe de modération et d'équilibre entre les excès, que ce soit dans la croyance, la pratique ou le comportement social. Le Coran qualifie la communauté musulmane de \"umma wasat\", une communauté du juste milieu, appelée à éviter aussi bien la négligence que l'excès rigoriste.",
    relatedSlugs: ["umma", "hilm"],
  },
  {
    term: "Ghayb (L'invisible)",
    termArabic: "الغيب",
    slug: "ghayb",
    definition: "Le domaine de l'invisible et de l'inconnu, connu de Dieu seul dans sa totalité.",
    origin: "Racine arabe gh-y-b, évoquant ce qui est caché ou absent.",
    explanation:
      "Le ghayb désigne tout ce qui échappe à la perception humaine directe : Dieu Lui-même, les anges, le Paradis, l'Enfer, ou l'avenir. Croire au ghayb, mentionné dès les premiers versets de la sourate Al-Baqara (2:3) comme une qualité des croyants pieux, constitue un aspect central de la foi islamique, qui ne repose pas uniquement sur ce qui est empiriquement observable.",
    relatedSlugs: ["iman", "qadar"],
  },
  {
    term: "Sadaqah (Aumône volontaire)",
    termArabic: "الصدقة",
    slug: "sadaqah",
    definition: "L'aumône volontaire, distincte de la zakat obligatoire.",
    origin: "Racine arabe s-d-q, partagée avec le mot sidq (véracité), évoquant l'authenticité de la foi que traduit le don.",
    explanation:
      "La sadaqah désigne tout acte de charité volontaire, sans montant ni fréquence fixés, contrairement à la zakat qui constitue une obligation calculée. Elle peut prendre la forme d'un don matériel mais aussi, selon la tradition prophétique, d'un sourire, d'une parole bienveillante ou de tout acte de bien envers autrui, élargissant ainsi la notion de charité au-delà du seul don financier.",
    relatedSlugs: ["zakat", "rahma"],
  },
  {
    term: "Shafa'a (Intercession)",
    termArabic: "الشفاعة",
    slug: "shafaa",
    definition: "L'intercession, notamment celle du Prophète ﷺ, en faveur des croyants le Jour du Jugement.",
    origin: "Terme coranique, encadré par plusieurs versets précisant qu'elle ne peut avoir lieu qu'avec la permission de Dieu (2:255, 20:109).",
    explanation:
      "La shafa'a désigne la possibilité, reconnue dans la croyance sunnite majoritaire, qu'une intercession soit accordée en faveur de certains croyants le Jour du Jugement - notamment celle attribuée au Prophète ﷺ - mais uniquement avec la permission explicite de Dieu, comme le précise le verset du Trône (Ayat al-Kursi, 2:255). Ce concept est encadré pour éviter toute confusion avec une intercession automatique ou indépendante de la volonté divine.",
    relatedSlugs: ["qiyamah", "tawhid"],
  },
  {
    term: "Sirat (Le pont)",
    termArabic: "الصراط",
    slug: "sirat",
    definition: "Le pont tendu au-dessus de l'Enfer que chaque être humain devra traverser le Jour du Jugement.",
    origin: "Terme employé dans la tradition islamique pour désigner ce passage eschatologique, distinct du \"sirat al-mustaqim\" (le droit chemin) mentionné dans la Fatiha.",
    explanation:
      "Selon la tradition islamique, le sirat désigne un pont tendu au-dessus de l'Enfer que chaque personne devra franchir le Jour du Jugement, sa traversée étant plus ou moins aisée selon les œuvres accomplies durant sa vie. Ce terme est à distinguer du \"sirat al-mustaqim\" (le droit chemin) invoqué dans la sourate Al-Fatiha, qui désigne quant à lui la voie droite à suivre dans la vie présente.",
    relatedSlugs: ["qiyamah", "jahannam"],
  },
  {
    term: "Tafakkur (Réflexion méditative)",
    termArabic: "التفكر",
    slug: "tafakkur",
    definition: "La réflexion méditative sur la création, encouragée comme voie vers la reconnaissance de Dieu.",
    origin: "Racine arabe f-k-r, évoquant la pensée.",
    explanation:
      "Le tafakkur désigne une réflexion consciente et orientée, en particulier sur les signes de la création (ayat), encouragée à de nombreuses reprises dans le Coran comme moyen de renforcer la foi par l'observation raisonnée du monde plutôt que par la seule adhésion transmise. Il est souvent associé au dhikr comme deux dimensions complémentaires de la conscience de Dieu.",
    relatedSlugs: ["dhikr", "iman"],
  },
  {
    term: "Hikmah (Sagesse)",
    termArabic: "الحكمة",
    slug: "hikmah",
    definition: "La sagesse, comprise comme la juste compréhension et la juste application de la connaissance.",
    origin: "Terme coranique, mentionné notamment comme un don accordé par Dieu (sourate Al-Baqara, 2:269).",
    explanation:
      "La hikmah désigne une sagesse pratique qui dépasse la simple accumulation de savoir : elle implique de savoir appliquer la connaissance de façon juste, au bon moment et de la bonne manière. Le Coran la présente comme un bien précieux accordé par Dieu à qui Il veut, et la tradition prophétique elle-même est décrite comme portant à la fois le Livre et la sagesse.",
    relatedSlugs: ["adl"],
  },
  {
    term: "Fitna (Épreuve, discorde)",
    termArabic: "الفتنة",
    slug: "fitna",
    definition: "L'épreuve, la tentation ou le trouble susceptible de mettre la foi à l'épreuve.",
    origin: "Racine arabe f-t-n, évoquant à l'origine l'action de mettre à l'épreuve le métal par le feu.",
    explanation:
      "Le terme fitna recouvre plusieurs sens selon le contexte coranique : l'épreuve personnelle de la foi, la tentation par les biens ou le pouvoir, ou encore le trouble et la discorde au sein de la communauté. Ce dernier sens a pris une importance historique particulière pour désigner les grandes crises politiques internes ayant traversé les premiers siècles de l'histoire islamique.",
    relatedSlugs: ["sabr", "taqwa"],
  },
  {
    term: "Awra (Nudité à couvrir)",
    termArabic: "العورة",
    slug: "awra",
    definition: "Les parties du corps dont la dissimulation est requise, notamment dans la prière et devant autrui.",
    origin: "Racine arabe '-w-r, évoquant ce qui doit être protégé du regard.",
    explanation:
      "L'awra désigne les parties du corps dont la couverture est requise par la pudeur (haya') religieuse, leur étendue précise variant selon le contexte (prière, présence d'un mahram ou non) et selon les écoles juridiques. Cette notion s'inscrit dans un cadre plus large de préservation de la pudeur, valorisée comme une qualité morale fondamentale dans la tradition islamique.",
    relatedSlugs: ["hayaa", "salah"],
  },
  {
    term: "Mahram (Parenté prohibant le mariage)",
    termArabic: "المحرم",
    slug: "mahram",
    definition: "Une personne avec laquelle le mariage est définitivement prohibé en raison d'un lien de parenté, d'alliance ou d'allaitement.",
    origin: "Racine arabe h-r-m, partagée avec le mot haram.",
    explanation:
      "Le statut de mahram désigne les personnes avec lesquelles le mariage est interdit de façon permanente - parents proches, certains liens par alliance, ou liens créés par l'allaitement dans la petite enfance. Ce statut a des implications concrètes dans plusieurs domaines de la vie sociale, notamment concernant les règles de pudeur (awra) et de voyage.",
    relatedSlugs: ["nikah", "awra"],
  },
  {
    term: "Salaf (Les premières générations)",
    termArabic: "السلف",
    slug: "salaf",
    definition: "Les premières générations de musulmans, prises comme référence exemplaire par plusieurs courants.",
    origin: "Racine arabe s-l-f, évoquant ce qui précède.",
    explanation:
      "Le terme salaf désigne, au sens le plus courant, les trois premières générations de musulmans après le Prophète ﷺ - ses Compagnons, puis leurs successeurs directs (tabi'un) et les successeurs de ces derniers - considérées par la tradition comme les meilleures générations en raison de leur proximité avec l'enseignement prophétique. Différents courants théologiques et juridiques revendiquent une fidélité méthodologique à leur compréhension, sans qu'il existe un consensus unique sur les implications précises de cette référence.",
    relatedSlugs: ["sunnah", "umma"],
  },
  {
    term: "Jihad (Effort, lutte)",
    termArabic: "الجهاد",
    slug: "jihad",
    definition: "L'effort soutenu fourni dans la voie de Dieu, sous des formes multiples allant de la lutte intérieure contre soi-même à la défense armée strictement encadrée.",
    origin: "Racine arabe j-h-d, évoquant l'effort soutenu et la peine que l'on se donne.",
    explanation:
      "Le terme jihad recouvre, dans son sens le plus large attesté par le Coran et le hadith, tout effort soutenu accompli dans la voie de Dieu : la lutte intérieure contre ses propres défauts et penchants (jihad an-nafs), l'effort d'apprentissage et de transmission de la religion, l'engagement social pour la justice, ou encore la défense armée de la communauté. Un hadith rapporté par Al-Bayhaqi, dont l'authenticité est discutée par les spécialistes du hadith, désigne cette lutte intérieure comme le \"plus grand jihad\" (al-jihad al-akbar) par contraste avec le combat armé.\n\nLe sens juridique restreint (qital, le combat armé) fait l'objet, en fiqh classique, de conditions précises et restrictives : il ne peut être déclaré que par une autorité légitime reconnue, jamais par une initiative individuelle, et s'accompagne de règles strictes de conduite, comme l'illustrent les instructions attribuées au premier calife Abu Bakr interdisant explicitement de tuer femmes, enfants et religieux non-combattants, ou de détruire arbres fruitiers et habitations. Ce cadre juridique restrictif contraste fortement avec l'usage du terme dans certains discours contemporains, qu'ils soient militants ou hostiles à l'Islam, qui tendent l'un comme l'autre à le réduire à sa seule dimension armée.",
    relatedSlugs: ["sabr", "umma"],
  },
  {
    term: "Al-Ahkam al-Khamsa (Les cinq qualifications juridiques)",
    termArabic: "الأحكام الخمسة",
    slug: "ahkam-al-khamsa",
    definition: "Le cadre classique de classification de tout acte humain en cinq catégories juridiques, du strictement obligatoire au strictement interdit.",
    origin: "Terminologie d'usul al-fiqh (méthodologie du droit islamique).",
    explanation:
      "Le fiqh classique classe tout acte humain selon cinq qualifications juridiques (al-ahkam al-khamsa) : le fard/wajib (obligatoire, dont l'abandon est fautif), le mandub/mustahabb (recommandé, dont l'accomplissement est récompensé sans que l'abandon soit fautif), le mubah (neutre, ni récompensé ni sanctionné), le makruh (déconseillé, sans sanction stricte) et le haram (interdit, dont la commission est fautive). Ce cadre en cinq catégories fournit la grille de lecture de base à partir de laquelle les juristes qualifient chaque question de fiqh traitée sur cette plateforme (voir le comparateur des écoles).\n\nCertaines écoles juridiques, notamment hanafite, distinguent en outre le wajib du fard : le fard reposant sur une preuve textuelle certaine et non sujette à interprétation, le wajib sur une preuve légèrement moins définitive - une distinction que les trois autres écoles sunnites ne reconnaissent généralement pas comme catégorie séparée.",
    relatedSlugs: ["fiqh", "haram", "halal"],
  },
  {
    term: "Fatwa (Avis juridique)",
    termArabic: "الفتوى",
    slug: "fatwa",
    definition: "Un avis juridique religieux rendu par un savant qualifié en réponse à une question précise.",
    origin: "Racine arabe f-t-w, liée à la clarification d'une question.",
    explanation:
      "Une fatwa est une réponse juridique donnée par un savant reconnu (mufti) à une question posée par un particulier ou une institution, portant sur un cas précis plutôt que sur une règle générale abstraite. Contrairement à un jugement de tribunal (rendu par un qadi), une fatwa n'a pas de force contraignante : elle a valeur de conseil éclairé et d'avis juridique, que le demandeur reste libre de suivre ou non selon les écoles.\n\nUne même question peut recevoir des fatwas différentes selon le savant consulté, son école juridique, et les circonstances précises exposées, ce qui explique la coexistence normale de fatwas divergentes sur une même question sans que l'une invalide nécessairement l'autre - un principe directement lié à celui de l'ikhtilaf (divergence licite).",
    relatedSlugs: ["ijtihad", "qiyas", "ikhtilaf"],
  },
  {
    term: "Khutbah (Sermon)",
    termArabic: "الخطبة",
    slug: "khutbah",
    definition: "Le sermon prononcé notamment avant la prière collective du vendredi et lors des deux fêtes annuelles.",
    origin: "Racine arabe kh-t-b, évoquant le discours adressé à une assemblée.",
    explanation:
      "La khutbah désigne le sermon prononcé par un orateur (khatib) devant l'assemblée des fidèles, le plus souvent avant la prière collective du vendredi (jumu'a) et lors des prières des deux fêtes annuelles (Aïd al-Fitr et Aïd al-Adha). Elle comprend traditionnellement une exhortation à la piété, un rappel de versets coraniques et de hadiths, et porte fréquemment sur des questions pratiques ou d'actualité concernant la communauté locale.\n\nSa structure et ses conditions de validité (nombre de sermons, éléments obligatoires, langue de récitation) varient selon les écoles juridiques, mais son statut de condition de validité de la prière du vendredi elle-même fait l'objet d'un large consensus parmi les juristes sunnites.",
    relatedSlugs: ["salah"],
  },
  {
    term: "Wali (Ami de Dieu)",
    termArabic: "الولي",
    slug: "wali-allah",
    definition: "Une personne pieuse considérée comme proche de Dieu en raison de sa foi et de sa droiture, sans statut surnaturel officiel.",
    origin: "Racine arabe w-l-y, évoquant la proximité et l'assistance.",
    explanation:
      "Le Coran (sourate Yunus, 10:62-64) affirme que les \"alliés de Dieu\" (awliya Allah) sont ceux qui croient et se prémunissent du mal, leur promettant une bonne nouvelle dans la vie présente et dans l'au-delà, sans qu'aucune procédure de reconnaissance officielle ne soit associée à ce statut dans la théologie sunnite classique - à la différence, par exemple, de la canonisation dans d'autres traditions religieuses. La notion est distincte du sens juridique du même mot employé pour le tuteur matrimonial (voir le comparateur de fiqh).\n\nDans la spiritualité islamique (tasawwuf), certaines figures historiques sont traditionnellement désignées comme awliya en raison de leur piété reconnue et, parfois, d'évènements extraordinaires (karamat) qui leur sont attribués par la tradition biographique ; cette vénération, largement répandue dans le monde musulman, fait toutefois l'objet de débats théologiques quant à ses limites, notamment sur les pratiques entourant certains lieux de sépulture.",
    relatedSlugs: ["ghayb", "barakah"],
  },
  {
    term: "Bay'ah (Serment d'allégeance)",
    termArabic: "البيعة",
    slug: "bayah",
    definition: "Le serment d'allégeance prêté à un dirigeant, reconnaissant son autorité en échange d'un engagement réciproque à gouverner selon la loi islamique.",
    origin: "Racine arabe b-y-', liée à l'idée de transaction, de pacte conclu entre deux parties.",
    explanation:
      "La bay'ah désigne le pacte d'allégeance par lequel une communauté reconnaît l'autorité d'un dirigeant (calife, imam, chef local), en échange de l'engagement de ce dernier à gouverner conformément à la loi islamique et à l'intérêt de la communauté. La pratique remonte aux serments prêtés directement au Prophète ﷺ, notamment lors des serments d'Aqaba précédant l'Hégire, puis à la désignation de chacun des quatre premiers califes (rashidun).\n\nLes juristes et théologiens classiques ont débattu des modalités de désignation légitime d'un dirigeant (élection par un conseil restreint, désignation par le prédécesseur, bay'ah populaire directe) et des conditions dans lesquelles une allégeance déjà prêtée peut être retirée en cas d'injustice manifeste du dirigeant, sans qu'un consensus unique n'émerge sur ce dernier point.",
    relatedSlugs: ["shura", "khilafa"],
  },
  {
    term: "Qadi (Juge)",
    termArabic: "القاضي",
    slug: "qadi",
    definition: "Le juge chargé de trancher les litiges et de rendre des jugements contraignants selon le droit islamique.",
    origin: "Racine arabe q-d-y, évoquant le fait de trancher, d'accomplir ou de décider.",
    explanation:
      "Le qadi est le juge officiellement mandaté par l'autorité politique pour trancher les litiges entre particuliers et rendre des jugements contraignants selon le fiqh, à la différence du mufti dont la fatwa reste un avis consultatif sans force exécutoire. Dès les premiers siècles de l'Islam, la fonction s'est structurée en une institution distincte de l'autorité politique elle-même, certains juges comme Abu Yusuf ayant occupé la fonction suprême de qadi al-qudat (grand juge) auprès des califes.\n\nLes traités classiques de fiqh consacrent des chapitres entiers aux conditions requises pour exercer cette fonction (compétence juridique, intégrité morale) et aux règles de preuve et de procédure devant le tribunal, un corpus qui constitue l'une des branches les plus anciennes et les plus développées du droit islamique.",
    relatedSlugs: ["adl", "fiqh"],
  },
  {
    term: "Adhan (Appel à la prière)",
    termArabic: "الأذان",
    slug: "adhan",
    definition: "L'appel rituel annonçant l'entrée de chacune des cinq heures de prière quotidiennes.",
    origin: "Racine arabe a-dh-n, évoquant le fait d'informer ou d'annoncer publiquement.",
    explanation:
      "L'adhan est l'appel rituel, composé de formules fixes proclamant la grandeur de Dieu et invitant à la prière et à la réussite, lancé publiquement à l'entrée de chacune des cinq heures de prière quotidiennes. Son institution est traditionnellement rattachée à un rêve rapporté par un Compagnon, Abdullah ibn Zayd, validé ensuite par le Prophète ﷺ qui choisit Bilal ibn Rabah, à la voix particulièrement portante, comme premier muezzin de l'histoire islamique.\n\nSa formulation exacte connaît de légères variantes entre écoles sunnites (répétition de certaines formules) et davantage entre sunnisme et chiisme, mais sa fonction essentielle - annoncer publiquement l'entrée du temps de la prière - fait l'objet d'un large consensus depuis l'époque prophétique.",
    relatedSlugs: ["salah"],
  },
  // --- Les Noms d'Allah (Al-Asma al-Husna) ---
  // Le hadith rapporte par At-Tirmidhi evoque "quatre-vingt-dix-neuf noms,
  // cent moins un" sans en fixer une liste unique et definitive : les
  // enumerations transmises par les commentateurs varient legerement d'une
  // compilation a l'autre. Les noms ci-dessous font tous partie des
  // enumerations les plus largement rapportees et sont directement attestes
  // dans le Coran ; ils sont presentes individuellement plutot que numerotes,
  // pour ne pas trancher entre des listes concurrentes.
  {
    term: "Ar-Rahman (Le Tout Misericordieux)",
    termArabic: "الرحمن",
    slug: "ar-rahman",
    definition: "Le Tout Misericordieux, dont la misericorde embrasse l'ensemble de la creation.",
    origin: "L'un des Noms d'Allah, ouvrant la Basmala et la sourate Ar-Rahman.",
    explanation:
      "Ar-Rahman exprime une misericorde universelle, etendue a toute la creation sans distinction de croyance, tandis qu'Ar-Rahim est generalement comprise comme plus specifiquement tournee vers les croyants. Les deux noms, associes des l'ouverture de chaque sourate (a l'exception d'At-Tawba) par la Basmala, soulignent la centralite de cet attribut dans la theologie islamique.",
    relatedSlugs: ["ar-rahim", "asma-wa-sifat"],
  },
  {
    term: "Ar-Rahim (Le Tres Misericordieux)",
    termArabic: "الرحيم",
    slug: "ar-rahim",
    definition: "Le Tres Misericordieux, dont la misericorde est particulierement tournee vers les croyants.",
    origin: "L'un des Noms d'Allah, associe a Ar-Rahman dans la Basmala.",
    explanation:
      "Contrairement a Ar-Rahman, dont la misericorde embrasse toute la creation, Ar-Rahim est traditionnellement comprise comme la misericorde specifique reservee aux croyants, notamment dans l'au-dela. Le Coran (sourate Al-Ahzab, 33:43) emploie ce nom precisement dans ce sens envers les croyants.",
    relatedSlugs: ["ar-rahman", "asma-wa-sifat"],
  },
  {
    term: "Al-Malik (Le Souverain)",
    termArabic: "الملك",
    slug: "al-malik",
    definition: "Le Souverain absolu, maitre de toute chose sans partage ni limite.",
    origin: "L'un des Noms d'Allah, cite notamment en ouverture de la sourate Al-Fatiha.",
    explanation:
      "Al-Malik designe une souverainete totale et sans partage sur l'ensemble de la creation, distincte de toute royaute humaine necessairement limitee dans le temps et l'espace. Le Coran l'associe frequemment au Jour du Jugement (sourate Al-Fatiha, 1:4), moment ou toute autorite terrestre s'efface.",
    relatedSlugs: ["asma-wa-sifat", "qiyamah"],
  },
  {
    term: "Al-Quddus (Le Pur, Le Saint)",
    termArabic: "القدوس",
    slug: "al-quddus",
    definition: "Celui qui est exempt de toute imperfection, de tout defaut et de toute ressemblance avec la creation.",
    origin: "Racine arabe q-d-s, evoquant la purete et la saintete.",
    explanation:
      "Al-Quddus affirme la transcendance absolue de Dieu, au-dela de toute imperfection concevable par l'esprit humain - y compris celles que d'autres attributs divins pourraient, mal compris, laisser supposer. Le nom apparait au debut de la sourate Al-Jumu'a (62:1).",
    relatedSlugs: ["asma-wa-sifat", "tawhid"],
  },
  {
    term: "As-Salam (La Paix)",
    termArabic: "السلام",
    slug: "as-salam",
    definition: "La Source de toute paix et de toute securite, exempte de tout defaut.",
    origin: "Racine arabe s-l-m, partagee avec le mot Islam.",
    explanation:
      "As-Salam designe Dieu comme la source ultime de la paix et de l'integrite, celui dont la nature meme exclut tout mal ou toute imperfection. Ce nom relie etymologiquement la conception du divin a celle de la salutation islamique (as-salamu 'alaykum) et au nom du paradis (Dar as-Salam, sourate Yunus, 10:25).",
    relatedSlugs: ["asma-wa-sifat", "jannah"],
  },
  {
    term: "Al-Mu'min (Celui qui donne la securite)",
    termArabic: "المؤمن",
    slug: "al-mumin",
    definition: "Celui qui accorde la securite et confirme la verite de Ses promesses.",
    origin: "Racine arabe a-m-n, partagee avec iman (la foi).",
    explanation:
      "Al-Mu'min designe Dieu comme source de securite pour Ses creatures et comme garant de la verite de Ses messages et de Ses promesses. Le nom partage sa racine avec iman (la foi) et amn (la securite), soulignant le lien entre confiance en Dieu et paix interieure.",
    relatedSlugs: ["iman", "asma-wa-sifat"],
  },
  {
    term: "Al-Muhaymin (Le Protecteur, le Dominateur)",
    termArabic: "المهيمن",
    slug: "al-muhaymin",
    definition: "Celui qui veille sur toute chose et en garantit la preservation.",
    origin: "Racine arabe liee a la surveillance et a la garde vigilante.",
    explanation:
      "Al-Muhaymin exprime une vigilance et une autorite constantes sur l'ensemble de la creation, rien n'echappant a Sa connaissance ni a Son controle. Le nom apparait aux cotes d'Al-Mu'min dans la sourate Al-Hashr (59:23).",
    relatedSlugs: ["asma-wa-sifat"],
  },
  {
    term: "Al-Aziz (Le Puissant)",
    termArabic: "العزيز",
    slug: "al-aziz",
    definition: "Le Tout-Puissant, dont l'autorite ne peut etre ni vaincue ni contestee.",
    origin: "Racine arabe '-z-z, evoquant la force et l'invincibilite.",
    explanation:
      "Al-Aziz affirme une puissance absolue et invincible, frequemment associee dans le Coran a Al-Hakim (Le Sage) pour souligner que cette puissance s'exerce toujours avec sagesse, jamais de maniere arbitraire.",
    relatedSlugs: ["al-hakim", "asma-wa-sifat"],
  },
  {
    term: "Al-Jabbar (Le Contraignant, l'Irresistible)",
    termArabic: "الجبار",
    slug: "al-jabbar",
    definition: "Celui dont la volonte s'impose irresistiblement et qui repare ce qui est brise.",
    origin: "Racine arabe j-b-r, evoquant a la fois la contrainte et la reparation.",
    explanation:
      "Al-Jabbar combine deux nuances de sa racine : la capacite a imposer Sa volonte de maniere irresistible, et celle a reparer ou consoler ce qui est brise - une dimension parfois soulignee par les commentateurs a cote de la seule idee de domination.",
    relatedSlugs: ["asma-wa-sifat"],
  },
  {
    term: "Al-Mutakabbir (Le Superbe)",
    termArabic: "المتكبر",
    slug: "al-mutakabbir",
    definition: "Celui a qui seul revient le droit a la grandeur et a la superiorite absolues.",
    origin: "Racine arabe k-b-r, evoquant la grandeur.",
    explanation:
      "Al-Mutakabbir affirme que la grandeur absolue n'appartient qu'a Dieu seul - un attribut que l'orgueil humain (kibr), lui, est explicitement condamne dans la tradition islamique comme une usurpation illegitime de ce qui revient exclusivement au Createur.",
    relatedSlugs: ["kibr", "asma-wa-sifat"],
  },
  {
    term: "Al-Khaliq (Le Createur)",
    termArabic: "الخالق",
    slug: "al-khaliq",
    definition: "Celui qui fait exister toute chose a partir du neant, selon une mesure precise.",
    origin: "Racine arabe kh-l-q, evoquant la creation et la mesure.",
    explanation:
      "Al-Khaliq designe l'acte createur dans son ensemble, souvent associe dans le Coran (sourate Al-Hashr, 59:24) a Al-Bari' et Al-Musawwir, qui en detaillent respectivement l'origination sans modele preexistant et le fait de donner forme.",
    relatedSlugs: ["al-bari", "al-musawwir", "asma-wa-sifat"],
  },
  {
    term: "Al-Bari' (Celui qui donne un commencement)",
    termArabic: "البارئ",
    slug: "al-bari",
    definition: "Celui qui fait passer la creation de l'inexistence a l'existence, sans modele prealable.",
    origin: "Racine arabe b-r-', evoquant l'origination libre de toute contrainte.",
    explanation:
      "Al-Bari' souligne que la creation divine n'imite ni ne suit aucun modele preexistant, contrairement a toute production humaine qui s'inspire toujours de quelque chose de deja connu. Cite aux cotes d'Al-Khaliq et Al-Musawwir (sourate Al-Hashr, 59:24).",
    relatedSlugs: ["al-khaliq", "al-musawwir"],
  },
  {
    term: "Al-Musawwir (Le Formateur)",
    termArabic: "المصور",
    slug: "al-musawwir",
    definition: "Celui qui donne a chaque creature sa forme propre et distinctive.",
    origin: "Racine arabe s-w-r, evoquant la forme et l'image.",
    explanation:
      "Al-Musawwir designe l'acte de donner a chaque creature une forme unique parmi l'infinie diversite du vivant, dernier des trois noms crea­teurs cites ensemble (sourate Al-Hashr, 59:24) apres Al-Khaliq et Al-Bari'.",
    relatedSlugs: ["al-khaliq", "al-bari"],
  },
  {
    term: "Al-Ghaffar (Le Grand Pardonneur)",
    termArabic: "الغفار",
    slug: "al-ghaffar",
    definition: "Celui dont le pardon se renouvelle sans cesse, couvrant les fautes repetees.",
    origin: "Racine arabe gh-f-r, evoquant le fait de couvrir, de dissimuler.",
    explanation:
      "La forme intensive d'Al-Ghaffar souligne la repetition du pardon divin, accorde a chaque retour sincere du serviteur malgre la recidive - une misericorde qui ne se lasse jamais, a la difference du pardon humain souvent limite.",
    relatedSlugs: ["tawba", "istighfar"],
  },
  {
    term: "Al-Qahhar (Le Dominateur Supreme)",
    termArabic: "القهار",
    slug: "al-qahhar",
    definition: "Celui dont l'autorite s'impose absolument a toute chose, sans exception possible.",
    origin: "Racine arabe q-h-r, evoquant la domination et la contrainte irresistible.",
    explanation:
      "Al-Qahhar affirme une domination totale sur l'ensemble de la creation, souvent associee dans le Coran a l'unicite divine (sourate Ar-Ra'd, 13:16) : nul autre qu'Allah ne detient un tel pouvoir absolu.",
    relatedSlugs: ["tawhid", "asma-wa-sifat"],
  },
  {
    term: "Al-Wahhab (Le Grand Donateur)",
    termArabic: "الوهاب",
    slug: "al-wahhab",
    definition: "Celui qui donne en abondance, sans attendre aucune contrepartie.",
    origin: "Racine arabe w-h-b, evoquant le don gratuit.",
    explanation:
      "Al-Wahhab souligne le caractere gratuit et inconditionnel des dons divins, accordes par pure generosite plutot qu'en echange d'un merite prealable - une nuance qui le distingue d'Ar-Razzaq, davantage associe a la subsistance regulierement pourvue.",
    relatedSlugs: ["ar-razzaq", "barakah"],
  },
  {
    term: "Ar-Razzaq (Le Grand Pourvoyeur)",
    termArabic: "الرزاق",
    slug: "ar-razzaq",
    definition: "Celui qui pourvoit a la subsistance de toute creature vivante.",
    origin: "Racine arabe r-z-q, evoquant la subsistance et la provision.",
    explanation:
      "Ar-Razzaq affirme que la subsistance de toute creature, humaine comme animale, depend entierement de la providence divine, un theme recurrent du Coran (sourate Adh-Dhariyat, 51:58) invite a la confiance (tawakkul) plutot qu'a l'anxiete excessive.",
    relatedSlugs: ["tawakkul", "al-wahhab"],
  },
  {
    term: "Al-Fattah (Celui qui tranche, qui ouvre)",
    termArabic: "الفتاح",
    slug: "al-fattah",
    definition: "Celui qui ouvre les portes closes et tranche entre le vrai et le faux.",
    origin: "Racine arabe f-t-h, evoquant l'ouverture et la victoire.",
    explanation:
      "Al-Fattah recouvre a la fois l'idee d'ouvrir ce qui etait ferme (portes de la misericorde, de la subsistance, de la comprehension) et celle de trancher un differend avec justice, comme dans la supplique de la sourate Saba (34:26).",
    relatedSlugs: ["asma-wa-sifat"],
  },
  {
    term: "Al-'Alim (L'Omniscient)",
    termArabic: "العليم",
    slug: "al-alim",
    definition: "Celui dont la connaissance embrasse toute chose, visible ou cachee.",
    origin: "Racine arabe '-l-m, evoquant le savoir.",
    explanation:
      "Al-'Alim affirme une connaissance divine totale, incluant l'invisible (ghayb) comme le visible, les pensees les plus intimes comme les evenements les plus vastes - un des attributs les plus frequemment repetes dans le Coran.",
    relatedSlugs: ["ghayb", "asma-wa-sifat"],
  },
  {
    term: "Al-Qabid (Celui qui restreint)",
    termArabic: "القابض",
    slug: "al-qabid",
    definition: "Celui qui restreint la subsistance ou resserre ce qu'Il veut selon Sa sagesse.",
    origin: "Racine arabe q-b-d, evoquant le fait de saisir, de resserrer.",
    explanation:
      "Al-Qabid et Al-Basit forment une paire complementaire (sourate Al-Baqara, 2:245) : Dieu resserre ou etend la subsistance et les circonstances de Ses creatures selon une sagesse qui echappe souvent a la comprehension humaine immediate.",
    relatedSlugs: ["al-basit", "qadar"],
  },
  {
    term: "Al-Basit (Celui qui etend)",
    termArabic: "الباسط",
    slug: "al-basit",
    definition: "Celui qui etend et elargit la subsistance ou les circonstances selon Sa sagesse.",
    origin: "Racine arabe b-s-t, evoquant l'extension, l'elargissement.",
    explanation:
      "Complement d'Al-Qabid, Al-Basit designe l'elargissement de la subsistance ou de toute autre grace accordee a la creation, rappelant que ni la restriction ni l'abondance ne dependent du seul merite apparent d'une personne.",
    relatedSlugs: ["al-qabid"],
  },
  {
    term: "Al-Khafid (Celui qui abaisse)",
    termArabic: "الخافض",
    slug: "al-khafid",
    definition: "Celui qui abaisse qui Il veut, en rang ou en condition.",
    origin: "Racine arabe kh-f-d, evoquant l'abaissement.",
    explanation:
      "Al-Khafid et Ar-Rafi' forment une paire complementaire qui rappelle que l'elevation et l'abaissement en ce monde et dans l'au-dela relevent entierement de la decision divine, non des seuls efforts ou statuts humains.",
    relatedSlugs: ["ar-rafi"],
  },
  {
    term: "Ar-Rafi' (Celui qui eleve)",
    termArabic: "الرافع",
    slug: "ar-rafi",
    definition: "Celui qui eleve qui Il veut, en rang, en dignite ou en degre spirituel.",
    origin: "Racine arabe r-f-', evoquant l'elevation.",
    explanation:
      "Complement d'Al-Khafid, Ar-Rafi' designe l'elevation accordee par Dieu - elevation de rang dans ce monde, mais aussi elevation spirituelle et, pour certains prophetes comme Jesus selon la tradition islamique, elevation physique aupres de Lui.",
    relatedSlugs: ["al-khafid"],
  },
  {
    term: "Al-Mu'izz (Celui qui donne l'honneur)",
    termArabic: "المعز",
    slug: "al-muizz",
    definition: "Celui qui accorde puissance et honneur a qui Il veut.",
    origin: "Racine arabe '-z-z, partagee avec Al-Aziz.",
    explanation:
      "Al-Mu'izz et Al-Mudhill forment une paire (sourate Al Imran, 3:26) rappelant que l'honneur comme l'humiliation, a l'echelle des individus comme des nations, dependent en definitive de la volonte divine plutot que des seuls rapports de force apparents.",
    relatedSlugs: ["al-mudhill"],
  },
  {
    term: "Al-Mudhill (Celui qui humilie)",
    termArabic: "المذل",
    slug: "al-mudhill",
    definition: "Celui qui abaisse et humilie qui Il veut.",
    origin: "Racine arabe dh-l-l, evoquant l'humiliation, la bassesse.",
    explanation:
      "Complement d'Al-Mu'izz, ce nom rappelle que la chute en dignite ou en puissance, comme l'elevation, echappe en definitive au seul controle humain et releve de la sagesse divine.",
    relatedSlugs: ["al-muizz"],
  },
  {
    term: "As-Sami' (Celui qui entend tout)",
    termArabic: "السميع",
    slug: "as-sami",
    definition: "Celui qui entend toute chose, y compris ce qui reste inexprime.",
    origin: "Racine arabe s-m-', evoquant l'ouie.",
    explanation:
      "As-Sami' affirme une audition divine qui n'est limitee ni par la distance ni par le volume, s'etendant jusqu'aux pensees et invocations les plus discretes - une source de reconfort central dans la pratique du du'a.",
    relatedSlugs: ["dua", "asma-wa-sifat"],
  },
  {
    term: "Al-Basir (Celui qui voit tout)",
    termArabic: "البصير",
    slug: "al-basir",
    definition: "Celui qui voit toute chose, dans ses moindres details.",
    origin: "Racine arabe b-s-r, evoquant la vue.",
    explanation:
      "Al-Basir, frequemment associe a As-Sami' dans le Coran, affirme une vision divine totale, y compris de ce qui echappe totalement a la perception humaine - un rappel constant de la surveillance divine sur les actes.",
    relatedSlugs: ["as-sami"],
  },
  {
    term: "Al-Hakam (L'Arbitre, le Juge)",
    termArabic: "الحكم",
    slug: "al-hakam",
    definition: "Celui dont le jugement final tranche tout differend avec une justice parfaite.",
    origin: "Racine arabe h-k-m, partagee avec hikmah (sagesse) et hukm (jugement).",
    explanation:
      "Al-Hakam designe Dieu comme l'arbitre ultime, dont le jugement au Jour dernier tranchera tous les differends humains avec une justice parfaite, echappant a toute erreur ou partialite possible chez un juge humain.",
    relatedSlugs: ["qadi", "al-adl"],
  },
  {
    term: "Al-'Adl (Le Juste)",
    termArabic: "العدل",
    slug: "al-adl",
    definition: "Celui dont chaque decision est parfaitement equitable, sans la moindre injustice.",
    origin: "Racine arabe '-d-l, evoquant l'equite.",
    explanation:
      "Al-'Adl affirme une justice divine absolue, un principe theologique central rappele par le Coran (sourate Fussilat, 41:46) : Dieu ne fait de tort a personne, chaque consequence subie decoulant en definitive des actes propres de chacun.",
    relatedSlugs: ["adl", "zulm"],
  },
  {
    term: "Al-Latif (Le Subtil, le Bienveillant)",
    termArabic: "اللطيف",
    slug: "al-latif",
    definition: "Celui dont la bienveillance atteint Ses creatures par des voies subtiles, souvent imperceptibles.",
    origin: "Racine arabe l-t-f, evoquant la finesse et la delicatesse.",
    explanation:
      "Al-Latif combine deux nuances : une connaissance divine des details les plus subtils de la creation, et une bienveillance qui s'exerce souvent de maniere discrete, sans que le serviteur en percoive immediatement l'origine.",
    relatedSlugs: ["al-khabir"],
  },
  {
    term: "Al-Khabir (Celui qui est parfaitement informe)",
    termArabic: "الخبير",
    slug: "al-khabir",
    definition: "Celui dont la connaissance atteint les realites les plus profondes et cachees.",
    origin: "Racine arabe kh-b-r, evoquant l'information precise et verifiee.",
    explanation:
      "Al-Khabir, souvent associe a Al-Latif, souligne une connaissance divine qui ne se limite pas aux apparences mais penetre la realite profonde de chaque chose et de chaque intention.",
    relatedSlugs: ["al-latif"],
  },
  {
    term: "Al-Halim (Le Longanime, le Clement)",
    termArabic: "الحليم",
    slug: "al-halim",
    definition: "Celui qui differe le chatiment malgre la desobeissance, laissant le temps au repentir.",
    origin: "Racine arabe h-l-m, evoquant la patience et la maitrise de soi.",
    explanation:
      "Al-Halim designe la clemence divine qui s'abstient de punir immediatement la faute, laissant au serviteur le temps de se reprendre - une qualite que la tradition invite egalement a cultiver entre humains (voir hilm).",
    relatedSlugs: ["hilm", "al-ghafur"],
  },
  {
    term: "Al-'Azim (L'Immense)",
    termArabic: "العظيم",
    slug: "al-azim",
    definition: "Celui dont la grandeur depasse toute mesure et toute comparaison concevable.",
    origin: "Racine arabe '-z-m, evoquant l'immensite.",
    explanation:
      "Al-'Azim affirme une grandeur absolue, hors de toute echelle de comparaison avec la creation - un attribut particulierement invoque dans le tasbih rituel (\"Subhan Allahi al-'Azim\") apres l'inclinaison de la priere.",
    relatedSlugs: ["salah", "asma-wa-sifat"],
  },
  {
    term: "Al-Ghafur (Le Grand Pardonneur, l'Indulgent)",
    termArabic: "الغفور",
    slug: "al-ghafur",
    definition: "Celui dont le pardon est vaste et frequent envers Ses creatures repentantes.",
    origin: "Racine arabe gh-f-r, partagee avec Al-Ghaffar.",
    explanation:
      "Proche d'Al-Ghaffar, Al-Ghafur est l'un des noms divins les plus repetes du Coran, souvent associe a Ar-Rahim pour souligner l'etendue du pardon offert a quiconque se repent sincerement.",
    relatedSlugs: ["al-ghaffar", "tawba"],
  },
  {
    term: "Ash-Shakur (Le Reconnaissant)",
    termArabic: "الشكور",
    slug: "ash-shakur",
    definition: "Celui qui recompense genereusement le moindre effort accompli pour Son agrement.",
    origin: "Racine arabe sh-k-r, evoquant la gratitude.",
    explanation:
      "Ash-Shakur designe la generosite divine dans la recompense : meme un acte minime accompli sincerement peut etre demesurement recompense, un encouragement constant a la reconnaissance (shukr) envers Dieu.",
    relatedSlugs: ["asma-wa-sifat"],
  },
  {
    term: "Al-'Aliyy (Le Tres-Haut)",
    termArabic: "العلي",
    slug: "al-aliyy",
    definition: "Celui dont l'elevation, en rang comme en essence, depasse toute conception.",
    origin: "Racine arabe '-l-w, evoquant l'elevation.",
    explanation:
      "Al-'Aliyy affirme une transcendance absolue de Dieu par rapport a la creation, un attribut central de la theologie sunnite classique rappelant qu'aucune limite spatiale ne peut Lui etre attribuee au sens litteral humain.",
    relatedSlugs: ["al-muta-ali", "asma-wa-sifat"],
  },
  {
    term: "Al-Kabir (Le Grand)",
    termArabic: "الكبير",
    slug: "al-kabir",
    definition: "Celui dont la grandeur surpasse celle de toute chose creee.",
    origin: "Racine arabe k-b-r, partagee avec Al-Mutakabbir et takbir.",
    explanation:
      "Al-Kabir affirme une grandeur absolue et incomparable, rappelee a chaque takbir (\"Allahu akbar\", Dieu est plus grand) prononce dans la priere et en de nombreuses autres occasions rituelles.",
    relatedSlugs: ["salah", "al-azim"],
  },
  {
    term: "Al-Hafiz (Le Preservateur, le Gardien)",
    termArabic: "الحفيظ",
    slug: "al-hafiz",
    definition: "Celui qui preserve toute chose de la disparition et de l'alteration.",
    origin: "Racine arabe h-f-z, evoquant la preservation et la memorisation.",
    explanation:
      "Al-Hafiz designe la protection divine exercee sur la creation entiere, notamment invoquee au sujet de la preservation du Coran lui-meme (sourate Al-Hijr, 15:9), garanti contre toute alteration selon la croyance islamique.",
    relatedSlugs: ["asma-wa-sifat"],
  },
  {
    term: "Al-Muqit (Celui qui nourrit, qui soutient)",
    termArabic: "المقيت",
    slug: "al-muqit",
    definition: "Celui qui pourvoit a la subsistance necessaire a chaque creature, dans la mesure exacte.",
    origin: "Racine arabe q-w-t, evoquant la nourriture necessaire a la subsistance.",
    explanation:
      "Al-Muqit souligne une providence divine precise, ajustee aux besoins exacts de chaque creature plutot qu'une simple abondance generale, complement du sens plus large d'Ar-Razzaq.",
    relatedSlugs: ["ar-razzaq"],
  },
  {
    term: "Al-Hasib (Celui qui suffit, qui compte tout)",
    termArabic: "الحسيب",
    slug: "al-hasib",
    definition: "Celui qui suffit a Ses serviteurs et tient le compte exact de tous leurs actes.",
    origin: "Racine arabe h-s-b, evoquant le calcul et le compte.",
    explanation:
      "Al-Hasib combine deux idees : Dieu suffit a quiconque place en Lui sa confiance (sourate At-Talaq, 65:3), et Il tient un compte exact et exhaustif de chaque acte, en vue du jugement dernier.",
    relatedSlugs: ["tawakkul", "qiyamah"],
  },
  {
    term: "Al-Jalil (Le Majestueux)",
    termArabic: "الجليل",
    slug: "al-jalil",
    definition: "Celui dont la majeste inspire une veneration absolue.",
    origin: "Racine arabe j-l-l, evoquant la majeste et la grandeur imposante.",
    explanation:
      "Al-Jalil affirme une majeste divine qui commande le respect et la crainte reverencielle, une dimension complementaire de la proximite exprimee par d'autres noms comme Al-Wadud.",
    relatedSlugs: ["dhul-jalali-wal-ikram"],
  },
  {
    term: "Al-Karim (Le Genereux)",
    termArabic: "الكريم",
    slug: "al-karim",
    definition: "Celui dont la generosite est illimitee, accordee sans mesure ni calcul.",
    origin: "Racine arabe k-r-m, evoquant la noblesse et la generosite.",
    explanation:
      "Al-Karim designe une generosite divine qui depasse tout merite humain, un attribut egalement associe au Coran lui-meme, qualifie a plusieurs reprises de \"Qur'an Karim\" (Coran noble et genereux).",
    relatedSlugs: ["al-wahhab"],
  },
  {
    term: "Ar-Raqib (Celui qui observe)",
    termArabic: "الرقيب",
    slug: "ar-raqib",
    definition: "Celui qui observe et surveille chaque acte, en tout temps et en tout lieu.",
    origin: "Racine arabe r-q-b, evoquant la surveillance vigilante.",
    explanation:
      "Ar-Raqib rappelle une observation divine constante et ininterrompue, fondement de la conscience morale islamique (muraqaba) qui invite le croyant a agir comme s'il etait toujours sous le regard de Dieu.",
    relatedSlugs: ["ihsan", "khushu"],
  },
  {
    term: "Al-Mujib (Celui qui repond)",
    termArabic: "المجيب",
    slug: "al-mujib",
    definition: "Celui qui repond aux invocations de Ses serviteurs.",
    origin: "Racine arabe j-w-b, evoquant la reponse.",
    explanation:
      "Al-Mujib affirme que Dieu repond aux invocations sincères, meme si la reponse peut prendre une forme differente de celle attendue, ou n'apparaitre que dans l'au-dela - une nuance frequemment rappelee au sujet de la du'a.",
    relatedSlugs: ["dua"],
  },
  {
    term: "Al-Wasi' (Le Vaste)",
    termArabic: "الواسع",
    slug: "al-wasi",
    definition: "Celui dont la connaissance, la misericorde et la generosite sont sans limites.",
    origin: "Racine arabe w-s-', evoquant l'ampleur et la vastitude.",
    explanation:
      "Al-Wasi' est employe dans le Coran a propos de la connaissance, de la misericorde et de la capacite divines, soulignant qu'aucune dimension de l'attribut divin ne peut etre bornee par une limite concevable.",
    relatedSlugs: ["asma-wa-sifat"],
  },
  {
    term: "Al-Hakim (Le Sage)",
    termArabic: "الحكيم",
    slug: "al-hakim",
    definition: "Celui dont chaque decision et chaque creation repondent a une sagesse parfaite.",
    origin: "Racine arabe h-k-m, partagee avec hikmah.",
    explanation:
      "Al-Hakim affirme que rien dans la creation ni dans la legislation divine n'est arbitraire : chaque element repond a une sagesse, meme lorsque celle-ci echappe a la comprehension humaine immediate.",
    relatedSlugs: ["hikmah", "al-aziz"],
  },
  {
    term: "Al-Wadud (Le Tout-Aimant)",
    termArabic: "الودود",
    slug: "al-wadud",
    definition: "Celui qui aime Ses serviteurs pieux et se fait aimer d'eux.",
    origin: "Racine arabe w-d-d, evoquant l'affection profonde.",
    explanation:
      "Al-Wadud exprime une dimension d'affection reciproque entre Dieu et Ses serviteurs sinceres, nuance qui contrebalance dans la theologie islamique l'accent parfois porte uniquement sur la crainte reverencielle.",
    relatedSlugs: ["rahma"],
  },
  {
    term: "Al-Majid (Le Glorieux)",
    termArabic: "المجيد",
    slug: "al-majid",
    definition: "Celui dont la gloire et la noblesse sont infinies.",
    origin: "Racine arabe m-j-d, evoquant la gloire et l'honneur eleve.",
    explanation:
      "Al-Majid combine grandeur et generosite dans une meme glorification, un nom egalement applique au Trone divin (Al-'Arsh al-Majid, sourate Al-Buruj, 85:15).",
    relatedSlugs: ["al-karim", "al-jalil"],
  },
  {
    term: "Al-Ba'ith (Celui qui ressuscite)",
    termArabic: "الباعث",
    slug: "al-baith",
    definition: "Celui qui ressuscitera toute la creation le Jour du Jugement.",
    origin: "Racine arabe b-'-th, evoquant l'envoi et le rappel a la vie.",
    explanation:
      "Al-Ba'ith affirme la capacite divine a redonner vie a l'ensemble de la creation lors de la resurrection, un pilier central de l'eschatologie islamique (voir qiyamah).",
    relatedSlugs: ["qiyamah", "al-muhyi"],
  },
  {
    term: "Ash-Shahid (Le Temoin)",
    termArabic: "الشهيد",
    slug: "ash-shahid",
    definition: "Celui qui est temoin de toute chose, sans qu'aucun acte ne Lui echappe.",
    origin: "Racine arabe sh-h-d, partagee avec shahada.",
    explanation:
      "Ash-Shahid affirme un temoignage divin permanent sur les actes de chaque creature, temoignage qui sera rappele lors du jugement final - un theme frequemment associe a As-Sami' et Al-Basir.",
    relatedSlugs: ["qiyamah"],
  },
  {
    term: "Al-Haqq (La Verite)",
    termArabic: "الحق",
    slug: "al-haqq",
    definition: "Celui dont l'existence et les paroles constituent la verite absolue et immuable.",
    origin: "Racine arabe h-q-q, evoquant la verite et la realite certaine.",
    explanation:
      "Al-Haqq designe Dieu comme la seule realite absolument certaine, par opposition a la nature transitoire du monde creel - un attribut au fondement de la distinction islamique entre verite (haqq) et illusion (batil).",
    relatedSlugs: ["asma-wa-sifat"],
  },
  {
    term: "Al-Wakil (Le Garant)",
    termArabic: "الوكيل",
    slug: "al-wakil",
    definition: "Celui a qui l'on peut confier entierement ses affaires, avec une confiance absolue.",
    origin: "Racine arabe w-k-l, evoquant la delegation de confiance.",
    explanation:
      "Al-Wakil designe Dieu comme le garant supreme des affaires de qui place en Lui sa confiance, fondement theologique direct du concept de tawakkul (l'abandon confiant a Dieu).",
    relatedSlugs: ["tawakkul"],
  },
  {
    term: "Al-Qawiyy (Le Fort)",
    termArabic: "القوي",
    slug: "al-qawiyy",
    definition: "Celui dont la force est absolue et jamais sujette a l'epuisement.",
    origin: "Racine arabe q-w-y, evoquant la force.",
    explanation:
      "Al-Qawiyy, souvent associe a Al-'Aziz, affirme une puissance qui ne connait ni fatigue ni diminution, a la difference de toute force creee necessairement limitee.",
    relatedSlugs: ["al-matin"],
  },
  {
    term: "Al-Matin (L'Inebranlable)",
    termArabic: "المتين",
    slug: "al-matin",
    definition: "Celui dont la force est d'une fermete et d'une solidite absolues.",
    origin: "Racine arabe m-t-n, evoquant la solidite et la fermete.",
    explanation:
      "Al-Matin complete Al-Qawiyy en soulignant la fermete inebranlable de la puissance divine, jamais sujette a la moindre faille ou hesitation.",
    relatedSlugs: ["al-qawiyy"],
  },
  {
    term: "Al-Waliyy (Le Protecteur, l'Allie)",
    termArabic: "الولي",
    slug: "al-waliyy",
    definition: "Celui qui protege et prend en charge les affaires de Ses serviteurs croyants.",
    origin: "Racine arabe w-l-y, partagee avec wali (allie de Dieu).",
    explanation:
      "Al-Waliyy designe Dieu comme le protecteur et l'allie veritable des croyants, fondement du concept de wilaya developpe dans la spiritualite islamique - a distinguer du sens juridique de wali (tuteur matrimonial).",
    relatedSlugs: ["wali-allah"],
  },
  {
    term: "Al-Hamid (Le Digne de louange)",
    termArabic: "الحميد",
    slug: "al-hamid",
    definition: "Celui qui merite toute louange, en Lui-meme, independamment de toute creature.",
    origin: "Racine arabe h-m-d, partagee avec Al-Hamdu lillah.",
    explanation:
      "Al-Hamid affirme que Dieu est digne de louange par Son essence meme, independamment du fait que Ses creatures Le louent ou non - fondement de la formule quotidienne al-hamdu lillah.",
    relatedSlugs: ["asma-wa-sifat"],
  },
  {
    term: "Al-Muhsi (Celui qui denombre tout)",
    termArabic: "المحصي",
    slug: "al-muhsi",
    definition: "Celui qui denombre et consigne avec exactitude chaque chose, sans exception.",
    origin: "Racine arabe h-s-y, evoquant le denombrement precis.",
    explanation:
      "Al-Muhsi souligne une connaissance divine si precise qu'elle denombre jusqu'au moindre detail de la creation et des actes de chacun, en vue du jugement final.",
    relatedSlugs: ["al-hasib"],
  },
  {
    term: "Al-Mubdi' (Celui qui commence la creation)",
    termArabic: "المبدئ",
    slug: "al-mubdi",
    definition: "Celui qui a initie la creation a partir du neant, sans modele prealable.",
    origin: "Racine arabe b-d-', partagee avec Al-Bari'.",
    explanation:
      "Al-Mubdi' et Al-Mu'id forment une paire (sourate Al-Buruj, 85:13) qui affirme la meme puissance divine a l'oeuvre au commencement de la creation et lors de la resurrection future.",
    relatedSlugs: ["al-muid"],
  },
  {
    term: "Al-Mu'id (Celui qui refait, qui ressuscite)",
    termArabic: "المعيد",
    slug: "al-muid",
    definition: "Celui qui refera la creation apres sa disparition, lors de la resurrection.",
    origin: "Racine arabe '-w-d, evoquant le retour, le recommencement.",
    explanation:
      "Complement d'Al-Mubdi', Al-Mu'id affirme que la puissance qui a initie la creation est la meme qui la fera renaitre lors de la resurrection, un argument theologique frequemment avance dans le Coran contre le doute sur l'au-dela.",
    relatedSlugs: ["al-mubdi", "qiyamah"],
  },
  {
    term: "Al-Muhyi (Celui qui donne la vie)",
    termArabic: "المحيي",
    slug: "al-muhyi",
    definition: "Celui qui donne la vie a toute chose, du neant comme apres la mort.",
    origin: "Racine arabe h-y-y, partagee avec Al-Hayy.",
    explanation:
      "Al-Muhyi et Al-Mumit forment une paire soulignant que la vie comme la mort, souvent percues comme des forces autonomes, relevent entierement de la decision divine.",
    relatedSlugs: ["al-mumit", "al-hayy"],
  },
  {
    term: "Al-Mumit (Celui qui fait mourir)",
    termArabic: "المميت",
    slug: "al-mumit",
    definition: "Celui qui met fin a la vie de toute creature au moment qu'Il determine.",
    origin: "Racine arabe m-w-t, evoquant la mort.",
    explanation:
      "Complement d'Al-Muhyi, Al-Mumit rappelle que la mort, loin d'etre un hasard ou une simple loi naturelle impersonnelle, survient selon un terme fixe par la volonte divine.",
    relatedSlugs: ["al-muhyi"],
  },
  {
    term: "Al-Hayy (Le Vivant)",
    termArabic: "الحي",
    slug: "al-hayy",
    definition: "Celui dont la vie est eternelle, sans commencement ni fin possible.",
    origin: "Racine arabe h-y-y, evoquant la vie.",
    explanation:
      "Al-Hayy, souvent associe a Al-Qayyum dans le Coran (notamment le Verset du Trone, Ayat al-Kursi, sourate Al-Baqara, 2:255), affirme une vie divine absolue et independante de toute condition exterieure.",
    relatedSlugs: ["al-qayyum"],
  },
  {
    term: "Al-Qayyum (Celui qui subsiste par Lui-meme)",
    termArabic: "القيوم",
    slug: "al-qayyum",
    definition: "Celui qui subsiste par Lui-meme et par qui subsiste toute autre chose.",
    origin: "Racine arabe q-w-m, evoquant le maintien et la subsistance.",
    explanation:
      "Al-Qayyum, associe a Al-Hayy dans le celebre Verset du Trone (Ayat al-Kursi), affirme que Dieu n'a besoin d'aucun soutien exterieur tandis que l'existence de toute autre chose depend entierement de Lui.",
    relatedSlugs: ["al-hayy"],
  },
  {
    term: "Al-Wajid (Celui qui trouve, qui dispose de tout)",
    termArabic: "الواجد",
    slug: "al-wajid",
    definition: "Celui qui ne manque de rien et trouve toujours ce qu'Il veut sans effort.",
    origin: "Racine arabe w-j-d, evoquant le fait de trouver, de disposer.",
    explanation:
      "Al-Wajid affirme une autosuffisance parfaite : rien ne fait defaut a Dieu, et rien ne saurait echapper a Sa disposition ou a Sa volonte.",
    relatedSlugs: ["al-ghaniyy"],
  },
  {
    term: "Al-Wahid (L'Unique)",
    termArabic: "الواحد",
    slug: "al-wahid",
    definition: "Celui qui est unique dans Son essence, sans egal ni semblable.",
    origin: "Racine arabe w-h-d, evoquant l'unicite numerique.",
    explanation:
      "Al-Wahid affirme l'unicite numerique de Dieu, frequemment associe a Al-Ahad pour souligner qu'aucune pluralite ni association ne peut Lui etre attribuee, fondement direct du tawhid.",
    relatedSlugs: ["al-ahad", "tawhid"],
  },
  {
    term: "Al-Ahad (L'Unique, l'Un)",
    termArabic: "الأحد",
    slug: "al-ahad",
    definition: "Celui qui est absolument un, sans composition ni division possible.",
    origin: "Racine arabe a-h-d, evoquant l'unicite absolue - ouvre la sourate Al-Ikhlas.",
    explanation:
      "Al-Ahad, qui ouvre la sourate Al-Ikhlas (\"Dis : Il est Allah, Unique\"), affirme une unicite d'essence excluant toute composition interne, distincte de la simple unicite numerique exprimee par Al-Wahid.",
    relatedSlugs: ["al-wahid", "tawhid"],
  },
  {
    term: "As-Samad (Celui dont tout depend, l'Auto-suffisant)",
    termArabic: "الصمد",
    slug: "as-samad",
    definition: "Celui dont toute creature depend absolument, alors que Lui ne depend de rien ni personne.",
    origin: "Racine arabe s-m-d, cite dans la sourate Al-Ikhlas (112:2).",
    explanation:
      "As-Samad, second nom de la sourate Al-Ikhlas, exprime une autosuffisance absolue conjuguee au fait d'etre la reference ultime vers laquelle toute creature se tourne dans le besoin.",
    relatedSlugs: ["al-ahad", "tawhid"],
  },
  {
    term: "Al-Qadir (Le Capable)",
    termArabic: "القادر",
    slug: "al-qadir",
    definition: "Celui qui a le pouvoir d'accomplir toute chose selon Sa seule volonte.",
    origin: "Racine arabe q-d-r, partagee avec qadar (le decret).",
    explanation:
      "Al-Qadir affirme une capacite divine absolue, sans limite ni effort, fondement theologique direct de la croyance au qadar (le decret divin).",
    relatedSlugs: ["qadar", "al-muqtadir"],
  },
  {
    term: "Al-Muqtadir (Le Tout-Puissant, forme intensive)",
    termArabic: "المقتدر",
    slug: "al-muqtadir",
    definition: "Celui dont la puissance s'exerce de maniere absolue et sans opposition possible.",
    origin: "Racine arabe q-d-r, forme intensive d'Al-Qadir.",
    explanation:
      "Al-Muqtadir intensifie le sens d'Al-Qadir, soulignant que nulle resistance ne peut jamais s'opposer efficacement a la puissance divine.",
    relatedSlugs: ["al-qadir"],
  },
  {
    term: "Al-Muqaddim (Celui qui avance)",
    termArabic: "المقدم",
    slug: "al-muqaddim",
    definition: "Celui qui avance qui Il veut, en rang comme dans le temps.",
    origin: "Racine arabe q-d-m, evoquant ce qui precede.",
    explanation:
      "Al-Muqaddim et Al-Mu'akhkhir forment une paire rappelant que l'ordre des choses - qui progresse, qui est retarde - depend entierement de la sagesse divine.",
    relatedSlugs: ["al-muakhkhir"],
  },
  {
    term: "Al-Mu'akhkhir (Celui qui retarde)",
    termArabic: "المؤخر",
    slug: "al-muakhkhir",
    definition: "Celui qui retarde qui Il veut, en rang comme dans le temps.",
    origin: "Racine arabe '-kh-r, evoquant ce qui suit, ce qui est retarde.",
    explanation:
      "Complement d'Al-Muqaddim, ce nom rappelle que meme le report ou le delai apparent dans les affaires humaines s'inscrit dans une sagesse et une decision divines.",
    relatedSlugs: ["al-muqaddim"],
  },
  {
    term: "Al-Awwal (Le Premier)",
    termArabic: "الأول",
    slug: "al-awwal",
    definition: "Celui qui existe avant toute chose, sans commencement.",
    origin: "Racine arabe a-w-l, evoquant ce qui precede tout.",
    explanation:
      "Al-Awwal, associe dans le Coran (sourate Al-Hadid, 57:3) a Al-Akhir, Az-Zahir et Al-Batin, affirme que Dieu precede l'existence de toute chose creee, sans lui-meme avoir de commencement.",
    relatedSlugs: ["al-akhir", "az-zahir", "al-batin"],
  },
  {
    term: "Al-Akhir (Le Dernier)",
    termArabic: "الآخر",
    slug: "al-akhir",
    definition: "Celui qui demeure apres la disparition de toute chose creee.",
    origin: "Racine arabe a-kh-r, evoquant ce qui vient apres tout.",
    explanation:
      "Al-Akhir complete Al-Awwal : Dieu subsistera apres la fin de toute creation, sans Lui-meme connaitre de fin - les quatre noms cites ensemble (57:3) forment une affirmation compacte de la transcendance divine du temps et de l'espace.",
    relatedSlugs: ["al-awwal"],
  },
  {
    term: "Az-Zahir (L'Apparent, l'Evident)",
    termArabic: "الظاهر",
    slug: "az-zahir",
    definition: "Celui dont l'existence est manifeste par d'innombrables signes dans la creation.",
    origin: "Racine arabe z-h-r, evoquant ce qui est visible, manifeste.",
    explanation:
      "Az-Zahir, associe a Al-Batin (sourate Al-Hadid, 57:3), designe une manifestation de Dieu a travers les signes de la creation, tout en excluant toute visibilite physique directe telle que la concoivent les theologiens sunnites classiques.",
    relatedSlugs: ["al-batin"],
  },
  {
    term: "Al-Batin (Le Cache, l'Immanent)",
    termArabic: "الباطن",
    slug: "al-batin",
    definition: "Celui dont l'essence reste inaccessible a toute perception directe.",
    origin: "Racine arabe b-t-n, evoquant ce qui est cache, interieur.",
    explanation:
      "Complement d'Az-Zahir, Al-Batin affirme que l'essence divine demeure au-dela de toute perception sensorielle ou intellectuelle directe, meme si Ses effets sont partout manifestes.",
    relatedSlugs: ["az-zahir", "ghayb"],
  },
  {
    term: "Al-Muta'ali (Le Tres-Eleve, le Transcendant)",
    termArabic: "المتعالي",
    slug: "al-muta-ali",
    definition: "Celui dont la transcendance depasse toute conception humaine possible.",
    origin: "Racine arabe '-l-w, forme intensive proche d'Al-'Aliyy.",
    explanation:
      "Al-Muta'ali renforce Al-'Aliyy en insistant sur une transcendance qui echappe absolument a toute tentative de comparaison ou d'imagination humaine.",
    relatedSlugs: ["al-aliyy"],
  },
  {
    term: "Al-Barr (Le Bienfaisant)",
    termArabic: "البر",
    slug: "al-barr",
    definition: "Celui dont la bienveillance et la bonte envers Ses creatures sont immenses.",
    origin: "Racine arabe b-r-r, partagee avec birr (la piete filiale et la bonte).",
    explanation:
      "Al-Barr designe une bonte divine active et genereuse, dont la racine est egalement celle du birr (bienfaisance, notamment envers les parents), reliant la bonte divine et la bonte humaine attendue en retour.",
    relatedSlugs: ["rahma"],
  },
  {
    term: "At-Tawwab (Celui qui accueille le repentir)",
    termArabic: "التواب",
    slug: "at-tawwab",
    definition: "Celui qui accueille sans cesse le repentir sincere de Ses serviteurs.",
    origin: "Racine arabe t-w-b, partagee avec tawba.",
    explanation:
      "At-Tawwab affirme que Dieu accueille le repentir de facon repetee, autant de fois que le serviteur revient sincerement vers Lui apres une faute - fondement theologique direct du concept de tawba.",
    relatedSlugs: ["tawba", "istighfar"],
  },
  {
    term: "Al-Muntaqim (Celui qui chatie les injustes)",
    termArabic: "المنتقم",
    slug: "al-muntaqim",
    definition: "Celui qui chatie avec justice les oppresseurs et les injustes obstines.",
    origin: "Racine arabe n-q-m, evoquant la retribution.",
    explanation:
      "Al-Muntaqim s'exerce toujours conjointement avec la justice (Al-'Adl) et le pardon (Al-Ghafur) : la tradition insiste sur le fait que ce nom s'applique specifiquement a l'injustice obstinee et non repentie, jamais de maniere arbitraire.",
    relatedSlugs: ["al-adl", "zulm"],
  },
  {
    term: "Al-'Afuww (Celui qui efface les fautes)",
    termArabic: "العفو",
    slug: "al-afuww",
    definition: "Celui qui efface entierement la faute, au-dela du simple pardon.",
    origin: "Racine arabe '-f-w, evoquant l'effacement total.",
    explanation:
      "Al-'Afuww va au-dela d'Al-Ghafur (qui couvre la faute) en designant son effacement complet, comme si elle n'avait jamais existe - une nuance rappelee dans une invocation celebre du mois de Ramadan.",
    relatedSlugs: ["al-ghafur", "istighfar"],
  },
  {
    term: "Ar-Ra'uf (Le Tres Bienveillant)",
    termArabic: "الرؤوف",
    slug: "ar-rauf",
    definition: "Celui dont la bienveillance et la douceur envers les croyants sont particulierement intenses.",
    origin: "Racine arabe r-'-f, evoquant une douceur et une tendresse profondes.",
    explanation:
      "Ar-Ra'uf, souvent associe a Ar-Rahim, exprime une nuance de douceur et de tendresse particulierement intense, notamment rappelee au sujet du comportement du Prophete ﷺ envers les croyants (sourate At-Tawba, 9:128).",
    relatedSlugs: ["ar-rahim"],
  },
  {
    term: "Malik al-Mulk (Le Maitre de la Royaute)",
    termArabic: "مالك الملك",
    slug: "malik-al-mulk",
    definition: "Celui qui accorde et retire la royaute et l'autorite a qui Il veut.",
    origin: "Expression coranique (sourate Al Imran, 3:26).",
    explanation:
      "Malik al-Mulk rappelle que toute autorite politique ou royaute terrestre, aussi puissante paraisse-t-elle, demeure entierement soumise a la decision divine, qui peut l'accorder ou la retirer selon Sa sagesse.",
    relatedSlugs: ["al-malik", "khilafa"],
  },
  {
    term: "Dhul-Jalali wal-Ikram (Le Maitre de la Majeste et de la Generosite)",
    termArabic: "ذو الجلال والإكرام",
    slug: "dhul-jalali-wal-ikram",
    definition: "Celui qui reunit en Lui-meme une majeste absolue et une generosite infinie.",
    origin: "Expression coranique, notamment sourate Ar-Rahman (55:27, 55:78).",
    explanation:
      "Cette expression, qui clot la sourate Ar-Rahman, associe deux dimensions apparemment opposees de la nature divine - la majeste qui impose le respect et la generosite qui rapproche - sans que l'une n'exclue l'autre.",
    relatedSlugs: ["al-jalil", "al-karim"],
  },
  {
    term: "Al-Muqsit (L'Equitable)",
    termArabic: "المقسط",
    slug: "al-muqsit",
    definition: "Celui qui etablit l'equite parfaite entre toutes Ses creatures.",
    origin: "Racine arabe q-s-t, evoquant l'equite et la juste repartition.",
    explanation:
      "Al-Muqsit souligne particulierement la dimension de juste repartition entre les creatures, complement d'Al-'Adl qui insiste davantage sur la rectitude du jugement lui-meme.",
    relatedSlugs: ["al-adl"],
  },
  {
    term: "Al-Jami' (Celui qui rassemble)",
    termArabic: "الجامع",
    slug: "al-jami",
    definition: "Celui qui rassemblera toute l'humanite au Jour du Jugement.",
    origin: "Racine arabe j-m-', evoquant le rassemblement.",
    explanation:
      "Al-Jami' est notamment invoque dans le Coran (sourate Al Imran, 3:9) au sujet du rassemblement de toute l'humanite en un jour dont nul ne doute, moment central de l'eschatologie islamique.",
    relatedSlugs: ["qiyamah"],
  },
  {
    term: "Al-Ghaniyy (Celui qui se suffit a Lui-meme)",
    termArabic: "الغني",
    slug: "al-ghaniyy",
    definition: "Celui qui n'a absolument besoin de rien ni de personne.",
    origin: "Racine arabe gh-n-y, evoquant la richesse et l'autosuffisance.",
    explanation:
      "Al-Ghaniyy affirme une autosuffisance absolue : contrairement a toute richesse creee, toujours relative et dependante, rien ne manque jamais a Dieu et Il n'a besoin d'aucune de Ses creatures.",
    relatedSlugs: ["al-wajid", "al-mughni"],
  },
  {
    term: "Al-Mughni (Celui qui enrichit)",
    termArabic: "المغني",
    slug: "al-mughni",
    definition: "Celui qui enrichit qui Il veut, materiellement ou spirituellement.",
    origin: "Racine arabe gh-n-y, forme causative d'Al-Ghaniyy.",
    explanation:
      "Al-Mughni complete Al-Ghaniyy : Dieu, Lui-meme totalement independant, est aussi la source de toute richesse et suffisance accordee a Ses creatures.",
    relatedSlugs: ["al-ghaniyy"],
  },
  {
    term: "Al-Mani' (Celui qui empeche)",
    termArabic: "المانع",
    slug: "al-mani",
    definition: "Celui qui protege et empeche le mal d'atteindre qui Il veut.",
    origin: "Racine arabe m-n-', evoquant l'empechement, la protection.",
    explanation:
      "Al-Mani' designe la capacite divine a ecarter une epreuve, une perte ou un mal de la vie de Ses serviteurs, complement des noms lies au don et a la generosite.",
    relatedSlugs: ["al-hafiz"],
  },
  {
    term: "Ad-Darr (Celui qui peut nuire)",
    termArabic: "الضار",
    slug: "ad-darr",
    definition: "Celui qui permet, selon Sa sagesse, que survienne une epreuve ou un tort.",
    origin: "Racine arabe d-r-r, evoquant le dommage.",
    explanation:
      "Toujours associe a An-Nafi' dans la tradition, ce nom rappelle que meme l'epreuve ou l'adversite s'inscrit dans la volonte et la sagesse divines, jamais dans le hasard pur.",
    relatedSlugs: ["an-nafi", "qadar"],
  },
  {
    term: "An-Nafi' (Celui qui est utile, qui beneficie)",
    termArabic: "النافع",
    slug: "an-nafi",
    definition: "Celui qui accorde le bien et le benefice a qui Il veut.",
    origin: "Racine arabe n-f-', evoquant l'utilite et le benefice.",
    explanation:
      "An-Nafi' et Ad-Darr forment une paire rappelant que le bien comme l'epreuve proviennent en definitive de la meme source divine, invitant a la patience (sabr) dans l'adversite comme a la gratitude dans l'aisance.",
    relatedSlugs: ["ad-darr", "sabr"],
  },
  {
    term: "An-Nur (La Lumiere)",
    termArabic: "النور",
    slug: "an-nur",
    definition: "Celui qui illumine les cieux et la terre, au sens propre comme au sens spirituel.",
    origin: "Racine arabe n-w-r, evoquant la lumiere - cite en sourate An-Nur (24:35).",
    explanation:
      "An-Nur, dans le celebre \"Verset de la Lumiere\" (sourate An-Nur, 24:35), est generalement compris par les theologiens sunnites classiques comme celui qui guide et illumine, plutot qu'au sens litteral d'une lumiere physique.",
    relatedSlugs: ["al-hadi"],
  },
  {
    term: "Al-Hadi (Le Guide)",
    termArabic: "الهادي",
    slug: "al-hadi",
    definition: "Celui qui guide vers la verite qui Il veut parmi Ses creatures.",
    origin: "Racine arabe h-d-y, partagee avec huda (la guidance).",
    explanation:
      "Al-Hadi designe la guidance divine comme une grace accordee, rappelee cinq fois par jour dans la demande de la sourate Al-Fatiha (\"guide-nous sur le droit chemin\", 1:6).",
    relatedSlugs: ["salah"],
  },
  {
    term: "Al-Badi' (L'Inventeur incomparable)",
    termArabic: "البديع",
    slug: "al-badi",
    definition: "Celui qui cree de maniere absolument originale, sans modele ni precedent.",
    origin: "Racine arabe b-d-', evoquant l'invention sans precedent.",
    explanation:
      "Al-Badi' souligne le caractere radicalement original de la creation divine, cite dans le Coran (sourate Al-Baqara, 2:117) a propos de la creation des cieux et de la terre sans aucun modele prealable.",
    relatedSlugs: ["al-khaliq"],
  },
  {
    term: "Al-Baqi (Le Subsistant, l'Eternel)",
    termArabic: "الباقي",
    slug: "al-baqi",
    definition: "Celui dont l'existence demeure eternellement, sans fin possible.",
    origin: "Racine arabe b-q-y, evoquant la permanence.",
    explanation:
      "Al-Baqi affirme une permanence absolue, par opposition a la nature perissable de toute creation, un theme rappele dans le Coran (sourate Ar-Rahman, 55:26-27) : toute chose sur terre disparaitra, seule demeurera la face de Dieu.",
    relatedSlugs: ["al-akhir"],
  },
  {
    term: "Al-Warith (L'Heritier)",
    termArabic: "الوارث",
    slug: "al-warith",
    definition: "Celui a qui reviendra en definitive toute chose apres la disparition de Ses creatures.",
    origin: "Racine arabe w-r-th, partagee avec mirath (l'heritage).",
    explanation:
      "Al-Warith rappelle que toute possession humaine n'est que temporaire : au terme de toute existence creee, seule la possession divine originelle et eternelle demeure.",
    relatedSlugs: ["al-baqi"],
  },
  {
    term: "Ar-Rashid (Celui qui guide vers la droiture)",
    termArabic: "الرشيد",
    slug: "ar-rashid",
    definition: "Celui dont la conduite de toute chose vers sa fin est parfaitement droite et sage.",
    origin: "Racine arabe r-sh-d, evoquant la droiture et la maturite de jugement.",
    explanation:
      "Ar-Rashid designe une direction divine parfaitement droite de toute chose vers sa finalite propre, sans jamais d'egarement ni d'erreur possible.",
    relatedSlugs: ["al-hadi"],
  },
  {
    term: "As-Sabur (Le Tres Patient)",
    termArabic: "الصبور",
    slug: "as-sabur",
    definition: "Celui qui differe le chatiment avec une patience infinie face a la desobeissance.",
    origin: "Racine arabe s-b-r, partagee avec sabr.",
    explanation:
      "As-Sabur, proche d'Al-Halim, souligne une patience divine qui laisse aux creatures un temps considerable pour se corriger avant toute consequence, un modele indirect pour la patience humaine (sabr).",
    relatedSlugs: ["sabr", "al-halim"],
  },
  // --- Terminologie du fiqh : transactions (mu'amalat) ---
  {
    term: "Bay' (Contrat de vente)",
    termArabic: "البيع",
    slug: "bay",
    definition: "Le contrat par lequel un bien est echange contre un prix determine.",
    origin: "Racine arabe b-y-', terme generique du fiqh des transactions.",
    explanation:
      "Le bay' designe le contrat de vente au sens large, forme de base a partir de laquelle le fiqh des transactions (mu'amalat) developpe des variantes specialisees (salam, istisna', ijara...) repondant a des besoins economiques particuliers, chacune soumise a ses propres conditions de validite.",
    relatedSlugs: ["riba", "gharar"],
  },
  {
    term: "Ijara (Location, bail)",
    termArabic: "الإجارة",
    slug: "ijara",
    definition: "Le contrat par lequel l'usage d'un bien ou d'un service est loue pour une duree determinee.",
    origin: "Racine arabe a-j-r, evoquant la retribution d'un service ou d'un usage.",
    explanation:
      "L'ijara couvre aussi bien la location de biens (immobilier, materiel) que la retribution d'un travail ou d'un service, et sert aujourd'hui de base a plusieurs produits de finance islamique visant a structurer un financement sans recourir a un pret interet-porteur.",
    relatedSlugs: ["bay", "riba"],
  },
  {
    term: "Mudaraba (Commandite, partenariat capital-travail)",
    termArabic: "المضاربة",
    slug: "mudaraba",
    definition: "Un partenariat ou l'un apporte le capital et l'autre le travail, les pertes financieres incombant au seul bailleur de fonds.",
    origin: "Racine arabe d-r-b, evoquant le fait de parcourir (la terre) pour le commerce.",
    explanation:
      "Dans la mudaraba, le profit est partage selon une proportion convenue a l'avance, tandis qu'une perte financiere est supportee par le seul apporteur de capital - le gerant n'ayant perdu que son travail, sauf negligence ou faute de sa part.",
    relatedSlugs: ["musharaka", "riba"],
  },
  {
    term: "Musharaka (Partenariat, coentreprise)",
    termArabic: "المشاركة",
    slug: "musharaka",
    definition: "Un partenariat ou plusieurs parties apportent conjointement capital et parfois travail, partageant profits et pertes.",
    origin: "Racine arabe sh-r-k, evoquant l'association.",
    explanation:
      "A la difference de la mudaraba, ou seul un partenaire apporte le capital, la musharaka implique un apport en capital par plusieurs parties, les pertes etant alors partagees au prorata de la mise de chacune.",
    relatedSlugs: ["mudaraba"],
  },
  {
    term: "Wakala (Mandat, procuration)",
    termArabic: "الوكالة",
    slug: "wakala",
    definition: "Le contrat par lequel une personne charge une autre d'agir en son nom dans une affaire determinee.",
    origin: "Racine arabe w-k-l, partagee avec le Nom divin Al-Wakil.",
    explanation:
      "La wakala organise juridiquement la delegation d'une action a un mandataire, un mecanisme largement utilise en droit islamique classique aussi bien pour le commerce que pour la representation dans un contrat de mariage.",
    relatedSlugs: ["al-wakil"],
  },
  {
    term: "Kafala (Caution, garantie)",
    termArabic: "الكفالة",
    slug: "kafala",
    definition: "L'engagement par lequel une personne se porte garante d'une dette ou d'une obligation d'autrui.",
    origin: "Racine arabe k-f-l, evoquant la prise en charge.",
    explanation:
      "La kafala designe, en fiqh classique des transactions, le fait de se porter garant du remboursement d'une dette ou de la comparution d'une personne - un sens distinct de son usage contemporain pour designer la prise en charge d'un enfant.",
    relatedSlugs: ["rahn"],
  },
  {
    term: "Rahn (Gage, nantissement)",
    termArabic: "الرهن",
    slug: "rahn",
    definition: "Un bien remis en garantie du remboursement d'une dette.",
    origin: "Racine arabe r-h-n, evoquant la retention en garantie.",
    explanation:
      "Le rahn permet au creancier de retenir un bien du debiteur en garantie, avec des regles precises sur sa conservation et son eventuelle vente en cas de defaut de paiement, sans que le creancier ne puisse en tirer un usage constituant un interet dissimule.",
    relatedSlugs: ["kafala", "riba"],
  },
  {
    term: "Hiba (Donation)",
    termArabic: "الهبة",
    slug: "hiba",
    definition: "Le transfert volontaire et gratuit de la propriete d'un bien, sans contrepartie.",
    origin: "Racine arabe h-b-b, evoquant le don.",
    explanation:
      "La hiba se distingue de la sadaqah par l'absence de visee explicitement caritative et de la wasiyya par sa prise d'effet immediate plutot qu'apres le deces du donateur - le fiqh classique en detaille les conditions de validite et de revocation.",
    relatedSlugs: ["sadaqah", "wasiyya"],
  },
  {
    term: "Waqf (Fondation pieuse)",
    termArabic: "الوقف",
    slug: "waqf",
    definition: "Un bien immobilise de facon permanente au profit d'une oeuvre charitable ou d'usage public.",
    origin: "Racine arabe w-q-f, evoquant l'arret, l'immobilisation.",
    explanation:
      "Le waqf consiste a retirer definitivement un bien du commerce (il ne peut plus etre vendu ni herite) pour en affecter durablement les revenus a une cause pieuse - mosquee, ecole, puits, soutien aux pauvres. Ce mecanisme a historiquement finance une grande partie des institutions educatives et sociales du monde musulman.",
    relatedSlugs: ["sadaqah"],
  },
  {
    term: "Wasiyya (Testament)",
    termArabic: "الوصية",
    slug: "wasiyya",
    definition: "Une disposition volontaire prenant effet apres le deces, limitee au tiers du patrimoine pour un non-heritier.",
    origin: "Racine arabe w-s-y, evoquant la recommandation.",
    explanation:
      "Le fiqh classique limite la wasiyya au tiers maximum du patrimoine au profit d'une personne qui n'est pas deja heritier legal, afin de ne pas contourner les parts fixes attribuees par les regles successorales (fara'id).",
    relatedSlugs: ["mirath", "hiba"],
  },
  {
    term: "Salam (Vente a terme)",
    termArabic: "بيع السلم",
    slug: "salam",
    definition: "Une vente ou le prix est paye immediatement pour une livraison differee du bien, precisement decrit.",
    origin: "Terme technique du fiqh des transactions.",
    explanation:
      "Le salam inverse l'ordre habituel d'un contrat a terme (livraison immediate, paiement differe) : ici le paiement est immediat, la livraison future, une exception encadree a l'interdiction generale de vendre ce qu'on ne possede pas encore, utile notamment pour financer les producteurs agricoles.",
    relatedSlugs: ["bay", "istisna"],
  },
  {
    term: "Istisna' (Contrat de fabrication)",
    termArabic: "الاستصناع",
    slug: "istisna",
    definition: "Un contrat de commande d'un bien a fabriquer selon des specifications determinees.",
    origin: "Racine arabe s-n-', evoquant la fabrication.",
    explanation:
      "L'istisna' permet de commander un bien manufacture (construction, equipement) avant sa fabrication, le paiement pouvant etre echelonne - un mecanisme aujourd'hui repris dans le financement islamique de projets industriels et immobiliers.",
    relatedSlugs: ["salam"],
  },
  {
    term: "Gharar (Incertitude excessive)",
    termArabic: "الغرر",
    slug: "gharar",
    definition: "Une incertitude excessive sur l'objet ou les termes d'un contrat, rendant la transaction illicite.",
    origin: "Racine arabe gh-r-r, evoquant le risque et la tromperie.",
    explanation:
      "Le gharar designe une ambiguite ou un alea qui pourrait exposer l'une des parties a une perte imprevisible - vendre un bien non encore existant ou non identifiable precisement, par exemple - et constitue, avec le riba, l'un des deux grands interdits structurant le fiqh des transactions.",
    relatedSlugs: ["riba", "maysir"],
  },
  {
    term: "Maysir (Jeu de hasard)",
    termArabic: "الميسر",
    slug: "maysir",
    definition: "Tout jeu ou pari fonde sur le hasard, ou le gain de l'un implique necessairement la perte de l'autre.",
    origin: "Terme coranique (sourate Al-Baqara, 2:219), evoquant le jeu de hasard preislamique.",
    explanation:
      "Le Coran interdit explicitement le maysir aux cotes du vin, y voyant une source de discorde sociale plus grande que son benefice apparent. Le principe s'etend en fiqh contemporain a toute transaction financiere structuree comme un pari a somme nulle.",
    relatedSlugs: ["gharar", "riba"],
  },
  {
    term: "Shuf'a (Droit de preemption)",
    termArabic: "الشفعة",
    slug: "shufa",
    definition: "Le droit d'un copropriétaire ou d'un voisin a se substituer a l'acheteur d'un bien immobilier indivis.",
    origin: "Racine arabe sh-f-', evoquant le fait de joindre, d'ajouter.",
    explanation:
      "La shuf'a permet au copropriétaire d'un bien indivis, ou dans certaines ecoles au voisin immediat, de racheter la part vendue a un tiers au meme prix, afin de limiter les conflits lies au morcellement de la propriete.",
    relatedSlugs: ["bay"],
  },
  {
    term: "Qard Hasan (Pret sans interet)",
    termArabic: "القرض الحسن",
    slug: "qard-hasan",
    definition: "Un pret accorde par bienveillance, remboursable a l'identique sans aucun interet.",
    origin: "Composition arabe de qard (pret) et hasan (bon, beau).",
    explanation:
      "Le qard hasan est presente dans le Coran (sourate Al-Baqara, 2:245) comme un acte de generosite assimile a un pret fait a Dieu Lui-meme, fondement religieux direct de l'interdiction du riba dans les transactions entre particuliers.",
    relatedSlugs: ["riba", "sadaqah"],
  },
  // --- Terminologie du fiqh : famille (munakahat) et heritage ---
  {
    term: "Talaq (Repudiation, divorce)",
    termArabic: "الطلاق",
    slug: "talaq",
    definition: "La dissolution du mariage a l'initiative de l'epoux, selon une procedure encadree par le fiqh.",
    origin: "Racine arabe t-l-q, evoquant la liberation, le relachement.",
    explanation:
      "Bien que permis, le talaq est decrit dans un hadith rapporte par Abu Dawud comme \"l'acte licite le plus deteste d'Allah\", et son exercice est strictement encadre (delai de reflexion, tentatives de reconciliation, limite a trois repudiations) pour en dissuader un usage impulsif.",
    relatedSlugs: ["idda", "khula"],
  },
  {
    term: "Khul' (Divorce a l'initiative de la femme)",
    termArabic: "الخلع",
    slug: "khula",
    definition: "La dissolution du mariage demandee par l'epouse, generalement moyennant une compensation financiere.",
    origin: "Racine arabe kh-l-', evoquant le fait de se defaire, d'ôter.",
    explanation:
      "Le khul' permet a une epouse de mettre fin au mariage, le plus souvent en restituant tout ou partie du mahr recu, un mecanisme dont la validite est directement attestee dans le Coran (sourate Al-Baqara, 2:229) et le hadith.",
    relatedSlugs: ["talaq"],
  },
  {
    term: "Idda (Delai de viduite)",
    termArabic: "العدة",
    slug: "idda",
    definition: "La periode d'attente qu'une femme divorcee ou veuve doit observer avant de pouvoir se remarier.",
    origin: "Racine arabe '-d-d, evoquant le decompte.",
    explanation:
      "L'idda, dont la duree varie selon la situation (divorce, veuvage, grossesse), vise a etablir avec certitude une eventuelle grossesse en cours avant tout remariage, tout en menageant un temps de reflexion apres un divorce.",
    relatedSlugs: ["talaq"],
  },
  {
    term: "Nafaqa (Pension, entretien obligatoire)",
    termArabic: "النفقة",
    slug: "nafaqa",
    definition: "L'obligation d'entretien materiel due par un mari a son epouse, ou par un parent a ses enfants.",
    origin: "Racine arabe n-f-q, evoquant la depense.",
    explanation:
      "La nafaqa couvre le logement, la nourriture et les besoins essentiels dus par l'epoux a son epouse durant le mariage - et souvent durant l'idda - ainsi que l'obligation d'entretien des parents envers leurs enfants mineurs.",
    relatedSlugs: ["hadana"],
  },
  {
    term: "Hadana (Garde des enfants)",
    termArabic: "الحضانة",
    slug: "hadana",
    definition: "Le droit et le devoir de prendre en charge un enfant au quotidien apres une separation des parents.",
    origin: "Racine arabe h-d-n, evoquant le fait de porter contre soi, de proteger.",
    explanation:
      "Les criteres d'attribution de la hadana (age de l'enfant, priorite generalement donnee a la mere pour le jeune age dans la plupart des ecoles) varient selon les madhabs, tout en placant systematiquement l'interet de l'enfant au coeur de la decision.",
    relatedSlugs: ["nafaqa"],
  },
  {
    term: "Radaa (Parente de lait)",
    termArabic: "الرضاعة",
    slug: "radaa",
    definition: "Le lien de parente cree par l'allaitement d'un nourrisson par une femme autre que sa mere.",
    origin: "Racine arabe r-d-', evoquant l'allaitement.",
    explanation:
      "La radaa cree, selon des conditions de nombre et de duree qui divergent entre ecoles (voir le comparateur de fiqh), un empechement au mariage comparable a la parente par le sang - fondement du statut de mahram par allaitement.",
    relatedSlugs: ["mahram", "nikah"],
  },
  {
    term: "Mirath (Heritage, droit successoral)",
    termArabic: "الميراث",
    slug: "mirath",
    definition: "L'ensemble des regles fixant la repartition du patrimoine d'un defunt entre ses heritiers legaux.",
    origin: "Racine arabe w-r-th, partagee avec le Nom divin Al-Warith.",
    explanation:
      "Le droit successoral islamique (aussi appele 'ilm al-fara'id, la science des parts fixes) fixe des parts precises pour chaque categorie d'heritiers directement enoncees dans le Coran (sourate An-Nisa, 4:11-12), l'un des domaines du fiqh les plus detailles et les plus mathematiquement codifies.",
    relatedSlugs: ["al-warith", "wasiyya"],
  },
  // --- Terminologie du fiqh : droit penal (hudud, qisas, ta'zir) ---
  {
    term: "Hudud (Peines fixees par les textes)",
    termArabic: "الحدود",
    slug: "hudud",
    definition: "Les peines dont la nature est fixee directement par le Coran ou la Sunna, pour un nombre limite d'infractions graves.",
    origin: "Racine arabe h-d-d, evoquant la limite fixee, la frontiere.",
    explanation:
      "Les hudud concernent un nombre restreint d'infractions (vol qualifie, brigandage, calomnie d'adultere, certaines formes de zina) et se caracterisent par des conditions de preuve exceptionnellement strictes en fiqh classique, rendant leur application effective rare - les juristes insistant traditionnellement sur le principe qu'un doute suffit a ecarter la peine.",
    relatedSlugs: ["qisas", "tazir"],
  },
  {
    term: "Qisas (Loi du talion)",
    termArabic: "القصاص",
    slug: "qisas",
    definition: "Le droit de la victime ou de ses ayants droit a une sanction equivalente au prejudice subi, ou d'y renoncer contre compensation.",
    origin: "Racine arabe q-s-s, evoquant le fait de suivre, d'egaler.",
    explanation:
      "Le qisas, encadre par le Coran (sourate Al-Baqara, 2:178), ouvre explicitement la voie au pardon ou a une compensation financiere (diyya) comme alternative preferable a l'application stricte de la peine, la victime ou sa famille conservant le dernier mot.",
    relatedSlugs: ["diyya", "hudud"],
  },
  {
    term: "Diyya (Prix du sang, compensation)",
    termArabic: "الدية",
    slug: "diyya",
    definition: "La compensation financiere versee a la victime ou a sa famille en cas d'homicide ou de blessure, alternative au qisas.",
    origin: "Racine arabe w-d-y, evoquant le paiement d'une compensation.",
    explanation:
      "La diyya offre une alternative pacifique au talion, son montant etant precisement fixe par le fiqh classique selon la nature du prejudice - un mecanisme qui a historiquement contribue a limiter les cycles de vengeance tribale.",
    relatedSlugs: ["qisas"],
  },
  {
    term: "Ta'zir (Peine discretionnaire)",
    termArabic: "التعزير",
    slug: "tazir",
    definition: "Une sanction laissee a l'appreciation du juge pour les infractions non couvertes par les hudud ou le qisas.",
    origin: "Racine arabe '-z-r, evoquant la correction, la dissuasion.",
    explanation:
      "Le ta'zir couvre la grande majorite des infractions en droit penal islamique classique, sa nature et son intensite etant laissees a l'appreciation du qadi en fonction des circonstances, contrairement aux hudud dont la peine est fixee par les textes.",
    relatedSlugs: ["hudud", "qadi"],
  },
  // --- Methodologie du fiqh (usul al-fiqh), au-dela des sources deja traitees ---
  {
    term: "Madhab (Ecole juridique)",
    termArabic: "المذهب",
    slug: "madhab",
    definition: "Une ecole de pensee juridique organisee autour de la methodologie d'un juriste fondateur et de ses successeurs.",
    origin: "Racine arabe dh-h-b, evoquant la voie suivie.",
    explanation:
      "Les quatre madhabs sunnites survivants (hanafite, malikite, shafi'ite, hanbalite, voir le comparateur de fiqh) partagent les memes sources fondamentales mais divergent dans leur methodologie d'interpretation et le poids relatif accorde a chacune.",
    relatedSlugs: ["fiqh", "ijtihad"],
  },
  {
    term: "Istihsan (Preference juridique)",
    termArabic: "الاستحسان",
    slug: "istihsan",
    definition: "Le fait de s'ecarter d'une analogie stricte lorsqu'elle mene a un resultat juge inequitable, au profit d'une solution plus adaptee.",
    origin: "Racine arabe h-s-n, evoquant ce qui est juge bon, prefere.",
    explanation:
      "L'istihsan, particulierement developpe par l'ecole hanafite, permet au juriste de privilegier une solution qui sert mieux l'esprit general de la loi lorsque l'application litterale d'une analogie (qiyas) produirait un resultat contraire au bon sens ou a l'equite.",
    relatedSlugs: ["qiyas", "maslaha"],
  },
  {
    term: "Istishab (Presomption de continuite)",
    termArabic: "الاستصحاب",
    slug: "istishab",
    definition: "Le principe selon lequel un etat de fait ou de droit etabli est presume perdurer tant que le contraire n'est pas prouve.",
    origin: "Racine arabe s-h-b, evoquant l'accompagnement, la continuite.",
    explanation:
      "L'istishab sert par exemple a presumer la validite d'un mariage ou d'un etat de purete rituelle tant qu'aucune preuve contraire n'est etablie, principe methodologique proche de la presomption d'innocence en droit contemporain.",
    relatedSlugs: ["qiyas"],
  },
  {
    term: "'Urf (Coutume)",
    termArabic: "العرف",
    slug: "urf",
    definition: "La coutume etablie d'une societe, reconnue comme source secondaire du droit dans les domaines non regles par un texte explicite.",
    origin: "Racine arabe '-r-f, evoquant ce qui est connu, reconnu.",
    explanation:
      "L''urf permet au fiqh de s'adapter a la diversite des contextes culturels dans lesquels l'islam s'est repandu, a condition de ne jamais contredire un texte explicite du Coran ou de la Sunna - un principe methodologique qui explique une part des divergences regionales de pratique.",
    relatedSlugs: ["maslaha", "ijtihad"],
  },
  {
    term: "Sadd adh-Dhara'i (Blocage des moyens menant a un mal)",
    termArabic: "سد الذرائع",
    slug: "sadd-adh-dharai",
    definition: "Le principe consistant a interdire un acte licite en soi lorsqu'il sert de moyen detourne vers un resultat illicite.",
    origin: "Composition arabe de sadd (blocage) et dhara'i (moyens, pretextes).",
    explanation:
      "Particulierement developpe par les ecoles malikite et hanbalite, ce principe methodologique vise a preserver l'esprit d'une interdiction (comme celle du riba) plutot que sa seule lettre, en bloquant les montages qui y parviendraient par une voie detournee.",
    relatedSlugs: ["riba", "maslaha"],
  },
  {
    term: "Mujtahid (Celui qui exerce l'effort d'interpretation)",
    termArabic: "المجتهد",
    slug: "mujtahid",
    definition: "Un juriste qualifie pour exercer l'ijtihad, l'effort personnel d'interpretation des textes.",
    origin: "Racine arabe j-h-d, partagee avec ijtihad et jihad.",
    explanation:
      "Le statut de mujtahid, reconnu aux fondateurs des grandes ecoles juridiques et a leurs pairs les plus qualifies, suppose une maitrise approfondie du Coran, du hadith, de la langue arabe et des positions deja etablies par le consensus (ijma') des generations precedentes.",
    relatedSlugs: ["ijtihad", "taqlid"],
  },
  // --- Sciences du hadith, au-dela de l'isnad deja traite ---
  {
    term: "Sahih (Authentique)",
    termArabic: "صحيح",
    slug: "sahih",
    definition: "Le plus haut degre d'authenticite d'un hadith, dont la chaine de transmission remplit toutes les conditions de rigueur.",
    origin: "Terme technique de mustalah al-hadith (science de la classification du hadith).",
    explanation:
      "Un hadith est qualifie de sahih lorsque sa chaine de transmission (isnad) est continue, chaque transmetteur fiable et rigoureux dans sa memorisation, et son contenu (matn) exempt de toute anomalie (shadh) ou defaut cache ('illa) detecte par les specialistes.",
    relatedSlugs: ["isnad", "hasan"],
  },
  {
    term: "Hasan (Bon)",
    termArabic: "حسن",
    slug: "hasan",
    definition: "Un degre d'authenticite juste en dessous du sahih, generalement du a une memorisation legerement moins rigoureuse d'un transmetteur.",
    origin: "Terme technique de mustalah al-hadith.",
    explanation:
      "Un hadith hasan reunit les memes conditions qu'un hadith sahih, a l'exception d'un transmetteur dont la precision de memorisation est jugee legerement inferieure sans etre disqualifiante - il reste utilisable comme argument juridique et religieux.",
    relatedSlugs: ["sahih", "daif"],
  },
  {
    term: "Da'if (Faible)",
    termArabic: "ضعيف",
    slug: "daif",
    definition: "Un hadith dont la chaine de transmission ou le contenu presente une faiblesse ne remplissant pas les conditions du sahih ou du hasan.",
    origin: "Terme technique de mustalah al-hadith.",
    explanation:
      "Un hadith da'if peut resulter d'une rupture dans la chaine de transmission ou d'un transmetteur juge peu fiable ; son usage reste debattu parmi les savants, certains l'acceptant pour l'incitation a la vertu (targhib) mais jamais pour etablir une regle juridique ou un point de croyance.",
    relatedSlugs: ["hasan", "mawdu"],
  },
  {
    term: "Mawdu' (Fabrique, apocryphe)",
    termArabic: "موضوع",
    slug: "mawdu",
    definition: "Un propos faussement attribue au Prophete ﷺ, sans aucune authenticite.",
    origin: "Racine arabe w-d-', evoquant le fait de poser, d'inventer.",
    explanation:
      "L'identification des hadiths mawdu' constitue l'un des grands travaux historiques des specialistes du hadith, motives par la necessite de proteger la Sunna de fabrications motivees par des raisons theologiques, politiques ou sectaires diverses.",
    relatedSlugs: ["daif", "isnad"],
  },
  {
    term: "Mutawatir (Rapporte par une multitude continue)",
    termArabic: "متواتر",
    slug: "mutawatir",
    definition: "Un hadith rapporte a chaque generation par un nombre de transmetteurs si important qu'une collusion mensongere est jugee impossible.",
    origin: "Racine arabe w-t-r, evoquant la succession continue.",
    explanation:
      "Le hadith mutawatir, tres rare en pratique, procure une certitude comparable a celle du Coran lui-meme, par opposition au hadith ahad, transmis par un nombre plus restreint de chaines a chaque generation.",
    relatedSlugs: ["ahad-hadith"],
  },
  {
    term: "Ahad (Rapporte par un nombre limite de chaines)",
    termArabic: "آحاد",
    slug: "ahad-hadith",
    definition: "Un hadith qui ne reunit pas les conditions du mutawatir, transmis par un nombre plus restreint de chaines.",
    origin: "Racine arabe a-h-d, evoquant l'unite, le nombre limite.",
    explanation:
      "La grande majorite des hadiths du corpus islamique, y compris ceux consideres comme sahih, relevent de la categorie ahad ; leur statut epistemologique (certitude ou forte probabilite) a fait l'objet de debats classiques entre theologiens et juristes.",
    relatedSlugs: ["mutawatir", "sahih"],
  },
  {
    term: "Marfu' (Attribue directement au Prophete)",
    termArabic: "مرفوع",
    slug: "marfu",
    definition: "Un hadith dont le contenu est explicitement attribue a une parole, un acte ou une approbation du Prophete ﷺ.",
    origin: "Racine arabe r-f-', evoquant l'elevation (jusqu'au Prophete).",
    explanation:
      "Le marfu' se distingue du mawquf (attribue seulement a un Compagnon) et du maqtu' (attribue a un successeur), une distinction essentielle pour evaluer la portee normative d'un rapport dans le fiqh et la theologie.",
    relatedSlugs: ["mawquf", "maqtu"],
  },
  {
    term: "Mawquf (Attribue a un Compagnon)",
    termArabic: "موقوف",
    slug: "mawquf",
    definition: "Un propos ou un acte rapporte d'un Compagnon du Prophete, sans l'attribuer directement a ce dernier.",
    origin: "Racine arabe w-q-f, evoquant l'arret (a un Compagnon).",
    explanation:
      "Un rapport mawquf conserve une valeur importante pour comprendre la pratique de la premiere generation, sans avoir la meme portee normative directe qu'un hadith explicitement remonte jusqu'au Prophete ﷺ (marfu').",
    relatedSlugs: ["marfu"],
  },
  {
    term: "Maqtu' (Attribue a un successeur)",
    termArabic: "مقطوع",
    slug: "maqtu",
    definition: "Un propos ou un acte rapporte d'un successeur (tabi'i), sans remonter jusqu'a un Compagnon ou au Prophete.",
    origin: "Racine arabe q-t-', evoquant l'interruption (avant le Compagnon).",
    explanation:
      "Le maqtu' occupe le degre normatif le plus limite parmi ces trois categories, utile surtout pour documenter la comprehension et la pratique des generations qui ont directement succede aux Compagnons.",
    relatedSlugs: ["mawquf", "salaf"],
  },
  {
    term: "Munkar (Rejete)",
    termArabic: "منكر",
    slug: "munkar",
    definition: "Un hadith rapporte par un transmetteur faible et qui contredit un rapport plus fiable sur le meme sujet.",
    origin: "Racine arabe n-k-r, evoquant ce qui est meconnu, rejete.",
    explanation:
      "Le hadith munkar se distingue du shadh par la faiblesse du transmetteur en cause : un rapporteur peu fiable contredisant une version plus solidement etablie par des chaines plus fiables.",
    relatedSlugs: ["shadh", "daif"],
  },
  {
    term: "Shadh (Anormal, isole)",
    termArabic: "شاذ",
    slug: "shadh",
    definition: "Un hadith rapporte par un transmetteur par ailleurs fiable, mais qui contredit un rapport plus fiable encore.",
    origin: "Racine arabe sh-dh-dh, evoquant ce qui s'ecarte de la norme.",
    explanation:
      "A la difference du munkar, le shadh implique un transmetteur globalement digne de confiance, dont la version isolee s'ecarte neanmoins de celle, mieux etablie, rapportee par des chaines plus nombreuses ou plus solides.",
    relatedSlugs: ["munkar"],
  },
  {
    term: "Jarh wa Ta'dil (Critique et validation des transmetteurs)",
    termArabic: "الجرح والتعديل",
    slug: "jarh-wa-tadil",
    definition: "La discipline consacree a l'evaluation critique de la fiabilite de chaque transmetteur de hadith.",
    origin: "Composition arabe de jarh (invalidation) et ta'dil (validation).",
    explanation:
      "Cette discipline a donne naissance a d'immenses dictionnaires biographiques evaluant, transmetteur par transmetteur, la fiabilite et la precision de memorisation de plusieurs dizaines de milliers de rapporteurs a travers les generations, fondement meme de la methode d'authentification du hadith.",
    relatedSlugs: ["isnad", "salaf"],
  },
  {
    term: "Musnad (Recueil organise par rapporteur)",
    termArabic: "المسند",
    slug: "musnad",
    definition: "Un type de recueil de hadiths organise selon le Compagnon qui les a rapportes, plutot que par sujet.",
    origin: "Racine arabe s-n-d, partagee avec isnad.",
    explanation:
      "Le plus celebre exemple est le Musnad de l'imam Ahmad ibn Hanbal, qui regroupe environ trente mille traditions classees par Compagnon rapporteur plutot que par theme juridique - une structure qui facilite la verification d'une chaine mais rend la recherche par sujet plus laborieuse.",
    relatedSlugs: ["isnad", "musannaf"],
  },
  {
    term: "Musannaf (Recueil organise par sujet)",
    termArabic: "المصنف",
    slug: "musannaf",
    definition: "Un type de recueil de hadiths organise par theme ou chapitre de fiqh, plutot que par rapporteur.",
    origin: "Racine arabe s-n-f, evoquant le classement par categorie.",
    explanation:
      "Contrairement au musnad, le musannaf regroupe les hadiths par sujet (purification, priere, jeune...), une organisation plus directement utile a la pratique du fiqh, adoptee notamment par les Sahih de Bukhari et Muslim.",
    relatedSlugs: ["musnad", "sahih"],
  },
  {
    term: "Hadith Qudsi (Parole divine rapportee par le Prophete)",
    termArabic: "الحديث القدسي",
    slug: "hadith-qudsi",
    definition: "Une parole attribuee a Dieu, rapportee par le Prophete ﷺ en dehors du texte coranique lui-meme.",
    origin: "Racine arabe q-d-s, evoquant la saintete.",
    explanation:
      "A la difference du Coran, recite mot pour mot comme revelation directe et inimitable, le hadith qudsi transmet un sens attribue a Dieu mais formule dans les propres termes du Prophete ﷺ - une distinction theologique fine mais importante entre les deux types de revelation.",
    relatedSlugs: ["wahy", "sahih"],
  },
  // --- Termes de l'adoration (ibadat), au-dela de ce qui est deja traite ---
  {
    term: "Niyyah (Intention)",
    termArabic: "النية",
    slug: "niyyah",
    definition: "L'intention interieure qui conditionne la validite et la valeur religieuse de tout acte d'adoration.",
    origin: "Racine arabe n-w-y, evoquant le dessein, le projet.",
    explanation:
      "Le hadith d'ouverture du recueil de Bukhari (\"les actes ne valent que par leurs intentions\") place la niyyah au fondement meme du droit et de la spiritualite islamiques : un meme acte exterieur peut avoir une valeur religieuse radicalement differente selon l'intention qui l'anime.",
    relatedSlugs: ["ikhlas", "riya"],
  },
  {
    term: "Jama'a (Priere en groupe)",
    termArabic: "الجماعة",
    slug: "jamaa",
    definition: "La priere accomplie collectivement derriere un imam, plutot qu'individuellement.",
    origin: "Racine arabe j-m-', evoquant le rassemblement.",
    explanation:
      "La priere en jama'a, particulierement encouragee pour les hommes a la mosquee, est rapportee par un hadith de Bukhari et Muslim comme recompensee vingt-sept fois plus que la priere individuelle, et renforce la dimension communautaire de l'islam au-dela du seul acte rituel.",
    relatedSlugs: ["salah", "jumua"],
  },
  {
    term: "Jumu'a (Vendredi, priere du vendredi)",
    termArabic: "الجمعة",
    slug: "jumua",
    definition: "La priere collective obligatoire du vendredi midi, remplacant le dhuhr, precedee de deux sermons.",
    origin: "Racine arabe j-m-', partagee avec jama'a - donne son nom au vendredi.",
    explanation:
      "La jumu'a rassemble la communaute locale une fois par semaine autour d'un sermon (khutbah) souvent consacre a des questions d'actualite ou d'enseignement pratique, une institution sociale autant que rituelle.",
    relatedSlugs: ["khutbah", "jamaa"],
  },
  {
    term: "Witr (Priere impaire de cloture nocturne)",
    termArabic: "الوتر",
    slug: "witr",
    definition: "Une priere accomplie apres le 'Isha jusqu'a l'aube, composee d'un nombre impair d'unites.",
    origin: "Racine arabe w-t-r, evoquant l'imparite.",
    explanation:
      "Le witr cloture traditionnellement les prieres nocturnes, son statut juridique (obligatoire ou fortement recommande) faisant l'objet d'une divergence entre ecoles (voir le comparateur de fiqh).",
    relatedSlugs: ["salah", "tarawih"],
  },
  {
    term: "Tarawih (Prieres nocturnes de Ramadan)",
    termArabic: "التراويح",
    slug: "tarawih",
    definition: "Des prieres surerogatoires accomplies collectivement chaque nuit du mois de Ramadan, apres le 'Isha.",
    origin: "Racine arabe r-w-h, evoquant le repos pris entre chaque serie d'unites.",
    explanation:
      "Instituees dans leur forme collective regulariere par le calife Umar ibn al-Khattab, les tarawih donnent souvent lieu a la recitation complete du Coran reparti sur le mois, un moment fort de la vie spirituelle communautaire du Ramadan.",
    relatedSlugs: ["sawm", "witr"],
  },
  {
    term: "Takbir (Formule \"Allahu akbar\")",
    termArabic: "التكبير",
    slug: "takbir",
    definition: "La formule \"Allahu akbar\" (Dieu est plus grand), prononcee a de nombreux moments rituels.",
    origin: "Racine arabe k-b-r, partagee avec Al-Kabir.",
    explanation:
      "Le takbir ouvre la priere (takbirat al-ihram), rythme ses transitions, et est recite en de nombreuses autres occasions (Aid, appel a la priere, sacrifice) comme rappel constant de la grandeur divine face a toute preoccupation mondaine.",
    relatedSlugs: ["al-kabir", "salah"],
  },
  {
    term: "Tasbih (Formule de glorification)",
    termArabic: "التسبيح",
    slug: "tasbih",
    definition: "La formule \"Subhan Allah\" (Gloire a Dieu), affirmant Sa transcendance au-dela de toute imperfection.",
    origin: "Racine arabe s-b-h, evoquant la glorification.",
    explanation:
      "Le tasbih, souvent repete a l'aide d'un chapelet (sibha), exprime l'exclusion de toute imperfection concevable de la nature divine, formule recitee notamment lors de l'inclinaison et de la prosternation de la priere.",
    relatedSlugs: ["dhikr", "al-quddus"],
  },
  {
    term: "Tahmid (Formule de louange)",
    termArabic: "التحميد",
    slug: "tahmid",
    definition: "La formule \"Al-hamdu lillah\" (Louange a Dieu), exprimant la reconnaissance envers Dieu.",
    origin: "Racine arabe h-m-d, partagee avec Al-Hamid.",
    explanation:
      "Le tahmid accompagne aussi bien les moments de joie que d'epreuve dans la pratique islamique quotidienne, rappelant que toute louange authentique revient en definitive a Dieu seul.",
    relatedSlugs: ["al-hamid", "dhikr"],
  },
  {
    term: "Tahlil (Formule \"La ilaha illallah\")",
    termArabic: "التهليل",
    slug: "tahlil",
    definition: "La formule \"La ilaha illallah\" (Il n'y a de divinite digne d'adoration qu'Allah), premiere partie de la shahada.",
    origin: "Racine arabe h-l-l, evoquant la proclamation.",
    explanation:
      "Le tahlil constitue l'affirmation la plus directe du tawhid, repetee frequemment dans le dhikr quotidien et considere par de nombreux savants comme la formule d'invocation la plus meritoire.",
    relatedSlugs: ["tawhid", "dhikr"],
  },
  {
    term: "Ta'awwudh (Formule de refuge)",
    termArabic: "التعوذ",
    slug: "taawwudh",
    definition: "La formule \"A'udhu billahi min ash-shaytani r-rajim\" (Je cherche refuge aupres de Dieu contre Satan le maudit).",
    origin: "Racine arabe '-w-dh, evoquant la recherche de refuge.",
    explanation:
      "Le ta'awwudh est recite avant toute lecture du Coran, conformement a l'instruction coranique elle-meme (sourate An-Nahl, 16:98), comme protection contre les suggestions de Shaytan durant la recitation.",
    relatedSlugs: ["shaytan", "dua"],
  },
  {
    term: "Nisab (Seuil de richesse imposable)",
    termArabic: "النصاب",
    slug: "nisab",
    definition: "Le seuil minimal de richesse a partir duquel la zakat devient obligatoire.",
    origin: "Racine arabe n-s-b, evoquant le seuil, la part fixee.",
    explanation:
      "Le nisab, generalement calcule par reference a une quantite d'or ou d'argent, determine qui est effectivement redevable de la zakat ; en dessous de ce seuil, aucune zakat n'est due sur les biens concernes.",
    relatedSlugs: ["zakat", "hawl"],
  },
  {
    term: "Hawl (Annee lunaire de possession)",
    termArabic: "الحول",
    slug: "hawl",
    definition: "La duree d'une annee lunaire complete durant laquelle un bien doit etre conserve pour etre soumis a la zakat.",
    origin: "Racine arabe h-w-l, evoquant le cycle annuel.",
    explanation:
      "La condition du hawl, applicable notamment a l'or, l'argent et aux avoirs commerciaux, exclut de la zakat les biens acquis puis rapidement depenses au cours de l'annee, ciblant l'epargne durable plutot que les flux ponctuels.",
    relatedSlugs: ["nisab", "zakat"],
  },
  {
    term: "Udhiyya (Sacrifice de l'Aid al-Adha)",
    termArabic: "الأضحية",
    slug: "udhiyya",
    definition: "Le sacrifice rituel d'un animal accompli lors de l'Aid al-Adha, en commemoration du sacrifice d'Ibrahim.",
    origin: "Racine arabe d-h-y, evoquant le moment du sacrifice.",
    explanation:
      "L'udhiyya commemore la soumission d'Ibrahim pret a sacrifier son fils sur ordre divin, finalement remplace par un belier - la viande du sacrifice etant traditionnellement partagee entre la famille, les proches et les necessiteux.",
    relatedSlugs: ["hajj"],
  },
  {
    term: "Aqiqa (Sacrifice de naissance)",
    termArabic: "العقيقة",
    slug: "aqiqa",
    definition: "Le sacrifice recommande a l'occasion de la naissance d'un enfant, generalement au septieme jour.",
    origin: "Racine arabe '-q-q, evoquant a l'origine les cheveux du nouveau-ne rases a cette occasion.",
    explanation:
      "L'aqiqa, accompagnee traditionnellement du rasage des cheveux du nouveau-ne et du choix de son prenom, exprime la gratitude envers Dieu pour la naissance et s'accompagne, comme l'udhiyya, d'un partage de la viande.",
    relatedSlugs: ["udhiyya"],
  },
  {
    term: "Istinja (Purification apres les besoins naturels)",
    termArabic: "الاستنجاء",
    slug: "istinja",
    definition: "La purification requise apres avoir satisfait ses besoins naturels, prealable a la validite du wudu.",
    origin: "Racine arabe n-j-w, evoquant le fait de se degager, de se purifier.",
    explanation:
      "L'istinja, a l'eau ou par des methodes alternatives encadrees par le fiqh, constitue un prealable a l'etat de purete rituelle requis pour la priere, illustrant l'attention minutieuse du fiqh de la purification (tahara) aux questions d'hygiene.",
    relatedSlugs: ["wudu"],
  },
  {
    term: "Janaba (Etat d'impurete majeure)",
    termArabic: "الجنابة",
    slug: "janaba",
    definition: "L'etat d'impurete rituelle majeure suivant un rapport intime ou une emission seminale, necessitant le ghusl.",
    origin: "Racine arabe j-n-b, evoquant l'eloignement, la mise a l'ecart.",
    explanation:
      "L'etat de janaba requiert le ghusl (grande ablution) avant de pouvoir accomplir la priere ou toucher le Coran, une purification plus complete que le simple wudu requis apres les impuretes mineures.",
    relatedSlugs: ["ghusl", "wudu"],
  },
  {
    term: "Hayd (Menstrues)",
    termArabic: "الحيض",
    slug: "hayd",
    definition: "Le cycle menstruel, periode durant laquelle certains actes d'adoration sont suspendus.",
    origin: "Racine arabe h-y-d, evoquant l'ecoulement menstruel.",
    explanation:
      "Durant le hayd, la priere et le jeune sont suspendus (les jours de jeune manques etant rattrapes ulterieurement), une concession legale reconnue par le fiqh plutot qu'une exclusion punitive, le Coran (sourate Al-Baqara, 2:222) invitant a la bienveillance sur ce sujet.",
    relatedSlugs: ["ghusl", "nifas"],
  },
  {
    term: "Nifas (Lochies post-partum)",
    termArabic: "النفاس",
    slug: "nifas",
    definition: "Le saignement suivant l'accouchement, durant lequel s'appliquent des regles similaires a celles du hayd.",
    origin: "Racine arabe n-f-s, evoquant l'accouchement.",
    explanation:
      "Le nifas suit les memes principes juridiques que le hayd (suspension de la priere et du jeune, rattrapage du jeune) pour une duree generalement plus longue, jusqu'a l'arret effectif du saignement.",
    relatedSlugs: ["hayd", "ghusl"],
  },
  {
    term: "Qibla (Direction de la priere)",
    termArabic: "القبلة",
    slug: "qibla",
    definition: "La direction de la Kaaba a La Mecque, vers laquelle chaque priere doit etre orientee.",
    origin: "Racine arabe q-b-l, evoquant ce qui fait face.",
    explanation:
      "Le changement de qibla, de Jerusalem vers La Mecque durant la periode medinoise (sourate Al-Baqara, 2:144), marque un tournant symbolique dans l'affirmation d'une identite rituelle propre a la communaute musulmane naissante.",
    relatedSlugs: ["salah", "hajj"],
  },
  {
    term: "Iqama (Second appel a la priere)",
    termArabic: "الإقامة",
    slug: "iqama",
    definition: "L'appel bref prononce juste avant le debut de la priere en groupe, annoncant qu'elle va commencer.",
    origin: "Racine arabe q-w-m, evoquant le fait de se lever, de se tenir debout.",
    explanation:
      "L'iqama reprend une forme condensee de l'adhan, prononcee au sein meme de la mosquee juste avant que l'imam ne debute la priere, signalant aux fideles presents de se mettre en rang.",
    relatedSlugs: ["adhan", "salah"],
  },
  // --- Eschatologie et theologie, au-dela de ce qui est deja traite ---
  {
    term: "Qada (Le Decret divin eternel)",
    termArabic: "القضاء",
    slug: "qada",
    definition: "Le decret divin eternel, decide de toute eternite dans la science de Dieu.",
    origin: "Racine arabe q-d-y, evoquant le fait de trancher, de decider.",
    explanation:
      "Qada et qadar sont generalement distingues par les theologiens : le qada designe la decision divine eternelle et globale, tandis que le qadar en est la mise en oeuvre concrete et progressive dans le temps - les deux formant ensemble la croyance au decret divin (al-qada wal-qadar).",
    relatedSlugs: ["qadar"],
  },
  {
    term: "Lawh al-Mahfuz (La Tablette bien gardee)",
    termArabic: "اللوح المحفوظ",
    slug: "lawh-al-mahfuz",
    definition: "Le support eternel sur lequel serait consigne le decret divin de toute chose.",
    origin: "Expression coranique (sourate Al-Buruj, 85:22).",
    explanation:
      "La tradition islamique decrit le Lawh al-Mahfuz comme le registre eternel ou est consigne le decret divin (qadar) de toute chose, y compris le texte du Coran lui-meme selon certains commentateurs - une image servant a exprimer la connaissance et la determination divines totales, plutot qu'un objet materiel au sens litteral.",
    relatedSlugs: ["qadar", "al-qalam"],
  },
  {
    term: "Al-Qalam (Le Calame)",
    termArabic: "القلم",
    slug: "al-qalam",
    definition: "Le premier instrument cree, charge d'inscrire le decret divin sur la Tablette bien gardee.",
    origin: "Terme coranique, donnant son nom a la sourate Al-Qalam.",
    explanation:
      "Selon un hadith rapporte par At-Tirmidhi, la premiere chose creee par Dieu fut le Calame, auquel il fut ordonne d'ecrire le devenir de toute chose jusqu'au Jour dernier - une image fondatrice de la croyance au qadar.",
    relatedSlugs: ["lawh-al-mahfuz", "qadar"],
  },
  {
    term: "Al-'Arsh (Le Trone)",
    termArabic: "العرش",
    slug: "al-arsh",
    definition: "Le Trone divin, mentionne dans le Coran comme surplombant l'ensemble de la creation.",
    origin: "Terme coranique frequent, notamment le Verset du Trone (Ayat al-Kursi).",
    explanation:
      "L'etablissement de Dieu sur le Trone (istawa 'ala al-'Arsh) est affirme par le Coran sans en preciser la modalite ; les atharites l'affirment tel quel sans interpretation ni comparaison, tandis que d'autres courants theologiques privilegient une lecture allegorique - un debat classique deja evoque au sujet de l'atharisme.",
    relatedSlugs: ["al-kursi", "asma-wa-sifat"],
  },
  {
    term: "Al-Kursi (Le Piedestal)",
    termArabic: "الكرسي",
    slug: "al-kursi",
    definition: "Le Piedestal divin, mentionne dans le celebre Verset du Trone comme embrassant les cieux et la terre.",
    origin: "Terme coranique (sourate Al-Baqara, 2:255, Ayat al-Kursi).",
    explanation:
      "Distinct de l'Arsh dans la plupart des commentaires classiques, le Kursi est associe a une immensite qui embrasse les cieux et la terre, image de la connaissance et de la puissance divines totales rapportee dans le tres largement recite Ayat al-Kursi.",
    relatedSlugs: ["al-arsh"],
  },
  {
    term: "Barzakh (Le monde intermediaire)",
    termArabic: "البرزخ",
    slug: "barzakh",
    definition: "L'etat intermediaire de l'ame entre la mort et la resurrection.",
    origin: "Terme coranique (sourate Al-Mu'minun, 23:100), evoquant une barriere, un intervalle.",
    explanation:
      "Le barzakh designe la periode qui separe la mort de la resurrection finale, durant laquelle l'ame connaitrait, selon la tradition, un avant-gout de sa destinee future (na'im ou 'adhab al-qabr) en attendant le jugement dernier.",
    relatedSlugs: ["qiyamah", "akhira"],
  },
  {
    term: "Munkar wa Nakir (Les deux anges de la tombe)",
    termArabic: "منكر ونكير",
    slug: "munkar-wa-nakir",
    definition: "Les deux anges charges, selon la tradition, d'interroger le defunt dans sa tombe.",
    origin: "Noms rapportes dans plusieurs hadiths, notamment chez At-Tirmidhi.",
    explanation:
      "La tradition islamique rapporte que ces deux anges interrogent le defunt sur sa foi, son Prophete et sa religion peu apres l'enterrement, une croyance qui fait partie de l'aqida sunnite classique concernant le barzakh.",
    relatedSlugs: ["barzakh", "malaika"],
  },
  {
    term: "Al-Mizan (La Balance des actes)",
    termArabic: "الميزان",
    slug: "al-mizan",
    definition: "La balance sur laquelle seront peses les actes de chaque personne au Jour du Jugement.",
    origin: "Terme coranique (sourate Al-Anbiya, 21:47).",
    explanation:
      "Al-Mizan symbolise la justice parfaite du jugement divin, ou bonnes et mauvaises actions seront pesees avec exactitude - une image centrale de l'eschatologie islamique rappelant la responsabilite individuelle de chaque acte.",
    relatedSlugs: ["qiyamah", "al-adl"],
  },
  {
    term: "Al-Hawd (Le Bassin du Prophete)",
    termArabic: "الحوض",
    slug: "al-hawd",
    definition: "Le bassin auquel le Prophete ﷺ abreuvera les croyants de sa communaute au Jour du Jugement.",
    origin: "Rapporte dans plusieurs hadiths authentiques (Bukhari, Muslim).",
    explanation:
      "Boire a ce bassin, dont l'eau est decrite comme plus blanche que le lait et plus parfumee que le musc, marquerait selon la tradition une etape de soulagement avant la traversee finale vers le Paradis, reservee a ceux qui n'auront pas introduit d'innovations blamables dans la religion.",
    relatedSlugs: ["sirat", "al-kawthar"],
  },
  {
    term: "Al-A'raf (Les Hauteurs)",
    termArabic: "الأعراف",
    slug: "al-araf",
    definition: "Un lieu intermediaire entre le Paradis et l'Enfer, mentionne dans le Coran.",
    origin: "Terme coranique, donnant son nom a la sourate Al-A'raf.",
    explanation:
      "Le Coran (sourate Al-A'raf, 7:46-49) decrit une hauteur separant les gens du Paradis de ceux de l'Enfer, dont les occupants font l'objet de plusieurs interpretations chez les commentateurs classiques, sans consensus definitif sur leur identite precise.",
    relatedSlugs: ["jannah", "jahannam"],
  },
  {
    term: "Al-Kawthar (Le fleuve du Paradis)",
    termArabic: "الكوثر",
    slug: "al-kawthar",
    definition: "Un fleuve ou bassin du Paradis accorde au Prophete ﷺ, mentionne dans une sourate du meme nom.",
    origin: "Terme coranique, donnant son nom a la sourate Al-Kawthar (108).",
    explanation:
      "La sourate Al-Kawthar, la plus courte du Coran, promet au Prophete ﷺ l'abondance symbolisee par ce fleuve, generalement identifie par les commentateurs au meme bassin (Al-Hawd) dont il abreuvera sa communaute.",
    relatedSlugs: ["al-hawd"],
  },
  {
    term: "Ad-Dajjal (L'Antichrist)",
    termArabic: "الدجال",
    slug: "ad-dajjal",
    definition: "Une figure trompeuse dont l'apparition, selon de nombreux hadiths, precedera la fin des temps.",
    origin: "Racine arabe d-j-l, evoquant la tromperie, l'imposture.",
    explanation:
      "De nombreux hadiths decrivent Ad-Dajjal comme un imposteur aux pouvoirs trompeurs qui pretendra a la divinite avant d'etre vaincu, selon la tradition, par le retour de Jesus ('Isa) - une figure eschatologique majeure bien qu'absente du texte coranique lui-meme.",
    relatedSlugs: ["nuzul-isa", "qiyamah"],
  },
  {
    term: "Ya'juj wa Ma'juj (Gog et Magog)",
    termArabic: "يأجوج ومأجوج",
    slug: "yajuj-wa-majuj",
    definition: "Deux peuples dont l'irruption, selon la tradition islamique, comptera parmi les signes annonciateurs de la fin des temps.",
    origin: "Terme coranique (sourate Al-Kahf, 18:94, et sourate Al-Anbiya, 21:96).",
    explanation:
      "Le Coran mentionne Ya'juj wa Ma'juj comme un peuple retenu derriere une barriere construite par Dhul-Qarnayn, dont la liberation future est presentee comme l'un des grands signes precedant le Jour du Jugement.",
    relatedSlugs: ["qiyamah"],
  },
  {
    term: "Al-Mahdi (Le Bien-Guide attendu)",
    termArabic: "المهدي",
    slug: "al-mahdi",
    definition: "Une figure eschatologique attendue, issue de la famille du Prophete, qui retablirait la justice avant la fin des temps.",
    origin: "Rapporte dans plusieurs hadiths, notamment chez Abu Dawud.",
    explanation:
      "La croyance en l'apparition future d'Al-Mahdi est largement repandue dans la tradition sunnite comme chiite, bien que les details de son role et l'authenticite precise des rapports le concernant fassent l'objet de discussions parmi les specialistes du hadith.",
    relatedSlugs: ["nuzul-isa", "ad-dajjal"],
  },
  {
    term: "Nuzul 'Isa (Le retour de Jesus)",
    termArabic: "نزول عيسى",
    slug: "nuzul-isa",
    definition: "Le retour attendu de Jesus ('Isa) a la fin des temps, selon la croyance islamique.",
    origin: "Rapporte dans plusieurs hadiths, en lien avec la sourate An-Nisa (4:159).",
    explanation:
      "La tradition islamique affirme que Jesus n'est pas mort crucifie mais fut eleve aupres de Dieu, et qu'il reviendra avant la fin des temps pour vaincre Ad-Dajjal et retablir la justice - une croyance eschatologique largement partagee par les theologiens sunnites classiques.",
    relatedSlugs: ["ad-dajjal", "al-mahdi"],
  },
  {
    term: "Ilham (Inspiration)",
    termArabic: "الإلهام",
    slug: "ilham",
    definition: "Une inspiration interieure accordee a une personne pieuse, distincte de la revelation prophetique.",
    origin: "Racine arabe l-h-m, evoquant l'inspiration.",
    explanation:
      "A la difference de la wahy (revelation) reservee aux prophetes, l'ilham designe une forme d'inspiration ou d'intuition accordee a un croyant pieux, sans valeur normative contraignante et toujours soumise a la verification par le Coran et la Sunna.",
    relatedSlugs: ["wahy", "karama"],
  },
  {
    term: "Karama (Prodige accorde a un saint)",
    termArabic: "الكرامة",
    slug: "karama",
    definition: "Un evenement extraordinaire accorde par Dieu a une personne pieuse, sans lien avec la mission prophetique.",
    origin: "Racine arabe k-r-m, partagee avec Al-Karim.",
    explanation:
      "La karama se distingue de la mu'jiza (miracle prophetique) par l'absence de revendication de prophetie qui l'accompagne ; sa reconnaissance et ses limites font l'objet de debats theologiques, certains courants insistant sur la prudence face a des recits invérifiables.",
    relatedSlugs: ["mujiza", "wali-allah"],
  },
  {
    term: "Mu'jiza (Miracle prophetique)",
    termArabic: "المعجزة",
    slug: "mujiza",
    definition: "Un evenement extraordinaire accorde par Dieu a un prophete pour authentifier sa mission.",
    origin: "Racine arabe '-j-z, evoquant l'incapacite (a en produire l'equivalent).",
    explanation:
      "La mu'jiza defie les lois naturelles ordinaires et vise specifiquement a authentifier la mission prophetique face a un defi ou un doute exprime - le Coran lui-meme etant considere comme le miracle principal du Prophete Muhammad ﷺ (voir i'jaz al-Qur'an).",
    relatedSlugs: ["ijaz-al-quran", "karama"],
  },
  {
    term: "Sihr (Magie, sorcellerie)",
    termArabic: "السحر",
    slug: "sihr",
    definition: "La pratique de la magie, categoriquement condamnee par le Coran et la Sunna.",
    origin: "Racine arabe s-h-r, evoquant l'illusion et l'enchantement.",
    explanation:
      "Le Coran (sourate Al-Baqara, 2:102) et de nombreux hadiths classent le sihr parmi les peches majeurs, certains juristes le rangeant meme parmi les actes pouvant relever du kufr selon les modalites employees, en raison du recours frequent a des forces autres que Dieu qu'il implique.",
    relatedSlugs: ["kahana", "shirk"],
  },
  {
    term: "Kahana (Divination)",
    termArabic: "الكهانة",
    slug: "kahana",
    definition: "La pretention a connaitre l'avenir ou l'invisible par des moyens autres que la revelation divine.",
    origin: "Racine arabe k-h-n, evoquant la fonction du devin (kahin) de l'Arabie preislamique.",
    explanation:
      "La kahana est condamnee par un hadith de Muslim selon lequel la priere de quiconque consulte un devin n'est pas acceptee durant quarante jours, l'omniscience de l'invisible (ghayb) etant reservee a Dieu seul.",
    relatedSlugs: ["ghayb", "sihr"],
  },
  {
    term: "Ta'wil (Interpretation)",
    termArabic: "التأويل",
    slug: "tawil",
    definition: "L'interpretation d'un texte au-dela de son sens le plus immediat et litteral.",
    origin: "Racine arabe a-w-l, evoquant le retour a un sens premier ou cache.",
    explanation:
      "Le ta'wil designe une interpretation qui va au-dela du sens litteral d'un texte, une methode diversement acceptee selon les domaines et les courants theologiques - largement utilisee par les ash'arites au sujet des attributs divins, mais consideree avec beaucoup plus de reserve par les atharites.",
    relatedSlugs: ["asma-wa-sifat", "asbab-al-nuzul"],
  },
  {
    term: "Muhkam wa Mutashabih (Versets univoques et a sens multiples)",
    termArabic: "المحكم والمتشابه",
    slug: "muhkam-wa-mutashabih",
    definition: "La distinction coranique entre versets au sens clair et univoque, et versets a la signification plus complexe.",
    origin: "Terme coranique (sourate Al Imran, 3:7).",
    explanation:
      "Le Coran lui-meme (3:7) distingue des versets muhkam, au sens clair et fondement de la legislation, et des versets mutashabih, dont le sens precis appelle prudence interpretative - une distinction au coeur des debats classiques d'exegese, notamment au sujet des attributs divins.",
    relatedSlugs: ["tawil", "asma-wa-sifat"],
  },
  {
    term: "I'jaz al-Qur'an (Inimitabilite du Coran)",
    termArabic: "إعجاز القرآن",
    slug: "ijaz-al-quran",
    definition: "La doctrine selon laquelle le Coran, par sa forme comme par son contenu, est impossible a imiter.",
    origin: "Racine arabe '-j-z, partagee avec mu'jiza.",
    explanation:
      "Le Coran lance a plusieurs reprises un defi (tahaddi) a quiconque doute de son origine divine de produire l'equivalent, meme d'une seule sourate (sourate Al-Baqara, 2:23) - l'i'jaz constitue, selon la theologie sunnite classique, le miracle principal authentifiant la mission du Prophete ﷺ.",
    relatedSlugs: ["mujiza", "wahy"],
  },
  {
    term: "Qira'at (Lectures coraniques)",
    termArabic: "القراءات",
    slug: "qiraat",
    definition: "Les variantes de recitation du Coran transmises et authentifiees depuis l'epoque du Prophete.",
    origin: "Racine arabe q-r-', partagee avec le mot Qur'an lui-meme.",
    explanation:
      "Dix lectures principales (qira'at) sont reconnues comme authentiques par la tradition islamique, chacune remontant par une chaine de transmission continue jusqu'au Prophete ﷺ - des variations legeres de prononciation ou de vocalisation qui n'affectent pas le sens general du texte et refletent la richesse de sa transmission orale.",
    relatedSlugs: ["wahy", "tajwid"],
  },
  {
    term: "Tajwid (Regles de recitation coranique)",
    termArabic: "التجويد",
    slug: "tajwid",
    definition: "L'ensemble des regles regissant la prononciation correcte et embellie du texte coranique.",
    origin: "Racine arabe j-w-d, evoquant le fait d'ameliorer, de perfectionner.",
    explanation:
      "Le tajwid codifie la prononciation exacte de chaque lettre et les regles de liaison entre elles (noun sakinah, qalqalah, madd...), une discipline consideree comme une obligation collective visant a preserver la recitation coranique telle qu'elle fut transmise depuis le Prophete ﷺ.",
    relatedSlugs: ["qiraat", "wahy"],
  },
  // --- Spiritualite et soufisme (tasawwuf) ---
  {
    term: "Shukr (Gratitude)",
    termArabic: "الشكر",
    slug: "shukr",
    definition: "La reconnaissance active envers Dieu pour Ses bienfaits, par le coeur, la parole et les actes.",
    origin: "Racine arabe sh-k-r, partagee avec Ash-Shakur.",
    explanation:
      "Le shukr est presente dans le Coran (sourate Ibrahim, 14:7) comme la condition d'un accroissement des bienfaits divins, complementaire du sabr (patience) face a l'epreuve - les deux etant traditionnellement decrits comme les deux etats fondamentaux du croyant.",
    relatedSlugs: ["ash-shakur", "sabr"],
  },
  {
    term: "Khawf (Crainte reverencielle)",
    termArabic: "الخوف",
    slug: "khawf",
    definition: "La crainte reverencielle de Dieu, fondee sur la conscience de Sa majeste et de la responsabilite des actes.",
    origin: "Racine arabe kh-w-f, evoquant la peur.",
    explanation:
      "Le khawf, equilibre par le raja' (espoir), constitue l'une des deux ailes classiques de la vie spirituelle du croyant selon les auteurs soufis : une crainte excessive menant au desespoir etant jugee tout aussi deficiente qu'un espoir sans discernement.",
    relatedSlugs: ["raja", "taqwa"],
  },
  {
    term: "Raja' (Espoir en Dieu)",
    termArabic: "الرجاء",
    slug: "raja",
    definition: "L'espoir confiant en la misericorde et le pardon divins.",
    origin: "Racine arabe r-j-w, evoquant l'esperance.",
    explanation:
      "Complement du khawf, le raja' maintient le croyant dans une confiance active en la misericorde divine, evitant aussi bien le desespoir que la presomption d'une securite acquise sans effort.",
    relatedSlugs: ["khawf", "tawakkul"],
  },
  {
    term: "Mahabba (Amour de Dieu)",
    termArabic: "المحبة",
    slug: "mahabba",
    definition: "L'amour du croyant pour Dieu, considere par les auteurs soufis comme le sommet de la vie spirituelle.",
    origin: "Racine arabe h-b-b, partagee avec Al-Wadud.",
    explanation:
      "La mahabba occupe une place centrale dans la litterature spirituelle islamique, notamment chez des auteurs comme Al-Ghazali, comme aboutissement de la crainte et de l'esperance plutot que leur simple depassement.",
    relatedSlugs: ["al-wadud", "maarifa"],
  },
  {
    term: "Ma'rifa (Connaissance intime de Dieu)",
    termArabic: "المعرفة",
    slug: "maarifa",
    definition: "Une connaissance intime et experientielle de Dieu, distincte du savoir theorique.",
    origin: "Racine arabe '-r-f, evoquant la connaissance directe.",
    explanation:
      "La ma'rifa designe, dans le vocabulaire soufi, une connaissance de Dieu acquise par l'experience spirituelle et la purification du coeur, complementaire du savoir doctrinal ('ilm) transmis par l'etude.",
    relatedSlugs: ["mahabba", "tazkiyah"],
  },
  {
    term: "Muraqaba (Vigilance spirituelle)",
    termArabic: "المراقبة",
    slug: "muraqaba",
    definition: "La conscience constante d'etre sous le regard de Dieu.",
    origin: "Racine arabe r-q-b, partagee avec Ar-Raqib.",
    explanation:
      "La muraqaba decoule directement de la definition de l'ihsan rapportee dans le hadith de Jibril : adorer Dieu comme si on Le voyait - une discipline interieure qui vise a maintenir cette conscience en toute circonstance, pas seulement durant l'adoration rituelle.",
    relatedSlugs: ["ihsan", "ar-raqib"],
  },
  {
    term: "Muhasaba (Examen de conscience)",
    termArabic: "المحاسبة",
    slug: "muhasaba",
    definition: "L'examen regulier de ses propres actes, avant qu'ils ne soient examines au Jour du Jugement.",
    origin: "Racine arabe h-s-b, partagee avec Al-Hasib.",
    explanation:
      "Attribuee notamment au calife Umar ibn al-Khattab (\"jugez-vous vous-memes avant d'etre juges\"), la muhasaba invite a un bilan regulier et honnete de ses actes, prealable considere necessaire a toute progression spirituelle sincere.",
    relatedSlugs: ["al-hasib", "tazkiyah"],
  },
  {
    term: "Riyada (Discipline spirituelle)",
    termArabic: "الرياضة",
    slug: "riyada",
    definition: "L'entrainement progressif de l'ame vers la vertu, par la discipline et la pratique reguliere.",
    origin: "Racine arabe r-w-d, evoquant l'entrainement, l'exercice.",
    explanation:
      "La riyada designe, dans la litterature spirituelle islamique, un entrainement progressif et methodique de l'ame - jeune surerogatoire, veille nocturne, retrait mesure du superflu - vise a affaiblir les penchants blamables plutot qu'a s'infliger une austerite excessive rejetee par la tradition prophetique.",
    relatedSlugs: ["mujahada", "zuhd"],
  },
  {
    term: "Mujahada (Effort contre soi-meme)",
    termArabic: "المجاهدة",
    slug: "mujahada",
    definition: "L'effort soutenu pour discipliner ses penchants et ses passions.",
    origin: "Racine arabe j-h-d, partagee avec jihad.",
    explanation:
      "La mujahada correspond directement a ce que la tradition designe comme le \"plus grand jihad\" (voir jihad) : la lutte interieure contre ses propres defauts, prealable considere indispensable a toute autre forme d'effort dans la voie de Dieu.",
    relatedSlugs: ["jihad", "riyada"],
  },
  {
    term: "Wara' (Scrupule religieux)",
    termArabic: "الورع",
    slug: "wara",
    definition: "Le fait de s'abstenir, par precaution, de tout ce dont la licite n'est pas absolument certaine.",
    origin: "Racine arabe w-r-', evoquant la retenue scrupuleuse.",
    explanation:
      "Le wara' va au-dela du simple respect du licite et de l'illicite en evitant meme les zones grises douteuses (shubuhat), une attitude fondee sur un hadith rapporte par Bukhari et Muslim invitant a s'ecarter de ce qui pourrait mener au haram.",
    relatedSlugs: ["halal", "haram"],
  },
  {
    term: "Qana'a (Contentement)",
    termArabic: "القناعة",
    slug: "qanaa",
    definition: "Le contentement paisible de ce que l'on possede, sans convoitise excessive du superflu.",
    origin: "Racine arabe q-n-', evoquant la satisfaction.",
    explanation:
      "La qana'a est presentee par plusieurs hadiths comme une richesse en elle-meme (\"la veritable richesse est celle du coeur\", Bukhari et Muslim), invitant a une relation apaisee aux biens materiels plutot qu'a leur rejet total.",
    relatedSlugs: ["zuhd", "tawakkul"],
  },
  {
    term: "Tariqa (Voie spirituelle, confrerie)",
    termArabic: "الطريقة",
    slug: "tariqa",
    definition: "Une voie spirituelle structuree, generalement organisee autour de l'enseignement d'un maitre fondateur.",
    origin: "Racine arabe t-r-q, evoquant le chemin, la voie.",
    explanation:
      "Les tariqas (Qadiriyya, Tijaniyya, Naqshbandiyya parmi les plus repandues) organisent la transmission d'un enseignement spirituel structure autour de pratiques specifiques (dhikr collectif, lien d'allegeance a un maitre), jouant historiquement un role majeur dans la diffusion de l'islam, notamment en Afrique de l'Ouest.",
    relatedSlugs: ["abd-al-qadir-al-jilani"],
  },
  {
    term: "Fana' (Aneantissement du moi)",
    termArabic: "الفناء",
    slug: "fana",
    definition: "Un etat spirituel decrit par les auteurs soufis comme l'aneantissement de la conscience de soi dans l'adoration de Dieu.",
    origin: "Racine arabe f-n-y, evoquant l'extinction, la disparition.",
    explanation:
      "Concept central mais theologiquement debattu de la litterature soufie, le fana' designe un etat ou la conscience du moi s'efface devant l'experience de la presence divine - une notion que certains theologiens ont accueillie avec prudence, craignant des formulations pretant a confusion avec une fusion litterale entre creature et Createur, rejetee par le tawhid.",
    relatedSlugs: ["baqa", "tawhid"],
  },
  {
    term: "Baqa' (Subsistance en Dieu)",
    termArabic: "البقاء",
    slug: "baqa",
    definition: "L'etat spirituel de retour a la conscience ordinaire apres l'experience du fana', mais transforme par elle.",
    origin: "Racine arabe b-q-y, partagee avec Al-Baqi.",
    explanation:
      "Le baqa' est decrit par les auteurs soufis comme complementaire du fana' : apres l'aneantissement de la conscience de soi, le serviteur \"subsiste\" a nouveau dans le monde, mais avec un rapport transforme a Dieu et a la creation.",
    relatedSlugs: ["fana"],
  },
  // --- Institutions et vie communautaire ---
  {
    term: "Amr bil Ma'ruf wa Nahy 'an al-Munkar (Commander le convenable, interdire le blamable)",
    termArabic: "الأمر بالمعروف والنهي عن المنكر",
    slug: "amr-bil-maruf",
    definition: "Le devoir collectif d'encourager le bien et de s'opposer au mal au sein de la communaute.",
    origin: "Expression coranique frequente, notamment sourate Al Imran (3:104).",
    explanation:
      "Ce principe, souvent decrit comme un devoir collectif (fard kifaya) plutot qu'individuel absolu, structure une part importante de l'ethique sociale islamique, ses modalites concretes d'application (priorite a la parole douce, limites de l'intervention) etant precisees par de nombreux hadiths et debats juridiques.",
    relatedSlugs: ["ukhuwwa", "umma"],
  },
  {
    term: "Ukhuwwa (Fraternite islamique)",
    termArabic: "الأخوة",
    slug: "ukhuwwa",
    definition: "Le lien de fraternite unissant les croyants au-dela de tout lien de sang ou d'origine.",
    origin: "Racine arabe a-kh-w, evoquant la fraternite.",
    explanation:
      "Le Coran (sourate Al-Hujurat, 49:10) affirme que \"les croyants ne sont que des freres\", fondement d'une solidarite communautaire qui a historiquement structure l'entraide au sein de l'umma au-dela des appartenances tribales ou nationales.",
    relatedSlugs: ["umma", "amr-bil-maruf"],
  },
  {
    term: "Dhimmi (Statut de protection)",
    termArabic: "الذمي",
    slug: "dhimmi",
    definition: "Le statut historique accorde aux non-musulmans, notamment gens du Livre, vivant sous autorite islamique.",
    origin: "Racine arabe dh-m-m, evoquant la protection, le pacte de garantie.",
    explanation:
      "Le statut de dhimmi garantissait historiquement, moyennant le paiement de la jizya, la protection de la vie, des biens et de la pratique religieuse des non-musulmans au sein des territoires sous autorite islamique - un cadre juridique premoderne dont l'application concrete a varie considerablement selon les epoques et les regions.",
    relatedSlugs: ["ahl-al-kitab", "jizya"],
  },
  {
    term: "Ahl al-Kitab (Gens du Livre)",
    termArabic: "أهل الكتاب",
    slug: "ahl-al-kitab",
    definition: "Les adherents des religions ayant recu, selon le Coran, une ecriture revelee anterieure - principalement juifs et chretiens.",
    origin: "Expression coranique frequente.",
    explanation:
      "Le statut d'Ahl al-Kitab beneficie, en fiqh classique, de dispositions particulieres distinctes de celles appliquees aux autres non-musulmans, notamment concernant le mariage et la consommation alimentaire, en reconnaissance d'une origine scripturaire commune reconnue par le Coran.",
    relatedSlugs: ["dhimmi", "nubuwwa"],
  },
  {
    term: "Sharia (La Loi islamique)",
    termArabic: "الشريعة",
    slug: "sharia",
    definition: "L'ensemble des principes et normes religieuses issus du Coran et de la Sunna, orientant la vie du croyant.",
    origin: "Racine arabe sh-r-', evoquant le chemin qui mene a la source d'eau.",
    explanation:
      "La sharia designe la loi divine dans son principe ideal et global, tandis que le fiqh en constitue la comprehension et l'application humaine, necessairement faillible et diverse - une distinction importante frequemment brouillee dans les usages contemporains du terme.",
    relatedSlugs: ["fiqh", "ijtihad"],
  },
  {
    term: "Jizya (Capitation historique)",
    termArabic: "الجزية",
    slug: "jizya",
    definition: "Un impot de capitation historiquement du par les non-musulmans places sous protection islamique.",
    origin: "Terme coranique (sourate At-Tawba, 9:29).",
    explanation:
      "En echange de la jizya, les autorites musulmanes garantissaient historiquement la protection militaire et la liberte de culte des populations concernees, qui etaient par ailleurs exemptees du service militaire et de la zakat.",
    relatedSlugs: ["dhimmi", "ahl-al-kitab"],
  },
  {
    term: "Kharaj (Impot foncier historique)",
    termArabic: "الخراج",
    slug: "kharaj",
    definition: "Un impot foncier historique preleve sur les terres agricoles, notamment celles des non-musulmans.",
    origin: "Racine arabe kh-r-j, evoquant ce qui sort, le rendement.",
    explanation:
      "Le kharaj, dont Abu Yusuf redigea un traite de reference pour le calife Harun ar-Rashid, constituait une source majeure de revenus fiscaux dans l'administration des premiers siecles islamiques, distinct de l'ushr preleve sur les terres musulmanes.",
    relatedSlugs: ["abu-yusuf", "ushr"],
  },
  {
    term: "Ushr (Dime agricole)",
    termArabic: "العشر",
    slug: "ushr",
    definition: "Une part fixe, generalement un dixieme, preleve sur les recoltes des terres musulmanes irriguees naturellement.",
    origin: "Racine arabe '-sh-r, evoquant le dixieme.",
    explanation:
      "L'ushr constitue une forme specifique de zakat agricole, dont le taux varie selon le mode d'irrigation de la terre (voir le comparateur de fiqh sur la zakat des recoltes), distincte du kharaj preleve sur d'autres categories de terres.",
    relatedSlugs: ["zakat", "kharaj"],
  },
  {
    term: "Ghanima (Butin de guerre)",
    termArabic: "الغنيمة",
    slug: "ghanima",
    definition: "Les biens acquis a l'issue d'un combat, dont la repartition est encadree par le Coran.",
    origin: "Terme coranique, donnant son nom a la sourate Al-Anfal.",
    explanation:
      "Le Coran (sourate Al-Anfal, 8:41) fixe qu'un cinquieme de la ghanima revient a des categories precises (dont les besoins de la communaute), le reste etant reparti entre les combattants - une regle qui contraste avec les pratiques de pillage discretionnaire courantes dans l'Arabie preislamique.",
    relatedSlugs: ["fay"],
  },
  {
    term: "Fay' (Biens acquis sans combat)",
    termArabic: "الفيء",
    slug: "fay",
    definition: "Les biens revenant a la communaute musulmane sans qu'un combat n'ait eu lieu pour les acquerir.",
    origin: "Racine arabe f-y-', evoquant le retour, la restitution.",
    explanation:
      "A la difference de la ghanima, acquise par le combat, le fay' (terres cedees par traite, tributs...) est generalement destine a l'interet collectif de la communaute plutot que reparti entre les seuls combattants.",
    relatedSlugs: ["ghanima", "bayt-al-mal"],
  },
  {
    term: "Bayt al-Mal (Le Tresor public)",
    termArabic: "بيت المال",
    slug: "bayt-al-mal",
    definition: "L'institution historique chargee de collecter et redistribuer les fonds publics de la communaute musulmane.",
    origin: "Composition arabe de bayt (maison) et mal (bien, fortune).",
    explanation:
      "Institue durant le califat rashidun pour gerer les revenus croissants de la zakat, du kharaj et du butin, le Bayt al-Mal prefigure les tresors publics et administrations fiscales des Etats modernes, avec un souci deja affirme de justice dans la redistribution.",
    relatedSlugs: ["zakat", "khilafa"],
  },
  {
    term: "Hisba (Institution de controle du bien public)",
    termArabic: "الحسبة",
    slug: "hisba",
    definition: "L'institution historique chargee de veiller au respect des normes morales et commerciales dans l'espace public.",
    origin: "Racine arabe h-s-b, partagee avec Al-Hasib.",
    explanation:
      "La hisba, dirigee par un fonctionnaire appele muhtasib, controlait historiquement les marches (poids, mesures, qualite des produits) et certains aspects de la moralite publique, une institutionnalisation concrete du principe d'amr bil ma'ruf wa nahy 'an al-munkar.",
    relatedSlugs: ["amr-bil-maruf"],
  },
  // --- Vocabulaire de base du Coran et de sa structure ---
  {
    term: "Ayah (Verset)",
    termArabic: "الآية",
    slug: "ayah",
    definition: "Un verset du Coran, unite de base de sa division textuelle.",
    origin: "Racine arabe a-y-y, evoquant le signe, la preuve.",
    explanation:
      "Le mot ayah signifie litteralement \"signe\", un choix lexical qui n'est pas neutre : chaque verset coranique est ainsi presente comme un signe de Dieu, au meme titre que les signes observables dans la creation elle-meme. Le Coran compte 6236 versets repartis en 114 sourates.",
    relatedSlugs: ["surah", "wahy"],
  },
  {
    term: "Surah (Sourate)",
    termArabic: "السورة",
    slug: "surah",
    definition: "Un chapitre du Coran, unite de division majeure du texte, au nombre de 114.",
    origin: "Racine arabe s-w-r, evoquant possiblement un rang, une enceinte elevee.",
    explanation:
      "Chaque sourate porte un nom generalement tire d'un mot ou theme marquant qu'elle contient, sans lien necessaire avec son sujet principal. Les sourates sont traditionnellement classees en mecquoises ou medinoises selon la periode de leur revelation, une distinction qui influence leur style et leurs themes dominants.",
    relatedSlugs: ["ayah", "makki-madani"],
  },
  {
    term: "Juz' (Partie du Coran)",
    termArabic: "الجزء",
    slug: "juz",
    definition: "Chacune des trente parties de longueur approximativement egale divisant le texte du Coran.",
    origin: "Racine arabe j-z-', evoquant la partie, la fraction.",
    explanation:
      "Le decoupage en trente juz', sans fondement dans le texte coranique lui-meme mais introduit pour faciliter sa lecture reguliere, permet notamment d'en achever la recitation complete en un mois lunaire, une pratique particulierement repandue durant le Ramadan.",
    relatedSlugs: ["surah", "tarawih"],
  },
  {
    term: "Hizb (Section du Coran)",
    termArabic: "الحزب",
    slug: "hizb",
    definition: "Une subdivision du Coran, chaque juz' etant lui-meme partage en deux hizb.",
    origin: "Racine arabe h-z-b, evoquant le groupe, la portion.",
    explanation:
      "Le hizb offre une unite de decoupage plus fine que le juz', utile pour repartir la recitation quotidienne sur des periodes plus courtes qu'un mois, une pratique frequente parmi les habitues de la recitation reguliere.",
    relatedSlugs: ["juz"],
  },
  {
    term: "Mushaf (Exemplaire du Coran)",
    termArabic: "المصحف",
    slug: "mushaf",
    definition: "Un exemplaire physique et complet du texte coranique, relie sous forme de livre.",
    origin: "Racine arabe s-h-f, evoquant la page, le feuillet.",
    explanation:
      "Le terme mushaf designe specifiquement le support materiel du texte coranique complet, par opposition au Qur'an qui designe le texte lui-meme en tant que parole divine ; sa forme actuelle standardisee remonte a la compilation officielle sous le calife Uthman.",
    relatedSlugs: ["wahy"],
  },
  {
    term: "Makki et Madani (Mecquois et Medinois)",
    termArabic: "مكي ومدني",
    slug: "makki-madani",
    definition: "La classification des versets et sourates selon qu'ils furent reveles avant ou apres l'Hegire.",
    origin: "Adjectifs derives de La Mecque (Makka) et Medine (Al-Madina).",
    explanation:
      "Les sourates mecquoises, generalement plus courtes et centrees sur les fondements de la foi (tawhid, au-dela), precedent l'Hegire ; les sourates medinoises, souvent plus longues, traitent davantage de legislation et d'organisation communautaire - une distinction qui aide les exegetes a contextualiser un verset et a identifier d'eventuels cas de naskh.",
    relatedSlugs: ["surah", "naskh"],
  },
  // --- Nuances de classification du fiqh ---
  {
    term: "Fard 'Ayn (Obligation individuelle)",
    termArabic: "فرض عين",
    slug: "fard-ayn",
    definition: "Une obligation religieuse incombant individuellement a chaque musulman, sans exception.",
    origin: "Composition arabe de fard (obligatoire) et 'ayn (individuel, personnel).",
    explanation:
      "Les cinq prieres quotidiennes ou le jeune du Ramadan sont des exemples de fard 'ayn : leur accomplissement par certains membres de la communaute ne dispense en rien les autres de la meme obligation individuelle.",
    relatedSlugs: ["ahkam-al-khamsa", "fard-kifaya"],
  },
  {
    term: "Fard Kifaya (Obligation collective)",
    termArabic: "فرض كفاية",
    slug: "fard-kifaya",
    definition: "Une obligation religieuse qui, une fois accomplie par un nombre suffisant de musulmans, dispense le reste de la communaute.",
    origin: "Composition arabe de fard (obligatoire) et kifaya (suffisance).",
    explanation:
      "La priere funeraire (salat al-janaza) ou l'apprentissage collectif de certaines sciences religieuses sont des exemples classiques de fard kifaya : si personne dans la communaute ne s'en acquitte, tous en portent collectivement la responsabilite ; des qu'un nombre suffisant s'en charge, l'obligation est levee pour les autres.",
    relatedSlugs: ["fard-ayn", "amr-bil-maruf"],
  },
  {
    term: "Sunnah Mu'akkada (Sunna fortement confirmee)",
    termArabic: "السنة المؤكدة",
    slug: "sunnah-muakkada",
    definition: "Une pratique recommandee que le Prophete ﷺ accomplissait de facon reguliere, sans jamais l'abandonner.",
    origin: "Composition arabe de sunnah (voie suivie) et mu'akkada (confirmee, renforcee).",
    explanation:
      "La sunnah mu'akkada se distingue de la simple recommandation ponctuelle par sa regularite constante dans la pratique prophetique - son abandon habituel, sans excuse valable, est generalement considere comme fautif bien que n'invalidant aucun acte d'adoration.",
    relatedSlugs: ["sunnah", "ahkam-al-khamsa"],
  },
  {
    term: "Rukhsa (Concession legale)",
    termArabic: "الرخصة",
    slug: "rukhsa",
    definition: "Un allegement legal accorde en raison d'une circonstance particuliere, comme le voyage ou la maladie.",
    origin: "Racine arabe r-kh-s, evoquant la facilite, l'allegement.",
    explanation:
      "La rukhsa (raccourcissement de la priere en voyage, rupture du jeune pour un malade) s'oppose a la 'azima, la norme par defaut applicable en situation ordinaire - un mecanisme qui illustre le souci du fiqh d'articuler rigueur legale et attention aux circonstances reelles du croyant.",
    relatedSlugs: ["azima", "qasr"],
  },
  {
    term: "'Azima (Norme par defaut)",
    termArabic: "العزيمة",
    slug: "azima",
    definition: "La regle legale de base, applicable en situation ordinaire, par opposition a la concession (rukhsa).",
    origin: "Racine arabe '-z-m, evoquant la determination, la regle ferme.",
    explanation:
      "L''azima designe l'application standard d'une regle de fiqh, dont la rukhsa constitue une exception legitime face a une difficulte reelle - jeuner normalement etant l''azima, rompre le jeune en voyage etant la rukhsa correspondante.",
    relatedSlugs: ["rukhsa"],
  },
  // --- Titres et fonctions savantes ---
  {
    term: "Faqih (Juriste)",
    termArabic: "الفقيه",
    slug: "faqih",
    definition: "Un savant specialise dans l'etude et l'application du fiqh.",
    origin: "Racine arabe f-q-h, partagee avec fiqh.",
    explanation:
      "Le faqih maitrise la methodologie juridique (usul al-fiqh) et son application aux questions pratiques de la vie du croyant, une expertise distincte de celle du muhaddith, davantage centre sur la transmission et l'authentification du hadith.",
    relatedSlugs: ["fiqh", "mujtahid"],
  },
  {
    term: "Muhaddith (Specialiste du hadith)",
    termArabic: "المحدث",
    slug: "muhaddith",
    definition: "Un savant specialise dans la collecte, la transmission et l'authentification des hadiths.",
    origin: "Racine arabe h-d-th, partagee avec hadith.",
    explanation:
      "Le muhaddith maitrise la science du jarh wa ta'dil et la classification des hadiths (sahih, hasan, da'if...), une discipline exigeant la memorisation de dizaines de milliers de traditions et de leurs chaines de transmission respectives.",
    relatedSlugs: ["isnad", "jarh-wa-tadil"],
  },
  {
    term: "Sihah Sitta (Les six authentiques)",
    termArabic: "الصحاح الستة",
    slug: "sihah-sitta",
    definition: "Les six recueils de hadiths consideres comme les plus fiables et les plus etudies dans la tradition sunnite.",
    origin: "Composition arabe de sihah (authentiques) et sitta (six).",
    explanation:
      "Les Sihah Sitta regroupent les recueils d'Al-Bukhari, Muslim, Abu Dawud, At-Tirmidhi, An-Nasa'i et Ibn Majah - une selection canonique progressivement etablie par consensus savant au fil des siecles plutot que fixee des l'origine.",
    relatedSlugs: ["sahih", "isnad"],
  },
  // --- Compagnons et premieres generations ---
  {
    term: "Sahaba (Compagnons)",
    termArabic: "الصحابة",
    slug: "sahaba",
    definition: "Les personnes ayant rencontre le Prophete ﷺ de son vivant en tant que croyant et etant mortes musulmanes.",
    origin: "Racine arabe s-h-b, evoquant le compagnonnage.",
    explanation:
      "Le statut de Sahabi (singulier de Sahaba) confere une autorite particuliere en matiere de transmission du hadith et de comprehension du Coran, la generation des Compagnons etant unanimement consideree par la tradition sunnite comme la meilleure generation de croyants.",
    relatedSlugs: ["salaf", "muhajirun"],
  },
  {
    term: "Tabi'un (Successeurs)",
    termArabic: "التابعون",
    slug: "tabiun",
    definition: "La generation ayant connu au moins un Compagnon du Prophete, sans avoir elle-meme rencontre le Prophete ﷺ.",
    origin: "Racine arabe t-b-', evoquant le fait de suivre.",
    explanation:
      "Les Tabi'un forment la seconde des trois meilleures generations identifiees par la tradition (avec les Compagnons et leurs propres successeurs, les Tabi' at-Tabi'in), un maillon essentiel de la chaine de transmission du savoir religieux.",
    relatedSlugs: ["sahaba", "salaf"],
  },
  {
    term: "Muhajirun (Emigres)",
    termArabic: "المهاجرون",
    slug: "muhajirun",
    definition: "Les premiers musulmans ayant emigre de La Mecque vers Medine pour fuir la persecution.",
    origin: "Racine arabe h-j-r, partagee avec Hijra.",
    explanation:
      "Les Muhajirun, ayant quitte biens et famille pour preserver leur foi, sont associes dans le Coran aux Ansar (les Auxiliaires medinois qui les accueillirent) comme modele fondateur de solidarite communautaire (sourate Al-Hashr, 59:8-9).",
    relatedSlugs: ["ansar", "sahaba"],
  },
  {
    term: "Ansar (Auxiliaires)",
    termArabic: "الأنصار",
    slug: "ansar",
    definition: "Les habitants de Medine ayant accueilli et soutenu le Prophete ﷺ et les musulmans emigres de La Mecque.",
    origin: "Racine arabe n-s-r, evoquant le secours, le soutien.",
    explanation:
      "Les Ansar partagerent volontairement logements et biens avec les Muhajirun nouvellement arrives, un episode de solidarite fondateur frequemment cite comme modele d'ukhuwwa (fraternite islamique) concrete.",
    relatedSlugs: ["muhajirun", "ukhuwwa"],
  },
  {
    term: "Ahl al-Bayt (Les Gens de la Maison)",
    termArabic: "أهل البيت",
    slug: "ahl-al-bayt",
    definition: "La famille proche du Prophete ﷺ, objet d'un respect et d'un statut particuliers dans la tradition islamique.",
    origin: "Expression coranique (sourate Al-Ahzab, 33:33).",
    explanation:
      "La composition exacte des Ahl al-Bayt (epouses du Prophete, sa fille Fatima, son gendre Ali et leurs enfants, plus largement l'ensemble de ses descendants) et la nature precise du statut qui leur est du font l'objet d'appreciations differentes entre traditions sunnite et chiite, ce respect etant neanmoins partage par l'ensemble des courants islamiques.",
    relatedSlugs: ["sahaba"],
  },
  // --- Spiritualite complementaire ---
  {
    term: "Dhawq (Gout spirituel)",
    termArabic: "الذوق",
    slug: "dhawq",
    definition: "Une forme de connaissance spirituelle directe et experientielle, comparee au sens du gout.",
    origin: "Racine arabe dh-w-q, evoquant litteralement le gout.",
    explanation:
      "Le dhawq designe, dans le vocabulaire soufi, une saisie intuitive et immediate d'une realite spirituelle, distincte du savoir acquis par le raisonnement discursif - une notion qui souligne la dimension experientielle revendiquee par cette tradition.",
    relatedSlugs: ["maarifa"],
  },
  {
    term: "Wird (Litanie quotidienne)",
    termArabic: "الورد",
    slug: "wird",
    definition: "Un ensemble de formules d'invocation recitees regulierement selon un rythme fixe, souvent quotidien.",
    origin: "Racine arabe w-r-d, evoquant ce qui revient regulierement.",
    explanation:
      "Le wird structure la pratique spirituelle individuelle par une regularite dans le dhikr, une discipline particulierement developpee au sein des confreries soufies (tariqa) ou chaque wird est souvent specifique a l'enseignement du maitre fondateur.",
    relatedSlugs: ["dhikr", "tariqa"],
  },
  // --- Prophetologie ---
  {
    term: "Nabi (Prophete)",
    termArabic: "النبي",
    slug: "nabi",
    definition: "Une personne choisie par Dieu pour recevoir une revelation, sans necessairement porter une nouvelle loi.",
    origin: "Racine arabe n-b-a, evoquant l'information, l'annonce.",
    explanation:
      "Le nabi transmet et confirme generalement un message deja revele a un prophete anterieur, a la difference du rasul qui porte une legislation nouvelle - une distinction classique de la theologie islamique, bien que les deux termes soient parfois employes de maniere interchangeable dans l'usage courant.",
    relatedSlugs: ["rasul", "nubuwwa"],
  },
  {
    term: "Rasul (Messager)",
    termArabic: "الرسول",
    slug: "rasul",
    definition: "Un prophete charge en outre de transmettre une legislation nouvelle a son peuple.",
    origin: "Racine arabe r-s-l, evoquant l'envoi, le message.",
    explanation:
      "Tout rasul est necessairement nabi, mais tout nabi n'est pas necessairement rasul selon la distinction classique : le rasul porte une revelation legislative destinee a etablir ou reformer une communaute, comme ce fut le cas de Musa, 'Isa ou Muhammad ﷺ.",
    relatedSlugs: ["nabi", "risala"],
  },
  {
    term: "Risala (Message prophetique)",
    termArabic: "الرسالة",
    slug: "risala",
    definition: "La mission et le message confies par Dieu a un prophete-messager (rasul).",
    origin: "Racine arabe r-s-l, partagee avec rasul.",
    explanation:
      "La risala designe l'ensemble du contenu legislatif et doctrinal confie a un rasul pour sa communaute, la risala de Muhammad ﷺ etant consideree par l'islam comme universelle et destinee a l'ensemble de l'humanite, non a un seul peuple.",
    relatedSlugs: ["rasul", "nubuwwa"],
  },
  {
    term: "Ulul-Azm (Les prophetes dotes de resolution)",
    termArabic: "أولو العزم",
    slug: "ulul-azm",
    definition: "Un groupe restreint de cinq prophetes distingues par une fermete et une patience exceptionnelles face a l'epreuve.",
    origin: "Expression coranique (sourate Al-Ahqaf, 46:35).",
    explanation:
      "La tradition exegetique identifie generalement Nuh, Ibrahim, Musa, 'Isa et Muhammad ﷺ comme les Ulul-Azm, en raison de l'ampleur des epreuves et de l'opposition qu'ils durent affronter dans l'accomplissement de leur mission prophetique.",
    relatedSlugs: ["nabi", "sabr"],
  },
  {
    term: "'Isma (Preservation prophetique de l'erreur)",
    termArabic: "العصمة",
    slug: "isma",
    definition: "La protection accordee par Dieu aux prophetes contre toute erreur dans la transmission du message religieux.",
    origin: "Racine arabe '-s-m, evoquant la protection, la preservation.",
    explanation:
      "L''isma garantit specifiquement l'exactitude de la transmission du message divin par les prophetes ; son extension a d'autres aspects de leur vie personnelle (erreurs mineures, jugements humains ordinaires) fait l'objet de nuances variees selon les theologiens, la plupart s'accordant sur son caractere absolu concernant strictement la revelation elle-meme.",
    relatedSlugs: ["nubuwwa", "nabi"],
  },
  {
    term: "Khatam an-Nubuwwa (Le Sceau de la Prophetie)",
    termArabic: "خاتم النبوة",
    slug: "khatam-an-nubuwwa",
    definition: "La doctrine selon laquelle Muhammad ﷺ est le dernier prophete envoye par Dieu, clôturant le cycle prophetique.",
    origin: "Expression coranique (sourate Al-Ahzab, 33:40).",
    explanation:
      "Cette doctrine, fondement theologique central du consensus sunnite, exclut toute pretention prophetique posterieure a Muhammad ﷺ ; elle a constitue historiquement un critere theologique determinant pour juger de l'orthodoxie de mouvements religieux ulterieurs se reclamant de l'islam.",
    relatedSlugs: ["nubuwwa", "rasul"],
  },
  // --- Rites funeraires ---
  {
    term: "Salat al-Janaza (Priere funeraire)",
    termArabic: "صلاة الجنازة",
    slug: "salat-al-janaza",
    definition: "La priere collective accomplie pour un defunt musulman, sans inclinaison ni prosternation.",
    origin: "Composition arabe de salat (priere) et janaza (le corps du defunt).",
    explanation:
      "La salat al-janaza, composee uniquement de takbirs et d'invocations en position debout, est un devoir collectif (fard kifaya) envers tout defunt musulman, son accomplissement par un nombre suffisant de membres de la communaute dispensant les autres de cette obligation.",
    relatedSlugs: ["fard-kifaya", "ghusl-al-mayyit"],
  },
  {
    term: "Ghusl al-Mayyit (Toilette funeraire)",
    termArabic: "غسل الميت",
    slug: "ghusl-al-mayyit",
    definition: "Le lavage rituel du corps d'un defunt musulman, prealable a son inhumation.",
    origin: "Racine arabe gh-s-l, partagee avec ghusl.",
    explanation:
      "Cette toilette, generalement accomplie par des personnes du meme sexe que le defunt (a l'exception des epoux entre eux), precede l'enveloppement dans le linceul (takfin) et vise a preparer le corps avec dignite pour son dernier voyage.",
    relatedSlugs: ["ghusl", "takfin"],
  },
  {
    term: "Takfin (Linceul funeraire)",
    termArabic: "التكفين",
    slug: "takfin",
    definition: "L'enveloppement du corps d'un defunt dans un linceul simple, avant son inhumation.",
    origin: "Racine arabe k-f-n, evoquant le linceul.",
    explanation:
      "Le linceul, traditionnellement blanc et depourvu d'ornements, exprime l'egalite absolue de tous les etres humains face a la mort, quelles qu'aient ete leur richesse ou leur condition sociale de leur vivant.",
    relatedSlugs: ["ghusl-al-mayyit", "salat-al-janaza"],
  },
  {
    term: "Talqin (Instruction donnee au mourant)",
    termArabic: "التلقين",
    slug: "talqin",
    definition: "Le fait de rappeler a une personne a l'agonie la formule d'attestation de foi.",
    origin: "Racine arabe l-q-n, evoquant l'enseignement transmis oralement.",
    explanation:
      "Fonde sur un hadith de Muslim (\"soufflez a vos mourants la ilaha illallah\"), le talqin vise a ce que les dernieres paroles conscientes du mourant soient, si possible, celles de l'attestation de foi.",
    relatedSlugs: ["tahlil", "shahada"],
  },
  {
    term: "Ta'ziya (Condoleances)",
    termArabic: "التعزية",
    slug: "taziya",
    definition: "La visite et les paroles de reconfort adressees a la famille d'un defunt.",
    origin: "Racine arabe '-z-y, evoquant le reconfort face a l'epreuve.",
    explanation:
      "La ta'ziya, recommandee durant les trois jours suivant le deces, s'accompagne traditionnellement de la preparation de repas pour la famille endeuillee par les proches et voisins, plutot que l'inverse - une pratique sociale d'entraide concrete face au deuil.",
    relatedSlugs: ["sabr"],
  },
  {
    term: "Sadaqah Jariyah (Aumone continue)",
    termArabic: "الصدقة الجارية",
    slug: "sadaqah-jariyah",
    definition: "Une oeuvre charitable dont le benefice continue de profiter aux autres apres la mort de son auteur.",
    origin: "Composition arabe de sadaqah (aumone) et jariyah (continue, courante).",
    explanation:
      "Un hadith de Muslim identifie trois sources de recompense continue apres la mort : la sadaqah jariyah, le savoir utile transmis (voir 'ilm nafi'), et un enfant vertueux qui invoque pour son parent - fondement religieux direct du waqf et d'autres oeuvres a benefice durable.",
    relatedSlugs: ["waqf", "ilm-nafi"],
  },
  {
    term: "'Ilm Nafi' (Savoir utile)",
    termArabic: "العلم النافع",
    slug: "ilm-nafi",
    definition: "Une connaissance transmise dont profitent d'autres personnes, generatrice de recompense continue pour celui qui l'a enseignee.",
    origin: "Composition arabe de 'ilm (savoir) et nafi' (utile, beneficiaire).",
    explanation:
      "Cite aux cotes de la sadaqah jariyah dans le meme hadith de Muslim, le savoir utile souligne la valeur particuliere accordee a l'enseignement dans la tradition islamique, sa transmission continuant a beneficier a son auteur bien apres sa mort.",
    relatedSlugs: ["sadaqah-jariyah"],
  },
  // --- Ethique : vertus et vices complementaires ---
  {
    term: "Birr al-Walidayn (Piete envers les parents)",
    termArabic: "بر الوالدين",
    slug: "birr-al-walidayn",
    definition: "Le devoir de bonte, de respect et d'obeissance envers ses parents.",
    origin: "Racine arabe b-r-r, partagee avec Al-Barr.",
    explanation:
      "Le Coran associe frequemment le birr al-walidayn directement apres l'adoration de Dieu Lui-meme (sourate Al-Isra, 17:23), en faisant l'une des obligations morales les plus fortement soulignees de l'ethique islamique, maintenue meme envers des parents non musulmans selon la majorite des commentateurs.",
    relatedSlugs: ["al-barr"],
  },
  {
    term: "Sillat ar-Rahim (Maintien des liens de parente)",
    termArabic: "صلة الرحم",
    slug: "sillat-ar-rahim",
    definition: "Le devoir de maintenir et d'entretenir les liens avec ses proches parents.",
    origin: "Composition arabe de sila (lien maintenu) et rahim (matrice, parente).",
    explanation:
      "Plusieurs hadiths associent le maintien des liens familiaux a l'allongement de la subsistance et de la vie elle-meme, tandis que sa rupture (qati'at ar-rahim) figure parmi les peches les plus severement condamnes, notamment dans un hadith de Bukhari et Muslim.",
    relatedSlugs: ["birr-al-walidayn", "ukhuwwa"],
  },
  {
    term: "Adab (Bonnes manieres, etiquette)",
    termArabic: "الأدب",
    slug: "adab",
    definition: "L'ensemble des bonnes manieres et du savoir-vivre attendus dans chaque situation de la vie quotidienne.",
    origin: "Racine arabe a-d-b, evoquant l'education, la civilite.",
    explanation:
      "L'adab englobe des regles de politesse tres concretes (manger de la main droite, saluer en entrant, demander la permission avant d'entrer) considerees comme le prolongement pratique de l'ethique islamique dans les gestes les plus ordinaires du quotidien.",
    relatedSlugs: ["hilm", "hayaa"],
  },
  {
    term: "Tabarruj (Exhibition de la parure)",
    termArabic: "التبرج",
    slug: "tabarruj",
    definition: "Le fait d'exhiber ostensiblement ses attraits physiques ou sa parure en public.",
    origin: "Terme coranique (sourate Al-Ahzab, 33:33).",
    explanation:
      "Le tabarruj est explicitement deconseille par le Coran, dans un verset s'adressant en premier lieu aux epouses du Prophete ﷺ mais generalement etendu par les commentateurs a l'ensemble des croyantes, en lien avec les regles de pudeur (awra).",
    relatedSlugs: ["awra", "hayaa"],
  },
  {
    term: "Israf (Gaspillage, exces)",
    termArabic: "الإسراف",
    slug: "israf",
    definition: "Le fait de depenser ou consommer au-dela de la mesure raisonnable, meme dans le licite.",
    origin: "Racine arabe s-r-f, evoquant l'exces, le depassement de la mesure.",
    explanation:
      "Le Coran (sourate Al-A'raf, 7:31) condamne l'israf jusque dans la nourriture et la boisson, un principe de moderation qui s'etend a l'ensemble des domaines de la vie materielle, distinct du tabdhir (gaspillage pur et destructeur, encore plus severement condamne).",
    relatedSlugs: ["qanaa", "zuhd"],
  },
  {
    term: "Bukhl (Avarice)",
    termArabic: "البخل",
    slug: "bukhl",
    definition: "Le refus de depenser ou de partager ses biens au-dela du strict necessaire pour soi-meme.",
    origin: "Racine arabe b-kh-l, evoquant l'avarice.",
    explanation:
      "Le Coran (sourate Al Imran, 3:180) met en garde contre l'illusion que l'avarice profite a celui qui la pratique, presentee au contraire comme un mal pour lui-meme, a l'oppose direct de la generosite (karam) valorisee dans l'ethique islamique.",
    relatedSlugs: ["al-karim", "sadaqah"],
  },
  {
    term: "Hasad (Envie)",
    termArabic: "الحسد",
    slug: "hasad",
    definition: "Le fait de souhaiter la disparition d'un bienfait accorde a autrui.",
    origin: "Racine arabe h-s-d, evoquant l'envie, la jalousie.",
    explanation:
      "Un hadith de Bukhari et Muslim met en garde contre le hasad comme un feu qui consume les bonnes actions a la maniere dont le feu consume le bois, le distinguant du ghibta (souhait d'obtenir un bien similaire sans vouloir sa perte pour autrui), considere legitime.",
    relatedSlugs: ["qanaa"],
  },
  {
    term: "Husn Zann (Bonne opinion d'autrui)",
    termArabic: "حسن الظن",
    slug: "husn-zann",
    definition: "Le fait d'interpreter favorablement les actes et intentions d'autrui, en l'absence de preuve contraire.",
    origin: "Composition arabe de husn (bon) et zann (opinion, supposition).",
    explanation:
      "Le Coran (sourate Al-Hujurat, 49:12) met explicitement en garde contre l'exces de suspicion (su' zann), le qualifiant de peche dans certains de ses degres, et invite a preferer une interpretation bienveillante des actes d'autrui tant qu'aucune preuve n'etablit le contraire.",
    relatedSlugs: ["ghiba", "sidq"],
  },
  {
    term: "Namima (Rapportage malveillant)",
    termArabic: "النميمة",
    slug: "namima",
    definition: "Le fait de rapporter les propos d'une personne a une autre dans l'intention de semer la discorde.",
    origin: "Racine arabe n-m-m, evoquant le rapportage malveillant.",
    explanation:
      "La namima se distingue de la ghiba par son objectif specifique de creer ou attiser un conflit entre deux personnes ; un hadith de Bukhari et Muslim la compte parmi les causes directes du chatiment de la tombe rapportees au sujet de deux defunts.",
    relatedSlugs: ["ghiba"],
  },
  {
    term: "Kadhib (Mensonge)",
    termArabic: "الكذب",
    slug: "kadhib",
    definition: "Le fait d'affirmer une chose contraire a la realite, sciemment.",
    origin: "Racine arabe k-dh-b, evoquant le mensonge.",
    explanation:
      "Le mensonge est presente par un hadith de Bukhari et Muslim comme une voie menant a la transgression puis au Feu, a l'oppose direct de la sidq (veracite) qui mene a la piete puis au Paradis ; le fiqh classique en admet neanmoins de tres rares exceptions encadrees, comme reconcilier deux personnes en conflit.",
    relatedSlugs: ["sidq"],
  },
  // --- Designation et courants ---
  {
    term: "Ahl as-Sunna wal-Jama'a (Les Gens de la Sunna et du Groupe)",
    termArabic: "أهل السنة والجماعة",
    slug: "ahl-as-sunna-wal-jamaa",
    definition: "La designation traditionnelle de la branche majoritaire de l'islam, le sunnisme.",
    origin: "Composition arabe de ahl (gens), sunna (voie prophetique) et jama'a (le groupe uni).",
    explanation:
      "Cette appellation revendique a la fois la fidelite a la Sunna du Prophete ﷺ et l'attachement au consensus (ijma') et a l'unite de la communaute, par opposition historique a des courants juges s'en etre ecartes sur des questions theologiques ou politiques majeures - un terme d'auto-designation plutot qu'une categorie fixee de l'exterieur.",
    relatedSlugs: ["sunnah", "ijma"],
  },
  {
    term: "Shahada (Attestation de foi)",
    termArabic: "الشهادة",
    slug: "shahada",
    definition: "L'attestation qu'il n'y a de divinite digne d'adoration qu'Allah et que Muhammad est Son messager, premier pilier de l'Islam.",
    origin: "Racine arabe sh-h-d, partagee avec Ash-Shahid.",
    explanation:
      "La shahada, formule la plus courte et la plus fondamentale de la foi islamique, en constitue a la fois la porte d'entree (sa prononciation sincere suffisant a faire d'une personne musulmane) et le rappel constant, integree a l'adhan, a l'iqama et au tashahhud recite dans chaque priere.",
    relatedSlugs: ["tawhid", "nubuwwa", "tahlil"],
  },
  // --- Temps sacres du calendrier islamique ---
  {
    term: "Laylat al-Qadr (La Nuit du Destin)",
    termArabic: "ليلة القدر",
    slug: "laylat-al-qadr",
    definition: "Une nuit du dernier tiers du Ramadan, durant laquelle debuta la revelation du Coran, meilleure qu'mille mois.",
    origin: "Terme coranique, donnant son nom a la sourate Al-Qadr (97).",
    explanation:
      "Le Coran (sourate Al-Qadr, 97:3) affirme que cette nuit vaut mieux que mille mois d'adoration ordinaire ; sa date precise reste volontairement incertaine selon la tradition, bien que largement recherchee parmi les nuits impaires des dix derniers jours du Ramadan, notamment la vingt-septieme, encourageant une adoration soutenue durant toute cette periode plutot que concentree sur une seule nuit.",
    relatedSlugs: ["sawm", "wahy", "itikaf"],
  },
  {
    term: "'Itikaf (Retraite spirituelle)",
    termArabic: "الاعتكاف",
    slug: "itikaf",
    definition: "Une retraite spirituelle a la mosquee, consacree exclusivement a l'adoration, generalement durant les dix derniers jours du Ramadan.",
    origin: "Racine arabe '-k-f, evoquant le fait de se consacrer, de s'attacher a un lieu.",
    explanation:
      "Durant l'i'tikaf, pratique reguliere du Prophete ﷺ durant les dix derniers jours du Ramadan selon plusieurs hadiths, la personne se retire du monde exterieur pour se consacrer entierement a la priere, au dhikr et a la recherche de Laylat al-Qadr.",
    relatedSlugs: ["laylat-al-qadr", "sawm"],
  },
  {
    term: "Ashura (Le dixieme jour de Muharram)",
    termArabic: "عاشوراء",
    slug: "ashura",
    definition: "Le dixieme jour du mois de Muharram, journee de jeune recommande dans la tradition sunnite.",
    origin: "Racine arabe '-sh-r, evoquant le dixieme.",
    explanation:
      "Le jeune d'Ashura, anterieur a l'institution du Ramadan et maintenu ensuite comme recommandation, commemore selon un hadith de Bukhari le sauvetage de Moise et des Israelites de Pharaon ; ce jour revet par ailleurs une signification specifique et distincte dans la tradition chiite, liee au souvenir du massacre de Kerbala.",
    relatedSlugs: ["sawm", "ashhur-al-hurum"],
  },
  {
    term: "Ashhur al-Hurum (Les mois sacres)",
    termArabic: "الأشهر الحرم",
    slug: "ashhur-al-hurum",
    definition: "Quatre mois du calendrier lunaire islamique durant lesquels le combat etait traditionnellement proscrit.",
    origin: "Terme coranique (sourate At-Tawba, 9:36).",
    explanation:
      "Ces quatre mois - Dhul-Qa'da, Dhul-Hijja, Muharram et Rajab - etaient deja consideres sacres avant l'islam, qui en confirma le statut particulier ; la tradition invite a une vigilance morale accrue durant ces periodes, sans qu'elles ne comportent d'obligations rituelles specifiques distinctes du reste de l'annee.",
    relatedSlugs: ["ashura", "hajj"],
  },
  // --- Vocabulaire juridique de base (usul et concepts transversaux) ---
  {
    term: "'Aqd (Contrat)",
    termArabic: "العقد",
    slug: "aqd",
    definition: "L'accord de volontes entre deux parties, formant la base de toute transaction reconnue par le fiqh.",
    origin: "Racine arabe '-q-d, evoquant le lien, le noeud.",
    explanation:
      "Le fiqh des transactions (mu'amalat) analyse chaque type d'echange - vente, location, mariage, societe - comme une variante particuliere de la notion generale de 'aqd, chacune assortie de ses propres conditions de validite (parties capables, objet licite, consentement libre).",
    relatedSlugs: ["bay", "gharar"],
  },
  {
    term: "Dhimma (Capacite juridique, responsabilite)",
    termArabic: "الذمة",
    slug: "dhimma",
    definition: "La capacite juridique et morale d'une personne a etre tenue d'obligations et titulaire de droits.",
    origin: "Racine arabe dh-m-m, partagee avec dhimmi.",
    explanation:
      "La dhimma designe, en fiqh classique, la capacite abstraite d'une personne a contracter des dettes, assumer des responsabilites et detenir des droits - un concept juridique fondamental dont derive notamment le terme dhimmi, applique historiquement au statut des non-musulmans places sous cette meme logique de protection contractuelle.",
    relatedSlugs: ["ahliyya", "dhimmi"],
  },
  {
    term: "Ahliyya (Capacite d'exercice)",
    termArabic: "الأهلية",
    slug: "ahliyya",
    definition: "L'aptitude concrete d'une personne a exercer ses droits et assumer ses obligations religieuses et legales.",
    origin: "Racine arabe a-h-l, evoquant l'aptitude, la qualification.",
    explanation:
      "Le fiqh distingue l'ahliyyat al-wujub (capacite de jouissance, presente des la naissance) de l'ahliyyat al-ada' (capacite d'exercice effective, generalement liee a la puberte et a la raison), une distinction qui explique par exemple pourquoi un mineur peut heriter (jouissance) sans pouvoir conclure seul un contrat de vente (exercice).",
    relatedSlugs: ["dhimma"],
  },
  {
    term: "Milk (Propriete)",
    termArabic: "الملك",
    slug: "milk",
    definition: "Le droit exclusif de disposer d'un bien, reconnu et protege par le fiqh.",
    origin: "Racine arabe m-l-k, partagee avec Al-Malik.",
    explanation:
      "Le fiqh islamique reconnait et protege fermement la propriete privee (milk), tout en la subordonnant theologiquement a une propriete divine ultime et absolue - une tension feconde qui fonde a la fois le respect strict des biens d'autrui (interdiction du vol, du ghasb) et les mecanismes de redistribution comme la zakat.",
    relatedSlugs: ["al-malik", "aqd"],
  },
  {
    term: "Mal (Bien, richesse)",
    termArabic: "المال",
    slug: "mal",
    definition: "Tout bien materiel ayant une valeur reconnue et pouvant faire l'objet d'une appropriation licite.",
    origin: "Racine arabe m-w-l, evoquant le bien, la fortune.",
    explanation:
      "Le fiqh definit precisement ce qui constitue un mal valablement echangeable - excluant par exemple le vin ou le porc, sans valeur licite pour un musulman - une categorisation prealable a toute analyse d'un contrat de vente ou d'une obligation de zakat.",
    relatedSlugs: ["milk", "zakat"],
  },
  {
    term: "Hawala (Transfert de creance)",
    termArabic: "الحوالة",
    slug: "hawala",
    definition: "Le transfert d'une dette ou d'une creance d'une personne a une autre, qui en devient juridiquement responsable.",
    origin: "Racine arabe h-w-l, evoquant le transfert, le changement.",
    explanation:
      "La hawala permet a un debiteur de transferer son obligation de paiement vers un tiers qui accepte de s'en charger, un mecanisme qui a historiquement facilite le commerce a longue distance et dont le nom demeure aujourd'hui associe a des reseaux informels de transfert d'argent dans plusieurs regions du monde musulman.",
    relatedSlugs: ["aqd", "kafala"],
  },
  // --- Methodologie du fiqh (usul al-fiqh), notions complementaires ---
  {
    term: "Maqasid ash-Shari'a (Les finalites superieures de la loi)",
    termArabic: "مقاصد الشريعة",
    slug: "maqasid-ash-sharia",
    definition: "Les objectifs generaux poursuivis par la legislation islamique, au-dela de la lettre de chaque regle particuliere.",
    origin: "Composition arabe de maqasid (finalites) et sharia (la loi).",
    explanation:
      "Systematisee notamment par le juriste andalou Ash-Shatibi, la theorie des maqasid identifie cinq necessites fondamentales que la sharia vise a preserver (dharuriyyat) : la religion, la vie, la raison, la lignee et les biens - un cadre de lecture qui permet aux juristes d'articuler les regles particulieres a leur finalite d'ensemble plutot qu'a leur seule application litterale.",
    relatedSlugs: ["dharuriyyat-al-khams", "maslaha"],
  },
  {
    term: "Ad-Daruriyyat al-Khams (Les cinq necessites fondamentales)",
    termArabic: "الضروريات الخمس",
    slug: "dharuriyyat-al-khams",
    definition: "Les cinq biens fondamentaux - religion, vie, raison, lignee, biens - que la legislation islamique vise a preserver en priorite.",
    origin: "Composition arabe de daruriyyat (necessites) et khams (cinq).",
    explanation:
      "Ces cinq necessites servent de grille de lecture aux juristes pour comprendre la logique d'ensemble de regles en apparence disparates : l'interdiction du vin preserve la raison, celle du meurtre preserve la vie, les regles de heritage et de mariage preservent la lignee, l'interdiction du vol preserve les biens, et l'apostasie touche a la preservation de la religion.",
    relatedSlugs: ["maqasid-ash-sharia"],
  },
  {
    term: "'Amm wa Khass (General et particulier)",
    termArabic: "العام والخاص",
    slug: "amm-wa-khass",
    definition: "La distinction methodologique entre un texte de portee generale et un texte qui en restreint le champ d'application.",
    origin: "Termes arabes '-m-m (general) et kh-s-s (particulier), vocabulaire d'usul al-fiqh.",
    explanation:
      "Un texte 'amm (general) peut voir sa portee restreinte par un texte khass (particulier) traitant du meme sujet de maniere plus specifique - un outil methodologique essentiel pour concilier des versets ou hadiths apparemment contradictoires sans recourir a l'abrogation (naskh).",
    relatedSlugs: ["naskh", "mutlaq-wa-muqayyad"],
  },
  {
    term: "Mutlaq wa Muqayyad (Absolu et restreint)",
    termArabic: "المطلق والمقيد",
    slug: "mutlaq-wa-muqayyad",
    definition: "La distinction methodologique entre un terme employe sans condition et le meme terme employe avec une condition restrictive ailleurs dans les textes.",
    origin: "Termes arabes t-l-q (absolu, libere) et q-y-d (restreint, conditionne).",
    explanation:
      "Lorsqu'un meme terme apparait tantot sans condition (mutlaq) tantot avec une condition precise (muqayyad) dans des textes differents traitant du meme sujet, les juristes examinent si la version restreinte doit s'appliquer a la version absolue - une operation d'harmonisation distincte du 'amm wa khass bien que methodologiquement proche.",
    relatedSlugs: ["amm-wa-khass"],
  },
  {
    term: "Dalil (Preuve, argument juridique)",
    termArabic: "الدليل",
    slug: "dalil",
    definition: "Toute source ou argument sur lequel un juriste s'appuie pour etablir une regle de fiqh.",
    origin: "Racine arabe d-l-l, evoquant l'indication, la preuve.",
    explanation:
      "Le terme dalil englobe l'ensemble des sources reconnues du droit islamique (Coran, Sunna, ijma', qiyas, et selon les ecoles istihsan, maslaha, 'urf...), la hierarchie et le poids relatif accorde a chacune constituant precisement l'objet d'etude d'usul al-fiqh.",
    relatedSlugs: ["ijma", "qiyas"],
  },
  {
    term: "Talfiq (Combinaison de positions d'ecoles differentes)",
    termArabic: "التلفيق",
    slug: "talfiq",
    definition: "Le fait de suivre, pour differents aspects d'une meme question, les positions de plusieurs ecoles juridiques distinctes.",
    origin: "Racine arabe l-f-q, evoquant l'assemblage, la couture de pieces distinctes.",
    explanation:
      "La licite du talfiq fait l'objet de debats parmi les juristes contemporains : certains l'autorisent largement au nom de la recherche de la facilite legitime, d'autres le limitent strictement pour eviter qu'un croyant ne compose, question par question, une position sur mesure qu'aucune ecole n'aurait reconnue dans son ensemble.",
    relatedSlugs: ["madhab", "taqlid"],
  },
  // --- Sciences coraniques complementaires ---
  {
    term: "Asbab al-Wurud (Circonstances d'enonciation d'un hadith)",
    termArabic: "أسباب الورود",
    slug: "asbab-al-wurud",
    definition: "Les circonstances historiques ayant entoure la formulation d'un hadith par le Prophete ﷺ.",
    origin: "Composition arabe de asbab (causes) et wurud (arrivee, enonciation).",
    explanation:
      "Parallele a la discipline des asbab an-nuzul pour le Coran, l'etude des asbab al-wurud permet de mieux cerner la portee d'un hadith - generale ou liee a un contexte particulier - un outil essentiel pour eviter une application decontextualisee de certains propos prophetiques.",
    relatedSlugs: ["asbab-al-nuzul", "isnad"],
  },
  {
    term: "Gharib al-Qur'an (Termes rares du Coran)",
    termArabic: "غريب القرآن",
    slug: "gharib-al-quran",
    definition: "La discipline consacree a l'explication des termes coraniques rares ou d'un usage linguistique peu courant.",
    origin: "Racine arabe gh-r-b, evoquant l'etrangete, la rarete.",
    explanation:
      "Cette discipline philologique, developpee des les premiers siecles de l'islam, s'appuie largement sur la poesie preislamique et les dialectes arabes anciens pour eclaircir des termes coraniques dont le sens n'etait deja plus evident pour certains lecteurs quelques generations apres la revelation.",
    relatedSlugs: ["tawil"],
  },
  {
    term: "Munasabat (Correspondances thematiques du Coran)",
    termArabic: "المناسبات",
    slug: "munasabat",
    definition: "L'etude des liens thematiques et structurels entre versets et sourates successifs du Coran.",
    origin: "Racine arabe n-s-b, evoquant le lien, la correspondance.",
    explanation:
      "Cette discipline exegetique s'attache a montrer la coherence interne de l'agencement du texte coranique, souvent percu par un lecteur non averti comme discontinu, en mettant en lumiere des liens thematiques ou rhetoriques entre des passages en apparence disparates.",
    relatedSlugs: ["tafsir"],
  },
  {
    term: "Tilawa (Recitation du Coran)",
    termArabic: "التلاوة",
    slug: "tilawa",
    definition: "La recitation du texte coranique, dans un cadre rituel ou d'etude personnelle.",
    origin: "Racine arabe t-l-w, evoquant le fait de suivre, de reciter a la suite.",
    explanation:
      "La tilawa designe l'acte de recitation en general, distinct du tajwid qui en regit les regles de prononciation precise et des qira'at qui en designent les variantes authentifiees - sa pratique reguliere est fortement recommandee independamment de tout contexte de priere.",
    relatedSlugs: ["tajwid", "hifz-al-quran"],
  },
  {
    term: "Hifz al-Qur'an (Memorisation du Coran)",
    termArabic: "حفظ القرآن",
    slug: "hifz-al-quran",
    definition: "La memorisation complete ou partielle du texte coranique.",
    origin: "Racine arabe h-f-z, partagee avec Al-Hafiz.",
    explanation:
      "La memorisation complete du Coran (celui qui l'accomplit etant appele hafiz) a historiquement joue un role central dans la preservation du texte a travers les generations, complementaire de sa transmission ecrite, et demeure une pratique educative valorisee dans le monde musulman contemporain.",
    relatedSlugs: ["tilawa", "al-hafiz"],
  },
  {
    term: "Sutra (Repere de priere)",
    termArabic: "السترة",
    slug: "sutra",
    definition: "Un objet place devant soi pendant la priere pour delimiter l'espace de prosternation.",
    origin: "Racine arabe s-t-r, evoquant ce qui protege, ce qui delimite.",
    explanation:
      "La sutra (mur, colonne, ou simple objet pose au sol) permet a celui qui prie de delimiter un espace protege devant lui, recommande notamment pour eviter qu'une personne ne passe directement devant le fidele en priere, une gene rapportee comme severement deconseillee par plusieurs hadiths.",
    relatedSlugs: ["salah", "qibla"],
  },
  // --- Ethique sociale complementaire ---
  {
    term: "Ta'aruf (Connaissance mutuelle entre les peuples)",
    termArabic: "التعارف",
    slug: "taaruf",
    definition: "Le principe coranique selon lequel la diversite des peuples et des tribus est ordonnee a la connaissance mutuelle.",
    origin: "Terme coranique (sourate Al-Hujurat, 49:13).",
    explanation:
      "Le Coran (49:13) affirme que Dieu a cree l'humanite en peuples et tribus distincts \"afin que vous vous connaissiez mutuellement\" (ta'aruf), precisant immediatement que la seule superiorite reconnue entre les hommes est celle de la piete (taqwa) - un fondement scripturaire souvent cite contre toute hierarchie fondee sur l'origine ethnique.",
    relatedSlugs: ["umma", "karama-insaniyya"],
  },
  {
    term: "Karama Insaniyya (Dignite humaine)",
    termArabic: "الكرامة الإنسانية",
    slug: "karama-insaniyya",
    definition: "Le statut d'honneur et de dignite accorde par Dieu a l'ensemble des etres humains, independamment de leur foi.",
    origin: "Terme coranique (sourate Al-Isra, 17:70).",
    explanation:
      "Le Coran (17:70) affirme avoir \"honore les fils d'Adam\" de maniere generale, un fondement scripturaire central invoque pour affirmer une dignite humaine universelle, anterieure et independante de toute appartenance religieuse particuliere.",
    relatedSlugs: ["taaruf", "adl"],
  },
  // --- Theologie speculative (kalam) ---
  {
    term: "Wajib al-Wujud (La Necessite d'existence)",
    termArabic: "واجب الوجود",
    slug: "wajib-al-wujud",
    definition: "Un concept de theologie speculative designant Dieu comme le seul etre dont l'existence est necessaire par Lui-meme.",
    origin: "Terminologie de kalam, largement developpee par Ibn Sina puis reprise par des theologiens comme Al-Ghazali.",
    explanation:
      "A la difference de toute chose creee, dont l'existence est seulement possible (mumkin al-wujud) et depend d'une cause exterieure, Dieu est decrit comme wajib al-wujud : Son existence ne depend d'aucune cause et ne peut etre autrement qu'elle n'est - un argument philosophique repris par plusieurs theologiens sunnites pour demontrer rationnellement l'existence divine.",
    relatedSlugs: ["tawhid", "huduth-al-alam"],
  },
  {
    term: "Huduth al-'Alam (Le caractere cree du monde)",
    termArabic: "حدوث العالم",
    slug: "huduth-al-alam",
    definition: "La doctrine selon laquelle l'univers a eu un commencement dans le temps, argument classique en faveur de l'existence d'un Createur.",
    origin: "Composition arabe de huduth (le fait d'advenir, de commencer) et 'alam (le monde, l'univers).",
    explanation:
      "Les theologiens ash'arites ont largement developpe cet argument (proche de ce que la philosophie occidentale designera plus tard comme l'argument cosmologique kalam) : puisque le monde a eu un commencement, il requiert necessairement une cause qui l'a fait advenir, cette cause etant Dieu Lui-meme, seul etre necessaire (wajib al-wujud).",
    relatedSlugs: ["wajib-al-wujud", "al-khaliq"],
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
