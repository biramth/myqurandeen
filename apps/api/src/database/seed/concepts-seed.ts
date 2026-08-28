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
    origin: "Racine arabe w-h-d, exprimant l'idée d'unicité.",
    explanation:
      "Le tawhid affirme qu'il n'existe qu'un seul Dieu, sans associé, sans égal et sans partenaire, dans Son essence, Ses attributs et Son adoration. Il constitue le premier des deux témoignages de la shahada et l'axe autour duquel s'organise l'ensemble de la doctrine islamique, tout appel prophétique dans le Coran se ramenant, selon la tradition, a ce même message fondamental (sourate An-Nahl, 16:36).\n\nIl est traditionnellement decompose en trois volets par les théologiens, détaillés séparément sur cette plateforme : l'unicité de la seigneurie (rububiyya), l'unicité de l'adoration (uluhiyya) et l'unicité des noms et attributs divins (asma wa sifat). Son opposé, le shirk, est présenté dans le Coran comme la seule faute que Dieu ne pardonne pas sans repentir sincère (sourate An-Nisa, 4:48).",
    relatedSlugs: ["shirk", "iman"],
  },
  {
    term: "Salah",
    termArabic: "الصلاة",
    slug: "salah",
    definition: "La prière rituelle islamique, effectuee cinq fois par jour.",
    origin: "Terme coranique, deuxième pilier de l'Islam.",
    explanation:
      "La salah désigne la prière rituelle obligatoire accomplie cinq fois par jour a des horaires déterminés par la position du soleil (aube, mi-journée, après-midi, coucher du soleil, nuit), comprenant des postures (station debout, inclinaison, prosternation) et des récitations coraniques specifiques. Elle constitue le deuxième des cinq piliers de l'Islam, institue selon la tradition lors du voyage nocturne et de l'ascension du Prophète ﷺ (Isra wal Mi'raj).\n\nElle est considérée comme le lien direct entre le croyant et Dieu, ne necessitant aucun intermediaire, et doit être precedee des petites ablutions (wudu). Le Coran (sourate Al-Ankabut, 29:45) la présente comme un rempart contre \"la turpitude et le blâmable\".",
    relatedSlugs: ["wudu", "iman"],
  },
  {
    term: "Zakat",
    termArabic: "الزكاة",
    slug: "zakat",
    definition: "L'aumone obligatoire prelevee annuellement sur certains biens.",
    origin: "Racine arabe z-k-w, évoquant la purification et la croissance.",
    explanation:
      "La zakat est une aumone obligatoire, troisième pilier de l'Islam, due annuellement par les musulmans disposant de biens depassant un seuil minimal (nisab) conserve pendant une annee lunaire complete, generalement calculee a 2,5% pour l'or, l'argent et les avoirs monetaires. Elle est redistribuee a des categories de beneficiaires définies explicitement par le Coran (sourate At-Tawba, 9:60), notamment les pauvres, les necessiteux et les personnes endettees.\n\nElle est concue a la fois comme un acte d'adoration purifiant les biens de celui qui la verse (d'où sa racine, évoquant la purification et la croissance) et comme un mecanisme structurel de redistribution sociale, distinct de la sadaqah qui reste volontaire et sans montant fixe.",
    relatedSlugs: ["sawm"],
  },
  {
    term: "Sawm",
    termArabic: "الصوم",
    slug: "sawm",
    definition: "Le jeune, notamment celui du mois de Ramadan.",
    origin: "Terme coranique, quatrième pilier de l'Islam.",
    explanation:
      "Le sawm désigne l'abstinence complete de nourriture, de boisson et de rapports intimes du lever a la tombee du jour, principalement durant le mois lunaire de Ramadan, mois durant lequel la tradition situe le debut de la révélation coranique. Quatrième pilier de l'Islam, il est présente dans le Coran (sourate Al-Baqara, 2:183) comme un moyen d'acceder a la piété (taqwa), et non comme une fin en soi.\n\nCertaines categories de personnes (malades, voyageurs, femmes enceintes ou allaitantes...) beneficient de concessions légales (rukhsa) leur permettant de rompre le jeune sous condition de rattrapage ou de compensation, selon des modalites qui varient d'une école juridique a l'autre.",
    relatedSlugs: ["taqwa", "zakat"],
  },
  {
    term: "Hajj",
    termArabic: "الحج",
    slug: "hajj",
    definition: "Le grand pèlerinage à La Mecque, cinquième pilier de l'Islam.",
    origin: "Terme coranique associé au sanctuaire de la Kaaba.",
    explanation:
      "Le hajj est le pèlerinage annuel a La Mecque, obligatoire une fois dans la vie pour tout musulman qui en a la capacité physique et financiere (istita'a). Il comprend une série de rites accomplis durant les premiers jours du mois de Dhul-Hijja - dont la station a Arafat, le sacrifice, la lapidation des stèles a Mina et les circumambulations autour de la Kaaba - sur des lieux associés a la tradition d'Ibrahim et Isma'il.\n\nDistinct de la 'umra (le \"petit pèlerinage\"), qui peut être accompli a tout moment de l'année et comporte moins de rites, le hajj marque chaque annee le rassemblement le plus vaste de musulmans venus du monde entier en un même lieu et un même temps.",
    relatedSlugs: [],
  },
  {
    term: "Iman",
    termArabic: "الإيمان",
    slug: "iman",
    definition: "La foi islamique, comprenant la croyance intérieure et son expression.",
    origin: "Racine arabe a-m-n, évoquant la sécurité et la confiance.",
    explanation:
      "L'iman désigne la foi, généralement decrite - notamment a partir du celèbre \"hadith de Jibril\" rapporte par Muslim - comme reposant sur six articles : la croyance en Dieu, en Ses anges, en Ses livres, en Ses messagers, au Jour dernier et au décret divin (qadar). Elle est étroitement liée a l'islam (la soumission pratique, exprimee par les cinq piliers) et a l'ihsan (l'excellence spirituelle), les trois notions formant ensemble ce que ce même hadith presente comme les trois degres de la religion.\n\nLes théologiens divergent sur la définition précise de l'iman : pour les hanafites et maturidites, l'iman relève essentiellement de la croyance du cœur et de son expression verbale, tandis que pour d'autres courants, dont une partie des ash'arites et les hanbalites/atharites, les œuvres font partie integrante de l'iman, qui peut ainsi augmenter ou diminuer selon l'obéissance ou la desobeissance du croyant.",
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
      "L'ihsan est défini dans le hadith de Jibril, rapporte par Muslim, comme le fait \"d'adorer Dieu comme si tu Le voyais, et si tu ne Le vois pas, sache que Lui te voit\". Il représente le troisième et plus élevé des degres de la religion identifies par ce hadith, au-dela de la simple observance des règles exterieures (islam) et de la croyance interieure (iman).\n\nDans son acception la plus large, l'ihsan ne se limite pas a l'adoration rituelle : le Coran l'emploie egalement pour designer l'excellence morale dans les relations humaines, notamment envers les parents (sourate Al-Isra, 17:23). Cette double dimension - conscience spirituelle constante et excellence du comportement - en fait une notion centrale de la spiritualité islamique (tasawwuf).",
    relatedSlugs: ["iman", "taqwa"],
  },
  {
    term: "Taqwa",
    termArabic: "التقوى",
    slug: "taqwa",
    definition: "La conscience de Dieu et la crainte révérencielle qui en découle.",
    origin: "Racine arabe w-q-y, évoquant la protection.",
    explanation:
      "La taqwa désigne un état de conscience constante de Dieu, conduisant a se proteger de Son mécontentement par l'obéissance et l'évitement du peche - une vigilance interieure plutôt qu'une simple crainte passive. Le Coran la présente frequemment comme le critère de la supériorité spirituelle entre les êtres humains, independamment de l'origine ou du statut social (sourate Al-Hujurat, 49:13).\n\nElle est également présentée comme la finalite du jeune (sourate Al-Baqara, 2:183) et comme une condition de discernement (furqan) accordee par Dieu a celui qui la cultive (sourate Al-Anfal, 8:29), articulant ainsi etroitement dimension ethique et dimension spirituelle.",
    relatedSlugs: ["ihsan", "sawm"],
  },
  {
    term: "Shirk",
    termArabic: "الشرك",
    slug: "shirk",
    definition: "Le fait d'associer des partenaires ou des égaux à Dieu.",
    origin: "Racine arabe sh-r-k, évoquant l'association et le partage.",
    explanation:
      "Le shirk est l'opposé du tawhid : il consiste a attribuer a une entite autre que Dieu des qualites, un pouvoir ou un droit a l'adoration qui Lui reviennent exclusivement, que ce soit de facon manifeste (adoration d'idoles ou d'autres divinites) ou plus subtile. Il est considère dans le Coran comme la faute la plus grave, la seule que Dieu n'accorde pas de pardonner sans repentir prealable (sourate An-Nisa, 4:48).\n\nLes théologiens distinguent traditionnellement le \"grand shirk\" (ash-shirk al-akbar), qui fait sortir de l'Islam, du \"petit shirk\" (ash-shirk al-asghar) comme la riya (ostentation), qui constitue une faute grave sans annuler la foi elle-même.",
    relatedSlugs: ["tawhid"],
  },
  {
    term: "Fiqh",
    termArabic: "الفقه",
    slug: "fiqh",
    definition: "La compréhension et l'élaboration du droit islamique.",
    origin: "Racine arabe f-q-h, évoquant la compréhension approfondie.",
    explanation:
      "Le fiqh désigne la discipline juridique islamique, c'est-a-dire l'ensemble des règles pratiques deduites des sources scripturaires (Coran, Sunna) par les savants, a l'aide d'une méthodologie codifiee (usul al-fiqh) reposant sur le Coran, la Sunna, le consensus (ijma') et le raisonnement analogique (qiyas). Il couvre aussi bien le culte (ibadat - prière, jeune, zakat, hajj) que les relations sociales (mu'amalat - contrats, mariage, commerce, droit penal).\n\nA la difference de la théologie (aqida), qui traite des fondements de la croyance, le fiqh se concentre sur la mise en pratique concrete de la religion, un domaine ou la divergence licite (ikhtilaf) entre écoles juridiques est largement documentee et acceptee, comme l'illustre le comparateur de fiqh de cette plateforme.",
    relatedSlugs: [],
  },
  {
    term: "Sunnah",
    termArabic: "السنة",
    slug: "sunnah",
    definition: "La tradition et la pratique du Prophète Muhammad ﷺ.",
    origin: "Terme arabe désignant à l'origine une voie ou une pratique établie.",
    explanation:
      "La sunnah renvoie a l'ensemble des paroles, actes et approbations tacites attribués au Prophète ﷺ, transmis par la tradition du hadith a travers des chaînes de rapporteurs (isnad) minutieusement etudiees par les spécialistes du hadith. Elle constitue, avec le Coran, l'une des deux sources scripturaires principales de l'Islam, et joue un rôle indispensable pour expliciter, detailler ou preciser des prescriptions coraniques enoncees de façon generale (par exemple, la manière precise d'accomplir la prière).\n\nLe terme est egalement employe dans un sens juridique plus restreint pour designer une categorie d'actes recommandes (par opposition a fard, l'obligatoire), dont l'accomplissement est meritoire sans être strictement obligatoire.",
    relatedSlugs: ["fiqh", "bidah"],
  },
  {
    term: "Bid'ah",
    termArabic: "البدعة",
    slug: "bidah",
    definition: "Une innovation introduite dans la pratique religieuse.",
    origin: "Racine arabe b-d-'a, évoquant la création d'une chose nouvelle.",
    explanation:
      "La bid'ah désigne une pratique religieuse introduite sans précédent dans le Coran ou la Sunna et presentee comme faisant partie de la religion. Un hadith rapporte par Muslim avertit que \"toute innovation est un egarement\", une mise en garde qui structure fortement l'attitude traditionnelle envers les nouveautes en matiere de culte.\n\nLa portée exacte du terme - notamment la distinction entre innovations religieuses condamnables et nouveautes purement pratiques ou organisationnelles sans pretention cultuelle (moyens de communication, outils d'enseignement, etc.) - fait l'objet de discussions classiques parmi les savants ; certains distinguent meme, a l'interieur du champ religieux, des innovations \"louables\" (bid'a hasana) de pratiques manifestement contraires aux textes, une distinction elle-même debattue.",
    relatedSlugs: ["sunnah"],
  },
  {
    term: "Wudu",
    termArabic: "الوضوء",
    slug: "wudu",
    definition: "Les petites ablutions rituelles preparant à la prière.",
    origin: "Racine arabe w-d-a, évoquant la proprete et l'eclat.",
    explanation:
      "Le wudu est l'ablution rituelle requise avant la prière, decrite dans le Coran (sourate Al-Ma'ida, 5:6) : lavage du visage, des mains et avant-bras jusqu'aux coudes, essuyage de la tete et lavage des pieds jusqu'aux chevilles, accompli dans cet ordre et precede de l'intention (niyya). Il constitue une condition de validite de la prière et de plusieurs autres actes d'adoration, comme le contact avec le texte coranique selon la position juridique majoritaire.\n\nCertains actes du quotidien (sommeil profond, contact physique, emission de gaz...) sont discutes quant a leur capacité a l'invalider, les positions variant sensiblement d'une école juridique a l'autre, comme le detaille le comparateur de fiqh de cette plateforme.",
    relatedSlugs: ["salah"],
  },
  {
    term: "Halal",
    termArabic: "الحلال",
    slug: "halal",
    definition: "Ce qui est licite ou permis selon le droit islamique.",
    origin: "Racine arabe h-l-l, évoquant ce qui est denoue ou autorise.",
    explanation:
      "Le halal désigne tout acte, aliment ou pratique autorise par le droit islamique, par opposition au haram (interdit). Le terme est le plus souvent associé a l'alimentation - notamment l'abattage rituel de la viande - mais s'appliqué en réalité beaucoup plus largement, a l'ensemble des actes de la vie quotidienne, financiere, sociale et professionnelle.\n\nEn droit islamique classique, le halal recouvre en réalité plusieurs categories distinctes selon le degré de recommandation : l'obligatoire (fard), le recommande (mustahabb) et le simplement permis sans consequence particuliere (mubah), toutes regroupees sous le terme general de licite par opposition a l'interdit.",
    relatedSlugs: ["haram"],
  },
  {
    term: "Haram",
    termArabic: "الحرام",
    slug: "haram",
    definition: "Ce qui est illicite ou formellement interdit selon le droit islamique.",
    origin: "Racine arabe h-r-m, évoquant l'interdiction et le caractere sacré.",
    explanation:
      "Le haram désigne un acte formellement interdit par les textes scripturaires sur la base d'une preuve univoque, dont l'accomplissement constitue une faute et, selon les cas, une transgression majeure (kabira) ou mineure (saghira). Il s'opposé au halal (licite) dans la classification quintuple des actions en droit islamique (al-ahkam al-khamsa), qui comprend également des categories intermediaires : obligatoire (fard), recommande (mustahabb), deteste (makruh) et permis neutre (mubah).\n\nCertains interdits (le meurtre, l'usure, l'adultere...) sont consideres unanimement etablis par l'ensemble des écoles, tandis que d'autres questions plus fines font l'objet de divergences juridiques licites (ikhtilaf) selon les sources et méthodes retenues par chaque école.",
    relatedSlugs: ["halal"],
  },
  {
    term: "Qadar",
    termArabic: "القدر",
    slug: "qadar",
    definition: "Le décret et la prédestination divine.",
    origin: "Racine arabe q-d-r, évoquant la mesure et la determination.",
    explanation:
      "Le qadar renvoie a la croyance selon laquelle Dieu connait et a décrété de toute éternité tout ce qui adviendra - un des six articles de la foi enonces dans le hadith de Jibril - tout en laissant a l'être humain une responsabilité reelle sur ses actes, celui-ci disposant d'une capacité de choix (ikhtiyar) dont il repondra le Jour du Jugement. Cette articulation entre décret divin universel et responsabilité individuelle est presentee par la tradition sunnite comme une tension a preserver plutôt qu'a resoudre unilateralement dans un sens ou dans l'autre.\n\nL'articulation entre décret divin et libre arbitre humain a fait l'objet de debats théologiques historiques majeurs, notamment avec le mu'tazilisme qui insistait sur la liberte humaine par souci de justice divine, et avec certains courants deterministes (jabrites) a l'oppose ; la position sunnite classique se situe entre ces deux extremes.",
    relatedSlugs: ["iman"],
  },
  {
    term: "Tawakkul",
    termArabic: "التوكل",
    slug: "tawakkul",
    definition: "L'abandon confiant en Dieu après avoir pris les moyens nécessaires.",
    origin: "Racine arabe w-k-l, évoquant le fait de confier une affaire a quelqu'un.",
    explanation:
      "Le tawakkul désigne la confiance placee en Dieu quant a l'issue des affaires, tout en accomplissant les efforts et moyens raisonnables a sa disposition - il ne s'agit donc pas d'un fatalisme passif mais d'une combinaison entre effort humain et remise de confiance envers le résultat final, qui appartient a Dieu seul. Il est souvent illustré par le hadith, rapporte par At-Tirmidhi, invitant a \"attacher sa chamelle, puis s'en remettre a Dieu\", en reponse a un compagnon qui demandait s'il devait laisser sa monture libre en professant sa confiance en Dieu.\n\nLe Coran (sourate At-Talaq, 65:3) associé le tawakkul a une promesse de suffisance divine (\"quiconque place sa confiance en Dieu, Il lui suffit\"), en faisant l'une des vertus les plus centrales de la vie spirituelle du croyant.",
    relatedSlugs: ["qadar"],
  },
  {
    term: "Sabr",
    termArabic: "الصبر",
    slug: "sabr",
    definition: "La patience et l'endurance face aux épreuves.",
    origin: "Racine arabe s-b-r, évoquant le fait de se retenir et d'endurer.",
    explanation:
      "Le sabr désigne la capacité a perseverer avec constance face aux difficultés, aux tentations ou dans l'accomplissement des obligations religieuses. Les commentateurs distinguent traditionnellement trois formes de sabr : la patience dans l'obéissance a Dieu, la patience face aux interdits (résister a la tentation) et la patience face aux épreuves et malheurs de la vie.\n\nLe Coran le présente a de nombreuses reprises comme une vertu recompensee sans limite (sourate Az-Zumar, 39:10), et l'associé frequemment a la prière comme deux ressources complementaires face aux difficultés (sourate Al-Baqara, 2:153).",
    relatedSlugs: ["tawakkul"],
  },
  {
    term: "Kufr",
    termArabic: "الكفر",
    slug: "kufr",
    definition: "Le rejet ou l'occultation de la foi en Dieu.",
    origin: "Racine arabe k-f-r, évoquant à l'origine le fait de couvrir ou dissimuler.",
    explanation:
      "Le kufr désigne le rejet de la foi islamique, que ce soit par négation explicite ou par occultation volontaire d'une vérité pourtant reconnue - le sens etymologique originel de \"couvrir\" evoquant precisement l'idee de dissimuler une vérité perceptible plutôt que de simplement l'ignorer. Le terme est l'opposé conceptuel de l'iman, et designe aussi bien le rejet global de la foi islamique que, dans un sens juridique plus technique, certains actes ou paroles graves consideres comme incompatibles avec la foi.\n\nSa qualification précise dans des cas individuels est traditionnellement traitee avec une grande prudence méthodologique par les savants, qui distinguent generalement l'acte de kufr objectif du jugement porte sur la personne elle-même (takfir), reserve avec beaucoup de circonspection en raison de ses consequences graves.",
    relatedSlugs: ["iman", "shirk"],
  },
  {
    term: "Umma",
    termArabic: "الأمة",
    slug: "umma",
    definition: "La communauté des croyants musulmans, au-dela des frontieres et des origines.",
    origin: "Racine arabe a-m-m, évoquant un groupe ou une nation.",
    explanation:
      "L'umma désigne la communauté globale des musulmans, concue comme une entite unie par la foi plutôt que par l'origine ethnique, linguistique ou nationale - un principe explicitement affirme dans le celèbre sermon d'adieu du Prophète ﷺ, qui rappelle l'egalite de tous les croyants independamment de leur origine. Le concept trouvé ses fondements dans le Coran et dans la \"Constitution de Médine\", document etabli par le Prophète ﷺ peu après l'Hegire pour organiser les relations entre les différentes composantes de la société médinoise.\n\nLe terme umma est parfois employe dans un sens plus large englobant l'ensemble de l'humanité en tant que destinataire potentiel du message islamique (umma da'wa), a distinguer du sens plus restreint designant specifiquement la communauté des croyants (umma ijaba).",
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
      "Le tawhid ar-rububiyya est le premier des trois volets classiquement distingues dans l'étude du tawhid : il affirme que Dieu seul créé, possède, gouverne et pourvoit à l'univers, sans associé dans ces fonctions.\n\nLes théologiens soulignent que ce volet du tawhid etait déjà largement reconnu par les polytheistes contemporains du Prophète ﷺ, comme le rappelle le Coran (sourate Al-Ankabut, 29:61) : reconnaitre Dieu comme créateur ne suffit donc pas a lui seul, d'où la nécessite des deux autres volets, l'uluhiyya et les asma wa sifat.",
    relatedSlugs: ["tawhid", "uluhiyya", "asma-wa-sifat"],
  },
  {
    term: "Uluhiyya (Unicité de l'adoration)",
    termArabic: "الألوهية",
    slug: "uluhiyya",
    definition: "L'unicité de Dieu dans le droit exclusif a être adore.",
    origin: "Racine arabe a-l-h, dont dérivé le nom Allah.",
    explanation:
      "Le tawhid al-uluhiyya, second volet du tawhid, affirme que Dieu seul a le droit d'être adore, à l'exclusion de toute autre entite - qu'il s'agisse de prières, de sacrifices, de vœux ou de tout autre acte d'adoration.\n\nCe volet est présente par les théologiens comme le cœur du message de tous les prophètes, chacun ayant appele son peuple a n'adorer que Dieu seul (sourate An-Nahl, 16:36).",
    relatedSlugs: ["tawhid", "rububiyya", "shirk"],
  },
  {
    term: "Al-Asma wa-s-Sifat (Noms et attributs divins)",
    termArabic: "الأسماء والصفات",
    slug: "asma-wa-sifat",
    definition: "L'unicité de Dieu dans Ses noms et attributs, tels qu'Il Se les attribué Lui-même.",
    origin: "Composition arabe de asma (noms) et sifat (attributs).",
    explanation:
      "Ce troisième volet du tawhid consiste a affirmer les noms et attributs que Dieu S'attribué Lui-même dans le Coran et que le Prophète ﷺ Lui attribué, sans les nier, sans les denaturer, sans en demander la modalite précise, et sans les comparer à la création.\n\nLa manière précise d'aborder ces textes - affirmation directe sans interprétation (approche atharite) ou interprétation allegorique de certains termes ambigus (approche ash'arite/maturidite) - constitue l'un des points de divergence historiques majeurs de la théologie islamique classique, presentes de manière descriptive dans la section Écoles de cette plateforme.",
    relatedSlugs: ["tawhid", "rububiyya", "uluhiyya"],
  },
  {
    term: "Nubuwwa (Prophétie)",
    termArabic: "النبوة",
    slug: "nubuwwa",
    definition: "L'institution divine de la prophétie, par laquelle Dieu communique Son message à l'humanité.",
    origin: "Racine arabe n-b-a, évoquant l'annonce d'une information importante.",
    explanation:
      "La nubuwwa désigne la mission confiee par Dieu a des individus choisis - les prophètes (anbiya) et messagers (rusul) - pour transmettre Son message à l'humanité. La croyance en la prophétie de Muhammad ﷺ, dernier maillon de cette chaîne, est l'un des deux temoignages de la shahada.\n\nLa distinction entre nabi (prophète recevant une révélation sans mission de la transmettre à un nouveau peuple) et rasul (messager charge d'un message, et souvent d'une loi nouvelle) est une distinction classique, tous les rusul etant consideres comme des anbiya, mais non l'inverse.",
    relatedSlugs: ["wahy", "iman"],
  },
  {
    term: "Wahy (Révélation)",
    termArabic: "الوحي",
    slug: "wahy",
    definition: "La révélation divine transmise aux prophètes.",
    origin: "Racine arabe w-h-y, évoquant une communication rapide et discrete.",
    explanation:
      "Le wahy désigne le processus par lequel Dieu communique Son message aux prophètes, que ce soit directement, par inspiration, ou par l'intermédiaire d'un ange (généralement identifié a Jibril). Le Coran est considère comme le wahy transmis intégralement et littéralement au Prophète ﷺ.\n\nLa tradition islamique distingue le wahy matlu (récite, c'est-a-dire le texte coranique lui-même) du wahy ghayr matlu (non récite, dont le sens général aurait été inspiré mais formule par le Prophète ﷺ, comme les hadiths) - une distinction qui a des implications sur le statut juridique et rituel de chacun.",
    relatedSlugs: ["nubuwwa", "sunnah"],
  },
  {
    term: "Al-Akhira (L'au-dela)",
    termArabic: "الآخرة",
    slug: "akhira",
    definition: "La vie future, après la résurrection et le Jugement dernier.",
    origin: "Terme arabe signifiant littéralement \"la dernière\", par opposition a ad-dunya (la vie présente).",
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
      "La jannah désigne, dans la croyance islamique, le lieu de félicité éternelle accorde par la grâce de Dieu a ceux qu'Il agree, decrit dans le Coran par de nombreuses images (jardins, rivieres, compagnie des justes) comprises par la majorité des exégètes comme des réalités véritables, dont la nature exacte demeure connue de Dieu seul.",
    relatedSlugs: ["akhira", "jahannam"],
  },
  {
    term: "Jahannam (L'Enfer)",
    termArabic: "جهنم",
    slug: "jahannam",
    definition: "Le séjour de châtiment promis dans l'au-dela a ceux que Dieu y destine.",
    origin: "Terme arabe d'origine semitique ancienne, désignant un abime profond.",
    explanation:
      "Jahannam désigne le lieu de châtiment dans l'au-dela, decrit dans le Coran comme la consequence du rejet obstine de la foi ou de fautes graves non pardonnees. La tradition islamique insiste sur le fait que la misericorde de Dieu y demeure première, et que le statut final de chaque individu Lui appartient seul.",
    relatedSlugs: ["akhira", "jannah"],
  },
  {
    term: "Malaika (Les Anges)",
    termArabic: "الملائكة",
    slug: "malaika",
    definition: "Des créatures spirituelles créées par Dieu pour L'adorer et executer Ses ordres.",
    origin: "Terme arabe dérivé de la racine l-a-k, évoquant le message et la mission.",
    explanation:
      "La croyance aux anges, second article de la foi, reconnaît l'existence d'entites créées à partir de lumiere, depourvues de libre arbitre au sens humain et vouees à une obéissance totale à Dieu. Certains anges sont nommés dans le Coran et charges de missions spécifiques, comme Jibril (la révélation), Mika'il ou Israfil.\n\nLes anges sont distingues à la fois des jinns (créés de feu, dotes de libre arbitre) et des demons, avec lesquels ils ne doivent pas être confondus.",
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
    definition: "La figure du diable, incitant les êtrès humains et les jinns à la désobéissance envers Dieu.",
    origin: "Racine arabe sh-t-n, évoquant l'éloignement et la rebellion.",
    explanation:
      "Iblis, identifié par le Coran comme un jinn, refusa par orgueil de se prosterner devant Adam sur ordre de Dieu et devint ainsi Shaytan, symbole et instigateur de la désobéissance. Le terme shaytan désigne par extension toute force ou tentation poussant vers le mal, chez les jinns comme chez les humains.\n\nLe Coran précise que le pouvoir du Shaytan sur l'être humain se limite à la suggestion (waswasa) : il ne peut contraindre personne, la responsabilité finale des actes revenant a chaque individu.",
    relatedSlugs: ["jinn", "shirk"],
  },
  // --- Akhlaq : éthique et caractere ---
  {
    term: "Ikhlas (Sincérité)",
    termArabic: "الإخلاص",
    slug: "ikhlas",
    definition: "La sincérité de l'intention, consistant a accomplir un acte pour Dieu seul.",
    origin: "Racine arabe kh-l-s, évoquant la pureté et l'exemption de tout melange.",
    explanation:
      "L'ikhlas désigne le fait de purifier son intention (niyyah) dans l'adoration et les bonnes actions, en les accomplissant uniquement pour rechercher l'agrement de Dieu, sans rechercher la reconnaissance ou l'admiration d'autrui. Un hadith célèbre rapporte que \"les actes ne valent que par les intentions\" (Al-Bukhari, Muslim).\n\nL'ikhlas est traditionnellement présente comme la condition d'acceptation de toute adoration, quelle que soit sa forme extérieure, et s'opposé directement à la riya.",
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
      "Le tawadu' désigne une disposition de modestie et d'humilite, tant dans la relation au Créateur (reconnaitre sa dépendance totale envers Dieu) que dans les relations sociales (ne pas se considerer supérieur aux autres). Il est présente dans plusieurs hadiths comme une vertu elevant en réalité le statut de celui qui la pratique, à l'inverse du kibr (orgueil).",
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
      "Le hilm désigne la capacité a rester calme, mesure et indulgent face à une provocation, une injustice ou une colère justifiee, plutôt que de reagir avec precipitation. Cette vertu est particulièrement associée dans la Sira à l'attitude du Prophète ﷺ envers ceux qui l'ont maltraite, comme lors de l'épisode de Ta'if.",
    relatedSlugs: ["sabr", "adl"],
  },
  {
    term: "Adl (Justice)",
    termArabic: "العدل",
    slug: "adl",
    definition: "La justice et l'équité, valeur centrale de l'éthique islamique.",
    origin: "Racine arabe a-d-l, évoquant l'équilibre et la droiture.",
    explanation:
      "L'adl désigne l'obligation de rendre justice et d'agir avec équité, y compris envers ceux que l'on n'apprecie pas. Le Coran (sourate An-Nisa, 4:135 ; Al-Ma'ida, 5:8) insiste explicitement sur le fait que l'inimitie envers autrui ne doit jamais conduire à l'injustice.",
    relatedSlugs: ["zulm", "hilm"],
  },
  {
    term: "Rahma (Misericorde)",
    termArabic: "الرحمة",
    slug: "rahma",
    definition: "La misericorde, attribut divin premier et vertu recommandee entre les croyants.",
    origin: "Racine arabe r-h-m, partagee avec le mot \"matrice\" (rahim), évoquant la tendresse.",
    explanation:
      "La rahma est l'attribut divin le plus frequemment cité dans le Coran, chaque sourate (sauf une) s'ouvrant par la formule \"Au nom de Dieu, le Tout Miséricordieux, le Très Miséricordieux\". Elle désigne aussi la vertu de compassion recommandee au croyant envers les autres créatures, le Prophète ﷺ etant lui-même decrit comme \"une misericorde pour l'univers\" (sourate Al-Anbiya, 21:107).",
    relatedSlugs: ["ihsan", "adl"],
  },
  {
    term: "Amanah (Le depot de confiance)",
    termArabic: "الأمانة",
    slug: "amanah",
    definition: "La fidélité aux engagements et aux responsabilites qui nous sont confiees.",
    origin: "Racine arabe a-m-n, la même que celle du mot iman.",
    explanation:
      "L'amanah désigne la fidélité envers tout ce qui est confie à une personne - biens, secrets, responsabilites publiques ou privees. Le Coran (sourate Al-Ahzab, 33:72) présente même la responsabilité religieuse elle-même comme un \"depot de confiance\" proposé aux cieux, à la terre et aux montagnes, qui l'ont refusee, et que l'être humain a accepte de porter.",
    relatedSlugs: ["sidq", "adl"],
  },
  {
    term: "Sidq (Véracité)",
    termArabic: "الصدق",
    slug: "sidq",
    definition: "La véracité et l'honnêteté dans la parole et les actes.",
    origin: "Racine arabe s-d-q, dont dérivé également le mot sadaqa (aumone).",
    explanation:
      "Le sidq désigne la conformite entre ce que l'on dit, ce que l'on pense et ce que l'on fait. Il est présente dans le Coran comme étroitement lie à la foi (sourate At-Tawba, 9:119), et le Prophète ﷺ etait connu, avant même sa mission prophétique, sous le surnom d'\"Al-Amin\" (le digne de confiance) en raison de sa véracité reconnue par tous.",
    relatedSlugs: ["amanah", "ikhlas"],
  },
  {
    term: "Haya' (Pudeur)",
    termArabic: "الحياء",
    slug: "hayaa",
    definition: "La pudeur et la retenue morale face à ce qui est inconvenant.",
    origin: "Racine arabe h-y-y, partagee avec le mot \"vie\", évoquant la sensibilité morale.",
    explanation:
      "Le haya' désigne un sentiment de retenue qui detourne des comportements inconvenants ou immoraux, tant dans l'apparence que dans le comportement. Un hadith rapporte que \"le haya' fait partie de la foi\" (Al-Bukhari, Muslim), le présentant comme une vertu structurante plutôt que comme une simple timidite.",
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
    origin: "Racine arabe z-l-m, évoquant l'obscurité et le deplacement hors du droit chemin.",
    explanation:
      "Le zulm désigne, dans son sens le plus large, le fait de placer une chose là où elle ne devrait pas être - envers Dieu (le shirk etant qualifié de \"zulm immense\", sourate Luqman, 31:13), envers soi-même, ou envers autrui. Il constitue l'opposé direct de l'adl (justice).",
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
      "Le nikah est un contrat encadre par le droit islamique, comprenant des conditions (consentement, témoins, dot) et des droits et devoirs reciproques entre les epoux, présente dans le Coran comme un signe divin favorisant la tranquillité et l'affection mutuelle (sourate Ar-Rum, 30:21). Les modalites précises de certaines de ses conditions varient selon les écoles juridiques.",
    relatedSlugs: ["fiqh"],
  },
  {
    term: "Riba (Usure)",
    termArabic: "الربا",
    slug: "riba",
    definition: "L'intérêt ou le surplus injustifié percu dans un prêt ou un échange, interdit en Islam.",
    origin: "Racine arabe r-b-w, évoquant l'augmentation et le surplus.",
    explanation:
      "Le riba désigne tout surplus injustifié exigé dans un prêt d'argent ou dans certains échanges de biens de même categorie, formellement interdit par le Coran (sourate Al-Baqara, 2:275-279). Cette interdiction est à l'origine du développement de la finance islamique contemporaine, qui cherche des structures contractuelles alternatives (partage de profits et pertes, vente a marge...).",
    relatedSlugs: ["fiqh", "halal", "haram"],
  },
  {
    term: "Ijtihad (Effort d'interprétation)",
    termArabic: "الاجتهاد",
    slug: "ijtihad",
    definition: "L'effort intellectuel fourni par un juriste qualifié pour déduire une règle a partir des sources.",
    origin: "Racine arabe j-h-d, évoquant l'effort soutenu.",
    explanation:
      "L'ijtihad désigne l'effort methodique fourni par un savant qualifié (mujtahid) pour déduire une règle juridique a partir du Coran, de la Sunna et des outils de l'usul al-fiqh, lorsque la question n'est pas explicitement tranchee par un texte univoque. Les grands imams fondateurs des écoles juridiques sont les exemples classiques de mujtahid absolu.",
    relatedSlugs: ["taqlid", "fiqh"],
  },
  {
    term: "Taqlid (Suivi d'une autorité juridique)",
    termArabic: "التقليد",
    slug: "taqlid",
    definition: "Le fait de suivre l'avis d'un savant ou d'une école juridique sans en examiner soi-même les preuves détaillées.",
    origin: "Racine arabe q-l-d, évoquant le fait de porter un collier, au sens figure de se referer à une autorité.",
    explanation:
      "Le taqlid désigne le fait, pour un non-specialiste, de suivre les conclusions juridiques d'un savant ou d'une école reconnue plutôt que de déduire lui-même une règle a partir des textes. La question de sa portée - notamment l'obligation ou non de suivre une seule école en toute chose - a fait l'objet de discussions méthodologiques classiques parmi les juristes.",
    relatedSlugs: ["ijtihad", "fiqh"],
  },
  {
    term: "Ijma' (Consensus)",
    termArabic: "الإجماع",
    slug: "ijma",
    definition: "Le consensus des savants qualifiés d'une époque sur une question de droit.",
    origin: "Racine arabe j-m-a, évoquant le rassemblement et l'accord.",
    explanation:
      "L'ijma' désigne l'accord unanime des juristes qualifiés d'une generation sur une règle donnée, reconnu par la majorité des écoles sunnites comme la troisième source du droit islamique après le Coran et la Sunna. Sa portée pratique reste toutefois discutee, tant sur les modalites de son établissement que sur son perimetre exact.",
    relatedSlugs: ["qiyas", "fiqh"],
  },
  {
    term: "Qiyas (Raisonnement analogique)",
    termArabic: "القياس",
    slug: "qiyas",
    definition: "Le raisonnement par analogie, etendant une règle connue à un cas nouveau partageant sa cause.",
    origin: "Racine arabe q-y-s, évoquant la mesure et la comparaison.",
    explanation:
      "Le qiyas consiste a étendre une règle établie par un texte à un cas non explicitement traité, sur la base d'une cause commune ('illa) identifiée entre les deux situations. Quatrième source classique du droit islamique, son usage et ses limites varient sensiblement d'une école à l'autre, les hanafites en faisant un usage plus systématique que les hanbalites, par exemple.",
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
      "L'isnad est la liste des rapporteurs successifs par lesquels un hadith a été transmis. Son examen minutieux - continuite, fiabilite et mémoire de chaque rapporteur - constitue le cœur de la méthodologie d'authentification des hadiths (mustalah al-hadith), une spécificité méthodologique de la tradition islamique.",
    relatedSlugs: ["sunnah"],
  },
  {
    term: "Naskh (Abrogation)",
    termArabic: "النسخ",
    slug: "naskh",
    definition: "Le remplacement de la portée pratique d'un verset par un autre verset révèle ulterieurement.",
    origin: "Racine arabe n-s-kh, évoquant la copie et le remplacement.",
    explanation:
      "Le naskh désigne les cas, discutes par les exégètes classiques, ou un verset coranique voit sa portée législative modifiee par un verset révèle plus tardivement sur le même sujet. Cette discipline est traitee avec une grande prudence méthodologique, les commentateurs distinguant les cas d'abrogation averee des cas de simple specification ou de complementarite entre versets.",
    relatedSlugs: ["wahy"],
  },
  {
    term: "Asbab al-Nuzul (Circonstances de la révélation)",
    termArabic: "أسباب النزول",
    slug: "asbab-al-nuzul",
    definition: "Les circonstances historiques ayant entouré la révélation d'un verset ou d'un passage coranique.",
    origin: "Composition arabe de asbab (causes) et nuzul (descente, révélation).",
    explanation:
      "L'étude des asbab al-nuzul visé a identifier le contexte precis - une question posee au Prophète ﷺ, un événement particulier - dans lequel un verset a été révèle, afin de mieux en saisir la portée et d'éviter une lecture isolee de son contexte historique.",
    relatedSlugs: ["naskh", "wahy"],
  },
  // --- Adoration et spiritualite ---
  {
    term: "Dhikr (Rappel de Dieu)",
    termArabic: "الذكر",
    slug: "dhikr",
    definition: "Le rappel et l'evocation de Dieu, par la parole ou par le cœur.",
    origin: "Racine arabe dh-k-r, évoquant la mémoire et la mention.",
    explanation:
      "Le dhikr désigne toute forme d'evocation de Dieu - formules de glorification, lecture du Coran, ou simple présence du cœur - recommandee frequemment dans le Coran comme une source d'apaisement (sourate Ar-Ra'd, 13:28).",
    relatedSlugs: ["dua", "taqwa"],
  },
  {
    term: "Du'a (Invocation)",
    termArabic: "الدعاء",
    slug: "dua",
    definition: "L'invocation et la supplication adressee à Dieu.",
    origin: "Racine arabe d-a-w, évoquant l'appel.",
    explanation:
      "Le du'a désigne l'acte de s'adresser directement à Dieu pour Lui demander Son aide, Son pardon ou Sa guidance, considère dans un hadith rapporte par At-Tirmidhi comme \"l'essence même de l'adoration\".",
    relatedSlugs: ["dhikr", "tawakkul"],
  },
  {
    term: "Tawba (Repentir)",
    termArabic: "التوبة",
    slug: "tawba",
    definition: "Le retour vers Dieu après une faute, par le regret sincère et la résolution de ne pas y revenir.",
    origin: "Racine arabe t-w-b, évoquant le retour.",
    explanation:
      "La tawba désigne le processus de repentir sincère, comprenant classiquement la reconnaissance de la faute, le regret, l'arret immédiat de l'acte fautif et la résolution de ne pas y revenir - accompagnee, si la faute concerne un tiers, de la reparation due. Le Coran présente Dieu comme infiniment accueillant envers quiconque se repent sincèrement (sourate Az-Zumar, 39:53).",
    relatedSlugs: ["istighfar"],
  },
  {
    term: "Istighfar (Demande de pardon)",
    termArabic: "الاستغفار",
    slug: "istighfar",
    definition: "La demande explicite du pardon divin.",
    origin: "Racine arabe gh-f-r, évoquant le fait de couvrir et de pardonner.",
    explanation:
      "L'istighfar désigne l'acte de demander pardon à Dieu, souvent associé à la tawba dont il constitue l'expression verbale. Le Prophète ﷺ, bien qu'infaillible dans sa mission, est rapporte comme demandant pardon à Dieu de nombreuses fois par jour, présentant ainsi l'istighfar comme une pratique constante plutôt que réservée aux seules fautes graves.",
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
      "La khilafa désigne l'institution de direction de la communauté établie après le décès du Prophète ﷺ, inauguree par les quatre califes dits \"bien-guidés\" (Abu Bakr, Omar, Uthman, Ali), puis poursuivie sous des formes dynastiques (omeyyade, abbasside...) jusqu'à son abolition formelle en 1924.",
    relatedSlugs: ["shura"],
  },
  {
    term: "Shura (Consultation)",
    termArabic: "الشورى",
    slug: "shura",
    definition: "Le principe de consultation mutuelle dans la prise de décision collective.",
    origin: "Racine arabe sh-w-r, évoquant le fait de consulter.",
    explanation:
      "La shura désigne le principe, mentionne dans le Coran (sourate Ash-Shura, 42:38 ; Al Imran, 3:159) recommandant au Prophète ﷺ lui-même de consulter ses Compagnons, appliqué historiquement à la designation des premiers califes et plus largement présente comme un principe de gouvernance et de prise de décision collective en Islam.",
    relatedSlugs: ["khilafa"],
  },
  {
    term: "Da'wa (Invitation à l'Islam)",
    termArabic: "الدعوة",
    slug: "dawa",
    definition: "L'invitation et la transmission pacifique du message islamique.",
    origin: "Racine arabe d-a-w, évoquant l'appel.",
    explanation:
      "La da'wa désigne l'acte de transmettre et d'expliquer le message islamique a autrui, par la parole, l'exemple ou l'ecrit. Le Coran (sourate An-Nahl, 16:125) en précise la méthode recommandee : \"par la sagesse et la belle exhortation\", en excluant toute contrainte (sourate Al-Baqara, 2:256).",
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
      "L'ikhtilaf désigne les divergences d'interprétation reconnues comme légitimes entre savants et écoles juridiques, résultant de méthodologies différentes d'analyse des textes plutôt que d'une opposition de principe. Il est traditionnellement distingué du désaccord sur les fondements de la foi, qui relève d'une autre catégorie. Le comparateur de fiqh de cette plateforme illustré concrètement cette pluralité légitime.",
    relatedSlugs: ["ijtihad", "qiyas"],
  },
  {
    term: "Istikhara (Prière de consultation)",
    termArabic: "الاستخارة",
    slug: "istikhara",
    definition: "La prière de consultation par laquelle le croyant demande à Dieu de le guider vers le meilleur choix.",
    origin: "Racine arabe kh-y-r, évoquant le choix du meilleur.",
    explanation:
      "L'istikhara est une prière de deux unités suivie d'une invocation spécifique, accomplie lorsqu'une personne hésite entre plusieurs choix licites et souhaité s'en remettre au jugement de Dieu plutôt qu'à sa seule raison. Elle ne produit pas nécessairement un signe surnaturel immédiat : elle visé avant tout à ancrer la décision dans la confiance en Dieu (tawakkul).",
    relatedSlugs: ["salah", "tawakkul"],
  },
  {
    term: "Khushu' (Humilité recueillie)",
    termArabic: "الخشوع",
    slug: "khushu",
    definition: "L'humilité et la concentration intérieure du cœur, en particulier durant la prière.",
    origin: "Racine arabe kh-sh-'.",
    explanation:
      "Le khushu' désigne un état de présence intérieure et de crainte révérencielle envers Dieu, mentionné dans le Coran comme une qualité des croyants qui réussissent (sourate Al-Mu'minun, 23:1-2). Il est particulièrement recherché durant la prière, où il s'opposé à une récitation mécanique dénuée de conscience du sens des paroles prononcées.",
    relatedSlugs: ["salah", "taqwa"],
  },
  {
    term: "Maslaha (Intérêt général)",
    termArabic: "المصلحة",
    slug: "maslaha",
    definition: "L'intérêt général ou le bien commun, pris en compte comme finalité du droit islamique.",
    origin: "Racine arabe s-l-h, évoquant ce qui est bénéfique.",
    explanation:
      "La maslaha désigne la prise en compte de l'intérêt général comme critère dans l'élaboration ou l'application du droit islamique, notamment lorsque les textes ne traitent pas explicitement une situation nouvelle. Son usage comme source complémentaire du droit varié selon les écoles juridiques, l'école malikite lui accordant traditionnellement une place plus explicite que d'autres.",
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
      "La wasatiyyah désigne un principe de modération et d'équilibre entre les excès, que ce soit dans la croyance, la pratique ou le comportement social. Le Coran qualifié la communauté musulmane de \"umma wasat\", une communauté du juste milieu, appelée à éviter aussi bien la négligence que l'excès rigoriste.",
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
