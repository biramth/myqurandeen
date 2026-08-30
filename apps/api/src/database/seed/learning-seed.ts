import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { learningLessons, learningPaths } from "../schema";

/**
 * Parcours d'apprentissage déterministes (aucune IA). Chaque leçon est un
 * véritable contenu pédagogique rédigé (plusieurs paragraphes), avec des
 * points clés à retenir et des références internes citées en contexte -
 * jamais un simple bouton de redirection vers une autre page.
 *
 * Les leçons mélangent volontairement piliers, croyance, vie du Prophète ﷺ,
 * éthique (akhlaq) et étude directe de sourates plutôt que de regrouper le
 * contenu par catégorie : l'objectif est un parcours de connaissance
 * religieuse intégrée, pas une simple série d'articles sur le Coran.
 */

interface ReferenceLink {
  label: string;
  url: string;
}

interface LessonSeed {
  order: number;
  title: string;
  content: string;
  keyTakeaways: string[];
  references: ReferenceLink[];
}

interface PathSeed {
  title: string;
  slug: string;
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  lessons: LessonSeed[];
}

const PATHS: PathSeed[] = [
  {
    title: "Introduction à l'Islam",
    slug: "introduction",
    level: "beginner",
    description: "Croyance, piliers, éthique prophétique et premières sourates - un parcours intégré, pas seulement une lecture du Coran.",
    lessons: [
      {
        order: 1,
        title: "Qu'est-ce que l'Islam ?",
        content:
          "Le mot \"Islam\" vient de la racine arabe s-l-m, qui exprime à la fois l'idée de soumission et celle de paix (salam). L'Islam se définit ainsi comme la soumission consciente et volontaire à Dieu, l'Unique créateur de l'univers, et par extension la paix intérieure qui découle de cette soumission.\n\nL'Islam se présente comme la continuation et l'aboutissement d'un même message monothéiste transmis à l'humanité par une longue chaîne de prophètes - d'Adam à Muhammad ﷺ, en passant par Nuh, Ibrahim, Musa et Isa. Ce message central est le tawhid : l'unicité absolue de Dieu, sans associé ni intermédiaire nécessaire entre le croyant et son Créateur.\n\nContrairement à une pratique cantonnée au rituel, l'Islam se conçoit traditionnellement comme un \"din\", un mode de vie complet englobant la croyance, le culte, l'éthique personnelle et les relations sociales. C'est cette vision intégrale qui explique la structure de ce parcours : croyance, pratique, étude directe du Coran et exemple prophétique s'y succèdent plutôt que d'être traités séparément.",
        keyTakeaways: [
          "\"Islam\" signifie soumission à Dieu et partage la racine du mot \"paix\" (salam).",
          "Le tawhid, l'unicité de Dieu, est le fondement de toute la pratique islamique.",
          "L'Islam se présente comme la continuité du message monothéiste des prophètes antérieurs.",
        ],
        references: [
          { label: "Concept : Tawhid", url: "/concepts/tawhid" },
          { label: "Section Prophètes", url: "/prophets" },
        ],
      },
      {
        order: 2,
        title: "La structure de la pratique : islam, iman, ihsan",
        content:
          "Un hadith rapporté par Al-Bukhari et Muslim, connu comme le \"hadith de Jibril\", organise la religion en trois niveaux complémentaires. Un homme - identifié plus tard comme l'ange Gabriel sous forme humaine - interroge le Prophète ﷺ successivement sur l'islam, l'iman et l'ihsan.\n\nL'islam y désigne la soumission pratique : l'attestation de foi, la prière, l'aumône, le jeûne et le pèlerinage - les actes extérieurs observables. L'iman désigne la croyance intérieure : les six articles de foi (Dieu, les anges, les livres, les messagers, le Jour dernier, le décret divin). L'ihsan, enfin, désigne le degré le plus élevé : \"adorer Dieu comme si tu Le voyais, et si tu ne Le vois pas, sache que Lui te voit\".\n\nCes trois niveaux ne sont pas des étapes que l'on quitte l'une après l'autre, mais des dimensions simultanées d'une même pratique : le geste sans la croyance serait vide de sens, la croyance sans le geste resterait abstraite, et l'ensemble sans la sincérité (ihsan) resterait mécanique.",
        keyTakeaways: [
          "Le hadith de Jibril structure la religion en trois niveaux : islam (pratique), iman (croyance), ihsan (excellence spirituelle).",
          "Ces trois dimensions sont complémentaires, non successives.",
          "L'ihsan est présenté comme le degré le plus élevé de la pratique religieuse.",
        ],
        references: [
          { label: "Concept : Iman", url: "/concepts/iman" },
          { label: "Concept : Ihsan", url: "/concepts/ihsan" },
        ],
      },
      {
        order: 3,
        title: "Introduction au Coran",
        content:
          "Le Coran est, pour les musulmans, la parole de Dieu révélée au Prophète ﷺ sur environ vingt-trois ans, transmise oralement puis mise par écrit et standardisée sous le califat d'Uthman. Il comprend 114 sourates de longueur très variable, classées dans le mushaf non par ordre chronologique mais globalement de la plus longue à la plus courte.\n\nChaque sourate est traditionnellement qualifiée de mecquoise ou médinoise selon la période de sa révélation, ce qui influence souvent ses thèmes : fondements de la foi et récits prophétiques pour les sourates mecquoises, législation et vie communautaire pour les médinoises. Le texte arabe fait l'objet d'une transmission particulièrement rigoureuse, récitée et mémorisée intégralement par des millions de personnes à travers le monde.\n\nSur cette plateforme, chaque verset est accompagné de son texte arabe, de plusieurs traductions attribuées à leurs auteurs, et de plusieurs tafsirs, permettant d'en étudier à la fois la lettre et l'interprétation. Les prochaines leçons de ce parcours reviendront régulièrement sur des sourates précises, plutôt que de traiter le Coran comme un thème unique et abstrait.",
        keyTakeaways: [
          "Le Coran comprend 114 sourates, classées globalement par longueur décroissante.",
          "Chaque sourate est qualifiée de mecquoise ou médinoise selon sa période de révélation.",
          "Le texte fait l'objet d'une transmission orale et écrite particulièrement rigoureuse.",
        ],
        references: [{ label: "Lire le Coran", url: "/quran" }],
      },
      {
        order: 4,
        title: "Étude de sourate : Al-Fatiha, l'ouverture",
        content:
          "Al-Fatiha (\"l'Ouverture\") est la première sourate du Coran, composée de sept versets. Sourate mecquoise, elle est unique par sa fonction : elle est récitée intégralement dans chacun des rak'at de la prière rituelle, ce qui en fait le passage coranique le plus répété quotidiennement par tout musulman pratiquant.\n\nLa sourate s'ouvre par la basmala (\"Au nom de Dieu, le Tout Miséricordieux, le Très Miséricordieux\"), puis loue Dieu comme \"Seigneur des mondes\", Miséricordieux et Maître du Jour du Jugement. Les versets suivants marquent le passage de la louange à la supplication : le croyant affirme n'adorer et ne demander secours qu'à Dieu seul, avant de formuler l'unique demande explicite de la sourate - être guidé sur le \"droit chemin\", celui des gens que Dieu a comblés de Ses bienfaits, et non celui de ceux qui ont encouru Sa colère ou se sont égarés.\n\nLes commentateurs classiques soulignent que cette sourate condense, en sept versets, l'ensemble de la relation entre le croyant et Dieu : reconnaissance de Sa seigneurie, de Sa miséricorde, de Son autorité sur le jugement final, engagement exclusif dans l'adoration, et demande de guidance - ce qui explique qu'elle soit parfois désignée comme \"la mère du Livre\" (Umm al-Kitab).",
        keyTakeaways: [
          "Al-Fatiha comprend sept versets et est récitée dans chaque rak'a de la prière.",
          "Elle passe de la louange de Dieu à une demande explicite de guidance sur le droit chemin.",
          "Elle est parfois appelée \"la mère du Livre\" pour sa fonction de synthese.",
        ],
        references: [
          { label: "Lire Al-Fatiha", url: "/quran/1" },
          { label: "Concept : Salah", url: "/concepts/salah" },
        ],
      },
      {
        order: 5,
        title: "La Shahada : l'attestation de foi",
        content:
          "La shahada (\"attestation\") est le premier des cinq piliers et la porte d'entrée dans l'Islam. Elle consiste à témoigner, avec conviction intérieure, qu'\"il n'y a de divinité [digne d'adoration] que Dieu, et que Muhammad est Son messager\" (la ilaha illa Allah, Muhammadun rasulu Allah).\n\nCette formule condense les deux piliers de la foi islamique : le tawhid (l'unicité exclusive de Dieu dans l'adoration) et la reconnaissance de la prophétie de Muhammad ﷺ, dernier maillon d'une chaîne prophétique. Prononcer sincèrement cette attestation, en présence de témoins si l'on se convertit, suffit théologiquement à faire entrer une personne dans l'Islam.\n\nLa shahada n'est cependant pas qu'une formule initiale : elle est répétée quotidiennement dans l'appel à la prière (adhan) et au sein même de la prière, rappelant en permanence au croyant le fondement de sa pratique.",
        keyTakeaways: [
          "La shahada comprend deux témoignages : l'unicité de Dieu et la prophétie de Muhammad ﷺ.",
          "Elle est à la fois la porte d'entrée dans l'Islam et une formule répétée quotidiennement.",
        ],
        references: [{ label: "Concept : Tawhid", url: "/concepts/tawhid" }],
      },
      {
        order: 6,
        title: "Akhlaq : la sincérité (sidq) à l'exemple du Prophète ﷺ",
        content:
          "Avant même le début de sa mission prophétique, Muhammad ﷺ était connu à La Mecque sous le surnom d'\"Al-Amin\" (le digne de confiance) tant sa véracité et son honnêteté étaient reconnues, y compris par ceux qui deviendront plus tard ses adversaires les plus féroces. Cette réputation n'était pas accidentelle : elle reflétait une exigence de sidq (véracité) que la tradition islamique présente comme une vertu fondamentale, non réservée aux grandes occasions mais pratiquée dans chaque parole et chaque engagement du quotidien.\n\nLe sidq va au-delà du simple fait de ne pas mentir : il implique une cohérence complète entre ce que l'on pense, ce que l'on dit et ce que l'on fait. Le Coran (sourate At-Tawba, 9:119) associe directement la véracité à la compagnie des gens sincères, et plusieurs hadiths rapportent que la véracité conduit à la piété, tandis que le mensonge conduit à la transgression.\n\nUn épisode célèbre illustre cette réputation : lors de la reconstruction de la Kaaba, les tribus de La Mecque, sur le point de s'affronter pour l'honneur de placer la Pierre Noire, choisirent d'un commun accord de s'en remettre au jugement du premier homme qui entrerait dans l'enceinte - et ce fut Muhammad, encore jeune homme, dont l'intégrité faisait déjà consensus bien avant la révélation.",
        keyTakeaways: [
          "Muhammad ﷺ était surnommé \"Al-Amin\" (le digne de confiance) dès avant sa mission prophétique.",
          "Le sidq (véracité) exige une cohérence entre pensée, parole et action, pas seulement l'absence de mensonge.",
          "L'épisode de la Pierre Noire illustre une réputation d'intégrité reconnue par tous, y compris ses futurs adversaires.",
        ],
        references: [{ label: "Concept : Sidq", url: "/concepts/sidq" }],
      },
      {
        order: 7,
        title: "La Salah : la prière quotidienne",
        content:
          "La salah est la prière rituelle, accomplie cinq fois par jour à des horaires déterminés par la position du soleil : l'aube (fajr), le milieu de journée (dhuhr), l'après-midi (asr), le coucher du soleil (maghrib) et la nuit (isha). Chaque prière comprend un nombre fixe de cycles (rak'at) associant positions corporelles précises - station debout, inclinaison, prosternation - et récitations coraniques.\n\nAu-delà de son aspect rituel, la salah est présentée dans le Coran comme un moyen de discipline spirituelle et de rappel constant de Dieu au fil de la journée. Sa validité est conditionnée par un état de pureté rituelle (obtenu par le wudu, les petites ablutions) et par l'orientation vers La Mecque (qibla).\n\nLes modalités précises de certains gestes - comme la position des mains ou le fait de lever les mains à certains moments - font partie des questions où les quatre écoles juridiques présentent des positions différentes, documentées dans le comparateur de la plateforme.",
        keyTakeaways: [
          "La salah est priée cinq fois par jour à des horaires déterminés.",
          "Elle nécessite un état de pureté rituelle (wudu) et l'orientation vers La Mecque.",
          "Certains détails gestuels varient selon les écoles juridiques.",
        ],
        references: [
          { label: "Concept : Salah", url: "/concepts/salah" },
          { label: "Comparateur : position des mains en prière", url: "/fiqh/position-des-mains-priere" },
        ],
      },
      {
        order: 8,
        title: "Vie du Prophète ﷺ : la période mecquoise",
        content:
          "Muhammad ﷺ naît à La Mecque vers 570, orphelin de père avant sa naissance et de mère dès l'âge de six ans, élevé par son grand-père puis son oncle Abu Talib. Vers l'âge de quarante ans, il reçoit dans la grotte de Hira la première révélation coranique, marquant le début de sa mission prophétique.\n\nLa période mecquoise (610-622) est celle d'une prédication d'abord discrète, puis publique, centrée sur l'unicité de Dieu et l'avertissement du Jugement dernier. Elle se heurte à une opposition croissante des chefs de Quraych, qui y voient une remise en cause de leur ordre social et religieux, la Kaaba étant alors un centre polythéiste majeur.\n\nCette période est marquée par des persécutions, une émigration partielle vers l'Abyssinie chrétienne, et deux pertes personnelles majeures - son épouse Khadija et son oncle protecteur Abu Talib - qui fragilisent sa position et le conduisent, après l'échec d'une démarche auprès de la ville voisine de Ta'if, à chercher un nouvel accueil auprès des habitants de Yathrib.",
        keyTakeaways: [
          "La période mecquoise (610-622) est centrée sur le tawhid et le Jugement dernier.",
          "Elle est marquée par une opposition croissante et des persécutions.",
          "Elle se termine par la recherche d'un accueil à Yathrib, future Médine.",
        ],
        references: [{ label: "Histoire : Debut de la Révélation", url: "/history/event/debut-revelation" }],
      },
      {
        order: 9,
        title: "Étude de sourate : Al-Ikhlas, l'unicité pure",
        content:
          "Al-Ikhlas (\"le monothéisme pur\") est une courte sourate mecquoise de quatre versets, souvent citée comme une déclaration condensée du tawhid. Un hadith rapporté par Al-Bukhari indique qu'elle \"équivaut au tiers du Coran\" en raison de sa concentration exclusive sur l'unicité divine, thème central de l'ensemble de la révélation.\n\nLa sourate répond, selon la tradition exégétique, à une question posée au Prophète ﷺ sur la nature de Dieu. Elle affirme que Dieu est \"Un\" (Ahad), qu'Il est \"As-Samad\" (Celui dont tous dépendent sans qu'Il ne dépendent de personne), qu'Il n'a ni engendré ni été engendré, et que rien ne Lui est semblable ou comparable.\n\nPar sa brièveté et sa densité théologique, Al-Ikhlas est l'une des sourates les plus récitées dans la prière quotidienne et les plus mémorisées dès le plus jeune âge, servant souvent de première introduction des enfants au concept de tawhid déjà rencontré dans ce parcours.",
        keyTakeaways: [
          "Al-Ikhlas comprend quatre versets et condense le tawhid en une déclaration unique.",
          "Un hadith la décrit comme \"équivalente au tiers du Coran\" en raison de sa portée théologique.",
          "Elle nie toute filiation ou ressemblance entre Dieu et Sa création.",
        ],
        references: [
          { label: "Lire Al-Ikhlas", url: "/quran/112" },
          { label: "Concept : Tawhid", url: "/concepts/tawhid" },
        ],
      },
      {
        order: 10,
        title: "La Zakat : l'aumône purificatrice",
        content:
          "La zakat est une aumône obligatoire, due annuellement par tout musulman dont les biens dépassent un seuil minimal (nisab) pendant une année lunaire complète. Le taux le plus connu, applicable à l'épargne monétaire, est de 2,5 %, mais il varie selon la nature des biens (bétail, récoltes, commerce...).\n\nLe Coran (sourate At-Tawba, 9:60) précise huit catégories de bénéficiaires possibles : les pauvres, les nécessiteux, ceux qui administrent la collecte, ceux dont le cœur est à rallier, l'affranchissement d'esclaves, les endettés, la cause de Dieu et le voyageur dans le besoin. La zakat n'est donc pas une simple charité facultative mais un droit reconnu aux bénéficiaires sur une part déterminée de la richesse du croyant.\n\nLa racine z-k-w évoque à la fois la purification et la croissance : la zakat est conçue comme purifiant le reste des biens du donateur tout en favorisant, à l'échelle collective, une forme de redistribution sociale.",
        keyTakeaways: [
          "La zakat est due annuellement sur les biens dépassant un seuil minimal (nisab).",
          "Le Coran fixe huit catégories de bénéficiaires possibles.",
          "Son taux varie selon la nature des biens concernés.",
        ],
        references: [{ label: "Concept : Zakat", url: "/concepts/zakat" }],
      },
      {
        order: 11,
        title: "Akhlaq : la patience (sabr) face à l'épreuve",
        content:
          "Après la mort de son épouse Khadija et de son oncle protecteur Abu Talib, survenues la même année (appelée par la tradition \"l'année de la tristesse\"), le Prophète ﷺ se rendit à Ta'if, ville voisine de La Mecque, dans l'espoir d'y trouver un soutien pour sa prédication. Il y fut non seulement rejeté, mais insulté et lapidé par les habitants et les enfants de la ville, au point de rentrer blessé et épuisé.\n\nSelon la tradition, un ange lui proposa alors, sur ordre divin, d'écraser la ville entre les deux montagnes qui l'encadraient en punition de cet accueil. Le Prophète ﷺ refusa, exprimant l'espoir que, si ce peuple ne le suivait pas, sa descendance pourrait un jour adorer Dieu seul. Cet épisode est présenté dans la tradition comme l'un des plus hauts exemples de sabr (patience) et de pardon face à une épreuve personnelle sévère.\n\nLe sabr, en Islam, ne désigne pas une résignation passive mais un effort actif de constance : persévérer dans l'obéissance, s'abstenir du péché malgré la tentation, et endurer l'épreuve sans désespoir ni ressentiment durable. Le Coran promet à ceux qui l'incarnent une récompense \"sans limite\" (sourate Az-Zumar, 39:10).",
        keyTakeaways: [
          "L'épisode de Ta'if, survenu après l'année de la tristesse, illustre le sabr et le pardon du Prophète ﷺ.",
          "Il refusa la destruction de la ville, espérant que la descendance de ses habitants finirait par croire.",
          "Le sabr est un effort actif de constance, non une résignation passive.",
        ],
        references: [
          { label: "Concept : Sabr", url: "/concepts/sabr" },
          { label: "Histoire : Année de la tristesse", url: "/history/event/annee-de-la-tristesse" },
        ],
      },
      {
        order: 12,
        title: "Le Sawm : le jeûne du Ramadan",
        content:
          "Le sawm consiste à s'abstenir de nourriture, de boisson et de rapports intimes du lever au coucher du soleil. Il est obligatoire durant tout le mois de Ramadan, neuvième mois du calendrier lunaire islamique, période durant laquelle, selon la tradition, la première révélation coranique a été reçue par le Prophète ﷺ.\n\nLe Coran (sourate Al-Baqara, 2:183) présente le jeûne comme un moyen d'accéder à la piété (taqwa), c'est-à-dire à une conscience accrue de Dieu. Au-delà de la dimension purement physique, le Ramadan est traditionnellement associé à une intensification de la lecture du Coran, de la prière nocturne (tarawih) et de la générosité envers autrui.\n\nCertaines catégories de personnes (malades, voyageurs, femmes enceintes ou allaitantes, personnes âgées) bénéficient d'aménagements - report du jeûne ou compensation - dont les modalités précises sont également discutées entre écoles juridiques.",
        keyTakeaways: [
          "Le sawm est obligatoire durant le mois de Ramadan, du lever au coucher du soleil.",
          "Le Coran le présente comme un moyen d'accéder à la taqwa (conscience de Dieu).",
          "Des aménagements existent pour certaines catégories de personnes.",
        ],
        references: [{ label: "Concept : Taqwa", url: "/concepts/taqwa" }],
      },
      {
        order: 13,
        title: "Vie du Prophète ﷺ : l'Hégire et la période médinoise",
        content:
          "En 622, le Prophète ﷺ émigre de La Mecque à Yathrib, rebaptisée Médine, événement fondateur appelé Hégire (hijra) et point de départ du calendrier islamique. À Médine, il organise la première communauté musulmane structurée, y compris ses relations avec les tribus juives de la ville.\n\nLa période médinoise (622-632) voit plusieurs confrontations militaires avec les Mecquois - Badr, Uhud, le siège du Fossé - jusqu'au traité de trêve de Hudaybiyya en 628, puis à la conquête pacifique de La Mecque en 630, marquée par une large amnistie et la destruction des idoles de la Kaaba. Cette période voit aussi la révélation de la plupart des versets à portée législative et sociale.\n\nLe Prophète ﷺ meurt à Médine en 632, peu après son pèlerinage d'adieu, laissant une communauté déjà étendue à l'ensemble de la péninsule arabique et une chronologie détaillée, consultable événement par événement dans la section Histoire.",
        keyTakeaways: [
          "L'Hégire (622) marque le début du calendrier islamique.",
          "La période médinoise voit la structuration de la communauté et plusieurs confrontations majeures.",
          "Elle se termine par la conquête pacifique de La Mecque (630) et le décès du Prophète ﷺ (632).",
        ],
        references: [{ label: "Chronologie complete : Vie du Prophète ﷺ", url: "/history/vie-du-prophete" }],
      },
      {
        order: 14,
        title: "Étude de sourate : Al-Asr, le temps",
        content:
          "Al-Asr (\"le Temps\") est l'une des plus courtes sourates du Coran, composée de seulement trois versets, mais considérée par de nombreux savants comme un résumé complet du message islamique. L'imam ash-Shafi'i aurait déclaré que si les hommes ne méditaient que sur cette sourate, elle leur suffirait.\n\nDieu y jure par le temps (al-asr) que l'être humain est \"en perte\", à l'exception de ceux qui réunissent quatre éléments : la foi (iman), les bonnes actions (amal salih), le rappel mutuel de la vérité, et le rappel mutuel de la patience (sabr). Cette structure en quatre points est souvent présentée comme une feuille de route personnelle et collective : croire ne suffit pas sans agir, et agir individuellement ne suffit pas sans une dimension communautaire de rappel et de soutien mutuel.\n\nLa brièveté de la sourate contraste avec la densité de son contenu, ce qui en fait un texte fréquemment étudié par les débutants comme synthèse accessible de plusieurs notions déjà abordées dans ce parcours : l'iman, la pratique, et le sabr.",
        keyTakeaways: [
          "Al-Asr ne comprend que trois versets mais est considérée comme un résumé du message islamique.",
          "Elle identifie quatre conditions pour échapper à la \"perte\" : foi, bonnes actions, rappel de la vérité, rappel de la patience.",
          "Sa structure souligne que la foi individuelle doit s'accompagner d'une dimension communautaire.",
        ],
        references: [
          { label: "Lire Al-Asr", url: "/quran/103" },
          { label: "Concept : Sabr", url: "/concepts/sabr" },
        ],
      },
      {
        order: 15,
        title: "Le Hajj : le pèlerinage à La Mecque",
        content:
          "Le hajj est le grand pèlerinage annuel à La Mecque, obligatoire une fois dans la vie pour tout musulman qui en a la capacité physique et financière. Il se déroule durant les premiers jours du mois de Dhul-Hijja et comprend une série de rites accomplis sur des lieux précis : circumambulation autour de la Kaaba (tawaf), parcours entre les collines de Safa et Marwa, stationnement sur le mont Arafat, et lapidation symbolique à Mina.\n\nCes rites sont traditionnellement rattachés à l'histoire d'Ibrahim, de son épouse Hajar et de leur fils Isma'il, dont le Coran situe le séjour et l'épreuve à La Mecque. Le hajj est ainsi présenté comme la réactualisation d'un épisode fondateur du monothéisme abrahamique.\n\nLe pèlerinage se distingue de la 'umra, un pèlerinage mineur pouvant être effectué à tout moment de l'année, comprenant certains des mêmes rites mais sans les stations propres au hajj.",
        keyTakeaways: [
          "Le hajj est obligatoire une fois dans la vie, pour qui en a la capacité.",
          "Ses rites sont rattachés à l'histoire d'Ibrahim, Hajar et Isma'il.",
          "La 'umra est un pèlerinage mineur distinct, réalisable toute l'année.",
        ],
        references: [{ label: "Prophète : Ibrahim", url: "/prophets/ibrahim" }],
      },
      {
        order: 16,
        title: "Akhlaq : la miséricorde (rahma) envers toute la création",
        content:
          "La miséricorde (rahma) occupe une place centrale dans l'exemple prophétique, s'étendant bien au-delà des relations humaines. Plusieurs récits rapportent la tendresse du Prophète ﷺ envers les enfants - il interrompait parfois sa prière pour ne pas déranger un enfant agrippé à lui, et s'étonnait publiquement de voir un compagnon n'avoir jamais embrassé ses propres enfants.\n\nCette miséricorde s'étendait également aux animaux : plusieurs hadiths rapportent des mises en garde explicites contre la maltraitance animale, et un récit célèbre évoque le pardon accordé à une personne pour avoir donné à boire à un chien assoiffé, illustrant que la miséricorde envers toute créature est considérée comme un acte méritoire en soi.\n\nLe Coran (sourate Al-Anbiya, 21:107) résume cette dimension en décrivant la mission même du Prophète ﷺ comme \"une miséricorde pour l'univers\" (rahmatan lil-alamin) - non pour les seuls croyants, mais pour l'ensemble de la création. Cette universalité de la rahma en fait, dans la tradition islamique, un principe éthique transversal à toute interaction, humaine ou non.",
        keyTakeaways: [
          "La miséricorde prophétique s'étendait aux enfants, aux étrangers et aux animaux, pas seulement aux croyants.",
          "Plusieurs hadiths mettent explicitement en garde contre la maltraitance animale.",
          "Le Coran décrit la mission du Prophète ﷺ comme \"une miséricorde pour l'univers\" (21:107).",
        ],
        references: [{ label: "Concept : Rahma", url: "/concepts/rahma" }],
      },
      {
        order: 17,
        title: "Les six piliers de la foi (iman)",
        content:
          "Toujours d'après le hadith de Jibril, la foi (iman) repose sur six croyances : Dieu, Ses anges, Ses livres révélés, Ses messagers, le Jour dernier et le décret divin (qadar). Croire en Dieu implique Son unicité absolue ; croire aux anges reconnaît l'existence d'entités créées chargées de missions spécifiques (comme Jibril, porteur de la révélation) ; croire aux livres reconnaît plusieurs révélations antérieures (Tawrat, Zabur, Injil) dont le Coran est considéré comme l'aboutissement et la préservation finale.\n\nCroire aux messagers reconnaît une lignée prophétique commune, de Adam à Muhammad ﷺ ; croire au Jour dernier engage une responsabilité morale des actes dans une perspective post-mortem ; croire au qadar, enfin, reconnaît que Dieu connaît et a décrété de toute éternité ce qui adviendra, sans annuler pour autant la responsabilité réelle de l'être humain sur ses choix.\n\nL'articulation précise entre décret divin et libre arbitre humain a fait l'objet de débats théologiques historiques importants, notamment face au mu'tazilisme, développés plus en détail dans le parcours intermédiaire.",
        keyTakeaways: [
          "Les six piliers de la foi : Dieu, les anges, les livres, les messagers, le Jour dernier, le qadar.",
          "Le Coran est considéré comme l'aboutissement et la préservation finale des révélations antérieures.",
          "L'articulation entre décret divin et libre arbitre a fait l'objet de débats théologiques historiques.",
        ],
        references: [
          { label: "Concept : Qadar", url: "/concepts/qadar" },
          { label: "Concept : Iman", url: "/concepts/iman" },
        ],
      },
      {
        order: 18,
        title: "Introduction aux hadiths",
        content:
          "Un hadith rapporte une parole, un acte ou une approbation attribués au Prophète ﷺ. Chaque hadith comprend en principe une chaîne de transmetteurs (isnad) et un contenu (matn), les deux étant examinés par les spécialistes pour en évaluer la fiabilité.\n\nSix recueils sont traditionnellement considérés comme canoniques chez les sunnites (Kutub as-Sittah) : Sahih al-Bukhari et Sahih Muslim, unanimement reconnus comme les plus authentiques, ainsi que les Sunan d'Abu Dawud, At-Tirmidhi, An-Nasa'i et Ibn Majah, qui détaillent souvent le degré d'authenticité de chaque hadith individuellement.\n\nLes hadiths complètent le Coran en précisant, illustrant ou détaillant son application concrète - c'est notamment le cas pour les modalités précises de la prière ou les épisodes de sidq, de sabr et de rahma déjà rencontrés dans ce parcours. Ils constituent, avec le Coran, l'une des deux sources scripturaires majeures de l'Islam.",
        keyTakeaways: [
          "Un hadith comprend une chaîne de transmission (isnad) et un contenu (matn).",
          "Six recueils sont considérés comme canoniques chez les sunnites (Kutub as-Sittah).",
          "Les hadiths précisent et complètent l'application concrète du Coran.",
        ],
        references: [{ label: "Explorer les hadiths", url: "/hadith" }],
      },
    ],
  },
  {
    title: "Apprendre à prier et les invocations",
    slug: "pratique-de-la-priere",
    level: "beginner",
    description: "Un parcours pratique, pas seulement théorique : les étapes concrètes de la prière (wudu, gestes, récitations, horaires) et les invocations (dua) du quotidien.",
    lessons: [
      {
        order: 1,
        title: "Les conditions de validité de la prière",
        content:
          "Avant même de commencer une prière (salah), plusieurs conditions doivent être réunies pour qu'elle soit valide. La première est l'état de pureté rituelle (tahara), obtenu par les petites ablutions (wudu) ou, en cas d'impureté majeure, par la grande ablution (ghusl) ; à défaut d'eau ou en cas d'impossibilité de l'utiliser, l'ablution sèche (tayammum) peut remplacer l'une ou l'autre.\n\nLa deuxième condition est l'orientation vers La Mecque (qibla), plus précisément vers la Kaaba. La troisième est l'entrée du temps de la prière concernée : chacune des cinq prières quotidiennes a une plage horaire déterminée, en dehors de laquelle elle ne peut être accomplie normalement. La quatrième condition est de couvrir les parties du corps dont la dissimulation est requise (awra), qui diffèrent entre hommes et femmes. Enfin, l'intention (niyya) de prier cette prière précise doit être présente dans le cœur au moment de commencer, sans qu'elle ait besoin d'être formulée à voix haute.\n\nCes conditions réunies, la prière commence par la formule d'ouverture \"Allahu akbar\" (Dieu est le plus grand), appelée takbirat al-ihram, qui marque l'entrée dans un état où la plupart des actes et paroles ordinaires sont suspendus jusqu'à la fin de la prière.",
        keyTakeaways: [
          "Cinq conditions préalables : pureté rituelle, orientation vers la qibla, temps de prière entré, tenue couvrant l'awra, et intention.",
          "La pureté rituelle s'obtient par le wudu, le ghusl, ou à défaut le tayammum.",
          "La prière commence par le takbir d'ouverture (\"Allahu akbar\").",
        ],
        references: [
          { label: "Concept : Salah", url: "/concepts/salah" },
          { label: "Comparateur : surfaces valides pour le tayammum", url: "/fiqh/surfaces-valides-tayammum" },
        ],
      },
      {
        order: 2,
        title: "Les ablutions (wudu) : les étapes",
        content:
          "Le wudu (petites ablutions) est décrit dans le Coran (5:6) et détaillé par la pratique prophétique. Son ordre habituel est le suivant : formuler l'intention, laver les mains jusqu'aux poignets, se rincer la bouche, faire pénétrer l'eau dans le nez puis l'expulser, laver le visage du haut du front au menton et d'une oreille à l'autre, laver les avant-bras jusqu'aux coudes en commençant par le droit, passer les mains humides sur la tête puis sur les oreilles, et enfin laver les pieds jusqu'aux chevilles en commençant par le droit.\n\nCertains de ces gestes sont universellement reconnus comme obligatoires (fard) par l'ensemble des écoles - notamment laver le visage, les avant-bras et les pieds, et passer la main sur une partie de la tête - tandis que d'autres, comme le rinçage de la bouche et du nez, sont considérés obligatoires par certaines écoles et recommandés (sunna) par d'autres, comme le montre le comparateur de fiqh pour le ghusl sur un point similaire.\n\nLe wudu est annulé par plusieurs causes : les besoins naturels, l'émission de gaz, le sommeil profond, la perte de conscience, et - selon des modalités qui varient entre écoles - le contact physique avec une personne du sexe opposé. Un wudu valide n'a pas besoin d'être refait tant qu'aucune de ces causes ne survient, même entre deux prières.",
        keyTakeaways: [
          "Le wudu suit un ordre précis : mains, bouche, nez, visage, avant-bras, tête, oreilles, pieds.",
          "Le cœur du wudu (visage, avant-bras, pieds, passage sur la tête) est reconnu par toutes les écoles.",
          "Ce qui annule le wudu varie légèrement d'une école à l'autre, notamment sur le contact physique.",
        ],
        references: [
          { label: "Comparateur : ce qui annule le wudu", url: "/fiqh/annulation-des-ablutions" },
          { label: "Comparateur : éléments obligatoires du ghusl", url: "/fiqh/elements-obligatoires-ghusl" },
        ],
      },
      {
        order: 3,
        title: "Le déroulement d'une unité de prière (rak'a)",
        content:
          "Une prière se compose d'un nombre fixe d'unités appelées rak'at (singulier : rak'a), variable selon la prière concernée. Chaque rak'a suit une séquence de positions : la station debout (qiyam), durant laquelle on récite la Fatiha puis, généralement lors des deux premières rak'at, une autre sourate ou un passage coranique ; l'inclinaison (ruku'), le dos droit et les mains posées sur les genoux, accompagnée d'une glorification de Dieu ; le retour à la station debout ; puis deux prosternations (sujud) séparées par une brève position assise, durant lesquelles le front, le nez, les deux mains, les deux genoux et les orteils touchent le sol.\n\nCette séquence - station debout, inclinaison, prosternations - constitue le squelette commun à toutes les rak'at de toutes les prières, seul le nombre de rak'at et certains ajouts (comme le tashahhud) variant. La prosternation est considérée comme le moment où le fidèle est le plus proche de Dieu, et il est recommandé d'y multiplier les invocations personnelles.\n\nCertains gestes qui accompagnent cette séquence - comme le moment de lever les mains ou leur position durant la station debout - comptent parmi les points où les quatre écoles juridiques divergent, sans que cela affecte la validité de la prière quelle que soit la pratique suivie.",
        keyTakeaways: [
          "Chaque rak'a suit la séquence : station debout, inclinaison, deux prosternations.",
          "La Fatiha est récitée à chaque rak'a durant la station debout.",
          "La prosternation est considérée comme le moment de plus grande proximité avec Dieu.",
        ],
        references: [
          { label: "Comparateur : lever les mains durant la prière", url: "/fiqh/rafi-al-yadayn" },
          { label: "Comparateur : position des mains pendant la prière", url: "/fiqh/position-des-mains-priere" },
        ],
      },
      {
        order: 4,
        title: "Ce qu'on récite pendant la prière",
        content:
          "La sourate Al-Fatiha, l'ouverture du Coran, est récitée à chaque rak'a de chaque prière : sa récitation est considérée comme un pilier de la prière par la quasi-totalité des écoles juridiques, au point qu'une prière sans elle n'est généralement pas valide. Elle est suivie, lors des deux premières rak'at d'une prière, d'un passage coranique supplémentaire au choix, souvent une sourate courte parmi les dernières du Coran.\n\nDurant l'inclinaison et la prosternation, de brèves formules de glorification sont récitées (\"Subhana rabbiya al-'adhim\" - \"Gloire à mon Seigneur le Très Grand\" - à l'inclinaison, et \"Subhana rabbiya al-a'la\" - \"Gloire à mon Seigneur le Très Haut\" - à la prosternation), rappelées à voix basse quel que soit le volume de récitation de la Fatiha.\n\nDans les prières dites \"à voix haute\" (fajr, les deux premières rak'at du maghrib et de l'isha), l'imam récite la Fatiha et le passage additionnel de façon audible ; dans les prières \"à voix basse\" (dhuhr, asr), la récitation reste silencieuse même pour l'imam, à l'exception de la formule d'ouverture et de quelques mots ponctuels.",
        keyTakeaways: [
          "La Fatiha est récitée à chaque rak'a et considérée comme un pilier de la prière.",
          "Des formules de glorification spécifiques accompagnent l'inclinaison et la prosternation.",
          "Certaines prières se récitent à voix haute, d'autres à voix basse.",
        ],
        references: [
          { label: "Étude de sourate : Al-Fatiha, l'ouverture", url: "/learn/introduction/lessons/4" },
          { label: "Comparateur : la Basmala à voix haute", url: "/fiqh/basmala-a-voix-haute" },
        ],
      },
      {
        order: 5,
        title: "Le tashahhud et la conclusion de la prière",
        content:
          "Après les deux premières rak'at d'une prière qui en compte plus de deux, et à la fin de la dernière rak'a, le fidèle s'assoit pour réciter le tashahhud (attestation de foi), qui inclut des formules de salutation à Dieu, au Prophète ﷺ, puis l'attestation qu'il n'y a de divinité que Dieu et que Muhammad est Son messager. À la dernière rak'a, le tashahhud est généralement suivi d'une invocation de bénédiction sur le Prophète ﷺ (salawat) et de sa famille.\n\nLa prière se conclut par le taslim : tourner la tête vers la droite puis vers la gauche en prononçant à chaque fois \"As-salamu alaykum wa rahmatullah\" (\"Que la paix et la miséricorde de Dieu soient sur vous\"), formule adressée symboliquement aux anges et aux personnes présentes. Ce geste marque la fin formelle de la prière et la levée de l'état de sacralisation entré au moment du takbir d'ouverture.\n\nSi un oubli survient durant la prière - une omission ou un ajout involontaire - deux prosternations supplémentaires (sujud as-sahw) permettent de le compenser, à un moment qui varie selon la nature de l'oubli et l'école juridique suivie.",
        keyTakeaways: [
          "Le tashahhud est récité en position assise, après deux rak'at puis à la fin de la prière.",
          "La prière se conclut par le taslim, en tournant la tête à droite puis à gauche.",
          "Un oubli durant la prière se compense par la prosternation de l'oubli (sujud as-sahw).",
        ],
        references: [
          { label: "Comparateur : sujud as-sahw, avant ou après le salam", url: "/fiqh/sujud-as-sahw" },
        ],
      },
      {
        order: 6,
        title: "Les cinq prières quotidiennes et leurs horaires",
        content:
          "Les cinq prières obligatoires rythment la journée selon la position du soleil. Fajr se prie entre l'apparition de l'aube et le lever du soleil. Dhuhr commence peu après que le soleil a passé son zénith. Asr suit, dans l'après-midi, avant que la lumière ne commence à décliner nettement. Maghrib débute juste après le coucher du soleil, pour une plage relativement courte. Isha, enfin, se prie après la disparition complète de la lumière du crépuscule, jusqu'à l'approche de l'aube suivante.\n\nChaque prière comporte un nombre fixe de rak'at obligatoires : deux pour fajr, quatre pour dhuhr et asr, trois pour maghrib, quatre pour isha - un nombre réduit lors d'un voyage pour les prières de quatre rak'at, une concession (rukhsa) prévue par le Coran. Les horaires précis varient chaque jour et selon la localisation géographique ; les plateformes et applications de prière calculent ces horaires à partir de la position astronomique du soleil pour chaque lieu.\n\nLa prière du vendredi (jumu'a) remplace exceptionnellement la prière de dhuhr ce jour-là pour les hommes, lorsqu'elle est accomplie collectivement dans les conditions requises, qui varient selon les écoles quant au nombre minimal de participants.",
        keyTakeaways: [
          "Les cinq prières sont réparties sur la journée selon la position du soleil : fajr, dhuhr, asr, maghrib, isha.",
          "Chaque prière a un nombre fixe de rak'at, réduit en voyage pour les prières de quatre rak'at.",
          "La prière du vendredi (jumu'a) remplace le dhuhr ce jour-là, dans des conditions qui varient selon les écoles.",
        ],
        references: [
          { label: "Comparateur : quorum de la prière du vendredi", url: "/fiqh/quorum-priere-vendredi" },
          { label: "Comparateur : qunut dans la prière de l'aube", url: "/fiqh/qunut-fajr" },
        ],
      },
      {
        order: 7,
        title: "Les invocations (dua) après la prière",
        content:
          "Après le taslim qui conclut la prière, il est recommandé de prolonger ce moment par des invocations et des formules de rappel de Dieu (dhikr). Parmi les plus rapportées figurent la demande de pardon (\"Astaghfirullah\", trois fois), suivie d'une formule affirmant que Dieu est la source de la paix, puis des répétitions de \"Subhanallah\" (Gloire à Dieu), \"Alhamdulillah\" (Louange à Dieu) et \"Allahu akbar\" (Dieu est le plus grand), généralement trente-trois fois chacune, complétées par une formule d'unicité.\n\nLa récitation d'Ayat al-Kursi (Coran 2:255), le \"verset du Trône\", après chaque prière obligatoire est également largement rapportée comme une pratique recommandée, en raison de son contenu centré sur la grandeur et l'unicité de Dieu. Ces invocations ne sont pas obligatoires pour la validité de la prière déjà accomplie, mais elles prolongent l'état de rappel de Dieu (dhikr) qu'elle instaure.\n\nLe dhikr, plus largement, désigne toute mention ou tout rappel de Dieu - par la parole, la récitation ou la pensée - et n'est pas limité aux moments qui suivent la prière : il peut accompagner l'ensemble des activités quotidiennes, comme le montrent les invocations spécifiques à chaque situation abordées dans la leçon suivante.",
        keyTakeaways: [
          "Après la prière, il est recommandé de réciter des formules de glorification comme Subhanallah, Alhamdulillah et Allahu akbar.",
          "La récitation d'Ayat al-Kursi après chaque prière est une pratique largement rapportée.",
          "Le dhikr (rappel de Dieu) ne se limite pas à l'après-prière : il peut accompagner toute la journée.",
        ],
        references: [
          { label: "Verset : Ayat al-Kursi (2:255)", url: "/quran/2/255" },
          { label: "Concept : Dhikr", url: "/concepts/dhikr" },
        ],
      },
      {
        order: 8,
        title: "Les invocations (dua) du quotidien",
        content:
          "Au-delà de la prière rituelle, la tradition prophétique rapporte de nombreuses invocations courtes destinées à accompagner les gestes du quotidien, dans la continuité de l'idée que la vie entière peut être un acte de rappel de Dieu. Avant de manger, il est recommandé de dire \"Bismillah\" (Au nom de Dieu), et après avoir mangé, \"Alhamdulillah\" (Louange à Dieu). En entrant chez soi et en en sortant, de brèves invocations rappellent également le nom de Dieu et sollicitent Sa protection.\n\nAvant de dormir, une invocation exprime l'idée de remettre sa vie et sa mort entre les mains de Dieu, dans l'attente du réveil ; au réveil, une autre invocation remercie Dieu d'avoir redonné la vie après le sommeil, comparé symboliquement à une petite mort. Pour un voyage, une invocation spécifique demande la facilité du trajet et la protection durant l'absence du foyer.\n\nCes invocations n'ont pas de statut obligatoire : elles relèvent de la sunna, la pratique recommandée du Prophète ﷺ, et leur usage régulier est présenté comme un moyen d'ancrer la conscience de Dieu dans les gestes les plus ordinaires de la vie, plutôt que de la réserver aux seuls moments de culte formel.",
        keyTakeaways: [
          "De courtes invocations accompagnent les gestes quotidiens : repas, sommeil, réveil, entrée et sortie du foyer, voyage.",
          "\"Bismillah\" avant de manger et \"Alhamdulillah\" après sont parmi les plus connues.",
          "Ces invocations relèvent de la sunna, la pratique recommandée, et non d'une obligation.",
        ],
        references: [
          { label: "Concept : Du'a (Invocation)", url: "/concepts/dua" },
          { label: "Concept : Dhikr", url: "/concepts/dhikr" },
        ],
      },
    ],
  },
  {
    title: "Approfondir sa compréhension",
    slug: "intermediaire",
    level: "intermediate",
    description: "Tafsir, fiqh, écoles juridiques, éthique et étude de sourates plus longues - une compréhension intégrée, avec les madhabs.",
    lessons: [
      {
        order: 1,
        title: "Le tafsir : deux grandes approches",
        content:
          "Le tafsir est la discipline consacrée à l'explication du Coran. On distingue traditionnellement le tafsir bi'l-ma'thur (\"par la transmission\"), qui explique le Coran par le Coran lui-même, par la Sunna, ou par les propos rapportés des Compagnons et de leurs successeurs, et le tafsir bi'r-ra'y (\"par l'opinion raisonnée\"), qui mobilise davantage le raisonnement personnel du commentateur, dans le respect des règles de la langue arabe et de la méthodologie exégétique établie.\n\nCes deux approches ne sont pas strictement opposées : la plupart des grands tafsirs combinent les deux, en s'appuyant d'abord sur la transmission disponible avant de recourir au raisonnement pour les points non explicitement traités. La qualité d'un tafsir se juge notamment à la rigueur avec laquelle il articule ces deux dimensions.\n\nCertains tafsirs se concentrent sur l'aspect juridique du texte, d'autres sur sa dimension linguistique, spirituelle ou historique - une diversité d'approches que l'on retrouve dans les différentes éditions disponibles sur cette plateforme.",
        keyTakeaways: [
          "Le tafsir bi'l-ma'thur s'appuie sur la transmission (Coran, Sunna, propos des premières générations).",
          "Le tafsir bi'r-ra'y mobilise davantage le raisonnement, dans un cadre méthodologique défini.",
          "La plupart des tafsirs de référence combinent les deux approches.",
        ],
        references: [{ label: "Bibliothèque de tafsirs", url: "/tafsir" }],
      },
      {
        order: 2,
        title: "Étude de sourate : Al-Baqara, les premiers versets",
        content:
          "Al-Baqara (\"la Vache\"), plus longue sourate du Coran avec 286 versets, est une sourate médinoise qui aborde un très large spectre de sujets : législation, récits prophétiques, exhortations et fondements de la foi. Ses tout premiers versets (2:1-5) sont particulièrement étudiés car ils dressent le portrait des \"muttaqin\" (ceux qui craignent Dieu) censés bénéficier pleinement de la guidance du Livre.\n\nCe portrait initial associe la croyance en l'invisible (al-ghayb), l'accomplissement de la prière, la dépense en aumône de ce que Dieu leur a accordé, et la croyance en ce qui a été révélé au Prophète ﷺ ainsi qu'aux messagers précédents - reliant ainsi explicitement, dès l'ouverture de la sourate, la foi islamique à la continuité des révélations antérieures déjà abordée dans le parcours d'introduction.\n\nLes versets suivants (2:6-20) présentent, en contraste, trois postures face au message : les croyants sincères, les mécréants déclarés, et les hypocrites (munafiqun) dont le Coran dénonce le double discours - première apparition dans le texte coranique de cette catégorie, qui reviendra fréquemment dans les sourates médinoises traitant de la vie de la jeune communauté musulmane.",
        keyTakeaways: [
          "Al-Baqara est la plus longue sourate du Coran (286 versets), de période médinoise.",
          "Ses premiers versets dressent le portrait des \"muttaqin\", ceux qui craignent Dieu.",
          "Elle introduit dès l'ouverture la catégorie des hypocrites (munafiqun), centrale dans les sourates médinoises.",
        ],
        references: [
          { label: "Lire Al-Baqara", url: "/quran/2" },
          { label: "Concept : Taqwa", url: "/concepts/taqwa" },
        ],
      },
      {
        order: 3,
        title: "L'école hanafite",
        content:
          "L'école hanafite, fondée par l'imam Abu Hanifa (80-150 AH) à Kufa, est aujourd'hui l'école sunnite la plus répandue numériquement, notamment en Turquie, en Asie centrale et dans le sous-continent indien. Elle se caractérise par un usage fréquent du raisonnement analogique (qiyas) et de la préférence juridique (istihsan) pour traiter les situations non explicitement couvertes par les textes.\n\nL'enseignement d'Abu Hanifa a été transmis et systématisé par ses élèves, notamment Abu Yusuf et Muhammad ash-Shaybani, qui ont largement contribué à la formalisation écrite de l'école. L'approche hanafite accorde également une place notable à la coutume locale ('urf) dans certains domaines contractuels et commerciaux.",
        keyTakeaways: [
          "L'école hanafite est aujourd'hui l'école sunnite la plus répandue numériquement.",
          "Elle privilégie le qiyas et l'istihsan pour les cas non explicitement traités.",
          "Elle accorde une place notable à la coutume locale ('urf).",
        ],
        references: [
          { label: "Fiche : École hanafite", url: "/schools/hanafite" },
          { label: "Savant : Abu Hanifa", url: "/scholars/abu-hanifa" },
        ],
      },
      {
        order: 4,
        title: "Akhlaq : la justice (adl) même envers ceux qu'on n'aime pas",
        content:
          "Le Coran établit un lien direct et explicite entre la justice (adl) et l'intégrité morale, en insistant sur un point particulièrement exigeant : l'inimitié personnelle envers autrui ne doit jamais conduire à l'injustice envers lui. La sourate Al-Ma'ida (5:8) enjoint ainsi aux croyants de ne pas laisser la haine envers un peuple les empêcher d'être équitables, \"car cela est plus proche de la piété\".\n\nCette exigence s'illustre dans la pratique juridique islamique classique par le principe selon lequel un juge doit statuer selon le droit, même en faveur d'un adversaire déclaré, et par des exemples rapportés de califes ou de savants rendant justice contre leurs propres intérêts ou relations. L'adl n'est ainsi pas présenté comme une vertu abstraite, mais comme une discipline concrète à maintenir précisément lorsque l'émotion ou l'intérêt personnel pousseraient à y déroger.\n\nCette insistance coranique sur la justice \"malgré soi\" complète la compréhension du fiqh abordée dans ce parcours : les règles juridiques déduites par les savants (qiyas, ijma', istihsan...) ne sont pas de simples techniques, mais des outils au service d'un principe éthique supérieur - rendre à chacun son droit, sans distinction d'affection ou d'inimitié.",
        keyTakeaways: [
          "Le Coran (5:8) interdit explicitement que la haine envers autrui conduise à l'injustice à son égard.",
          "L'adl est présentée comme une discipline concrète, particulièrement exigeante face à un adversaire.",
          "Les outils juridiques du fiqh sont au service de ce principe éthique supérieur.",
        ],
        references: [
          { label: "Concept : Adl", url: "/concepts/adl" },
          { label: "Concept : Zulm", url: "/concepts/zulm" },
        ],
      },
      {
        order: 5,
        title: "Panorama des tafsirs de référence",
        content:
          "Parmi les tafsirs classiques, celui d'Ibn Kathir (VIIIe siècle après l'Hégire) est particulièrement estimé pour son usage systématique du Coran et de la Sunna comme première source d'explication, dans la tradition du tafsir bi'l-ma'thur. Plus ancien encore, le tafsir d'At-Tabari (IIIe-IVe siècle) est l'un des plus vastes commentaires complets du Coran, rassemblant un très grand nombre de transmissions.\n\nDes tafsirs modernes et concis, comme At-Tafsir al-Muyassar ou Al-Mukhtasar fi at-Tafsir, ont été produits par des comités de savants contemporains pour rendre le sens du Coran accessible à un large public, souvent traduits en plusieurs langues - une caractéristique qui en fait un bon point d'entrée pour l'étude comparée verset par verset.\n\nCette diversité d'éditions, disponibles sur la plateforme, permet de croiser un commentaire classique et détaillé avec un commentaire moderne et synthétique pour un même verset.",
        keyTakeaways: [
          "Ibn Kathir et At-Tabari sont deux références classiques du tafsir bi'l-ma'thur.",
          "Al-Muyassar et Al-Mukhtasar sont des tafsirs modernes, concis et multilingues.",
          "Croiser plusieurs tafsirs permet une lecture plus complète d'un même verset.",
        ],
        references: [{ label: "Éditions de tafsir disponibles", url: "/tafsir" }],
      },
      {
        order: 6,
        title: "L'école malikite",
        content:
          "L'école malikite, fondée par l'imam Malik ibn Anas (93-179 AH) à Médine, s'est particulièrement diffusée au Maghreb, en Afrique de l'Ouest et dans certaines régions du Golfe. Son ouvrage majeur, le Muwatta, est l'un des plus anciens recueils organisant hadiths et positions juridiques par thèmes.\n\nL'école malikite accorde une importance particulière à la pratique vivante des habitants de Médine ('amal ahl al-Madina), considérée comme un témoignage privilégié de la Sunna, la ville ayant été le cadre de vie du Prophète ﷺ et de la première génération de musulmans. Elle mobilise également largement le principe d'intérêt général (maslaha) dans son raisonnement juridique.",
        keyTakeaways: [
          "L'école malikite s'est particulièrement diffusée au Maghreb et en Afrique de l'Ouest.",
          "Elle accorde un poids particulier à la pratique historique des habitants de Médine.",
          "Le Muwatta de l'imam Malik en est l'ouvrage fondateur.",
        ],
        references: [
          { label: "Fiche : École malikite", url: "/schools/malikite" },
          { label: "Savant : Malik ibn Anas", url: "/scholars/malik-ibn-anas" },
        ],
      },
      {
        order: 7,
        title: "Qu'est-ce que le fiqh ? Distinction avec la charia",
        content:
          "Le fiqh est la discipline juridique islamique : l'ensemble des règles pratiques déduites des sources scripturaires par les savants, à l'aide d'une méthodologie (usul al-fiqh). Il se distingue de la \"charia\" au sens large, qui désigne plutôt l'ensemble des principes et valeurs divins considérés immuables, tandis que le fiqh en est l'élaboration humaine, faillible et donc susceptible de varier selon les contextes et les écoles.\n\nCette distinction explique pourquoi il existe plusieurs écoles de fiqh sans que cela remette en cause l'unicité de la charia : les juristes partagent les mêmes sources mais peuvent aboutir à des conclusions différentes selon la méthodologie employée, la force accordée à tel ou tel hadith, ou le contexte social pris en compte.\n\nLe fiqh couvre deux grands domaines : le culte (ibadat), qui régit la relation entre le croyant et Dieu (prière, jeûne, zakat...), et les relations sociales (mu'amalat), qui régissent les rapports entre individus (contrats, famille, droit pénal...).",
        keyTakeaways: [
          "Le fiqh est l'élaboration humaine et faillible des principes de la charia.",
          "Plusieurs écoles de fiqh coexistent sans remettre en cause l'unicité de la charia.",
          "Le fiqh couvre le culte (ibadat) et les relations sociales (mu'amalat).",
        ],
        references: [{ label: "Concept : Fiqh", url: "/concepts/fiqh" }],
      },
      {
        order: 8,
        title: "L'école shafi'ite",
        content:
          "L'école shafi'ite, fondée par l'imam Muhammad ibn Idris ash-Shafi'i (150-204 AH), est répandue notamment en Égypte, en Asie du Sud-Est, au Yemen et en Afrique de l'Est. Ash-Shafi'i est reconnu pour avoir, avec son ouvrage Ar-Risala, proposé la première systématisation rigoureuse de la méthodologie juridique islamique (usul al-fiqh), influençant durablement la manière dont l'ensemble des écoles ultérieures ont structuré leur raisonnement.\n\nL'approche shafi'ite se caractérise par une hiérarchisation stricte des sources - Coran, Sunna, consensus (ijma'), puis raisonnement analogique (qiyas) - et par une prudence méthodologique marquée vis-à-vis des outils secondaires moins codifiés comme l'istihsan hanafite.",
        keyTakeaways: [
          "Ash-Shafi'i a systématisé la méthodologie juridique islamique dans Ar-Risala.",
          "L'école shafi'ite est répandue en Égypte, en Asie du Sud-Est et en Afrique de l'Est.",
          "Elle applique une hiérarchie stricte des sources du droit.",
        ],
        references: [
          { label: "Fiche : École shafi'ite", url: "/schools/shafiite" },
          { label: "Savant : Ash-Shafi'i", url: "/scholars/ash-shafii" },
        ],
      },
      {
        order: 9,
        title: "Étude de sourate : Al-Hujurat, l'éthique sociale",
        content:
          "Al-Hujurat (\"les Appartements\"), sourate médinoise de dix-huit versets, est parfois désignée comme la \"charte de l'éthique sociale\" du Coran, tant elle concentre en un espace réduit des principes régissant les relations entre croyants. Elle s'ouvre par des règles de politesse envers le Prophète ﷺ, avant d'aborder une série de comportements sociaux à éviter.\n\nLe verset 11 interdit la moquerie entre croyants (\"qu'un groupe ne raille pas un autre groupe, il se peut que ce dernier soit meilleur que lui\") ainsi que les surnoms blessants et l'atteinte à la réputation d'autrui. Le verset 12 met en garde contre la suspicion excessive (dhann), l'espionnage des affaires d'autrui, et la médisance (ghiba), comparée de manière frappante au fait de \"manger la chair de son frère mort\" - image déjà rencontrée dans l'étude du concept de ghiba.\n\nLe verset 13, l'un des plus cités du Coran sur la question de la diversité humaine, affirme que Dieu a créé les êtres humains en peuples et tribus \"afin qu'ils se connaissent mutuellement\", et que le critère de supériorité auprès de Dieu n'est autre que la piété (taqwa) - non l'origine, la richesse ou le statut social.",
        keyTakeaways: [
          "Al-Hujurat concentre des principes d'éthique sociale : interdiction de la moquerie, de la suspicion et de la médisance.",
          "Le verset 12 compare la médisance au fait de manger la chair de son frère mort.",
          "Le verset 13 affirme que seule la piété (taqwa), non l'origine, distingue les êtres humains auprès de Dieu.",
        ],
        references: [
          { label: "Lire Al-Hujurat", url: "/quran/49" },
          { label: "Concept : Ghiba", url: "/concepts/ghiba" },
          { label: "Concept : Taqwa", url: "/concepts/taqwa" },
        ],
      },
      {
        order: 10,
        title: "L'école hanbalite",
        content:
          "L'école hanbalite, fondée par l'imam Ahmad ibn Hanbal (164-241 AH) à Bagdad, est aujourd'hui prédominante en Arabie Saoudite et dans le Golfe. L'imam Ahmad est également célèbre pour son immense recueil de hadiths, le Musnad, et pour avoir résisté, au prix d'emprisonnements, à la pression du pouvoir abbasside durant l'épisode de la mihna concernant la nature du Coran.\n\nL'école hanbalite accorde une importance particulière au hadith authentique, y compris parfois des hadiths faibles préférés à l'opinion personnelle en l'absence de texte plus fort, et se montre généralement prudente vis-à-vis du raisonnement analogique lorsqu'un texte est disponible. Elle est historiquement associée au courant théologique atharite.",
        keyTakeaways: [
          "L'école hanbalite est aujourd'hui prédominante en Arabie Saoudite et dans le Golfe.",
          "Ahmad ibn Hanbal a résisté à la pression politique durant l'épisode de la mihna.",
          "Elle accorde une place particulière au hadith authentique face au raisonnement.",
        ],
        references: [
          { label: "Fiche : École hanbalite", url: "/schools/hanbalite" },
          { label: "Savant : Ahmad ibn Hanbal", url: "/scholars/ahmad-ibn-hanbal" },
        ],
      },
      {
        order: 11,
        title: "Akhlaq : l'humilité (tawadu') face à l'orgueil (kibr)",
        content:
          "Malgré son statut de dernier messager de Dieu, le Prophète ﷺ est rapporté dans de nombreux hadiths comme ayant systématiquement refusé tout traitement d'exception : il réparait lui-même ses vêtements, trayait ses chèvres, s'asseyait parmi ses compagnons sans place réservée au point qu'un visiteur devait parfois demander lequel d'entre eux était le Prophète, et refusait que l'on se lève en signe de déférence excessive à son entrée.\n\nCe refus systématique de la déférence est mis en regard, dans la tradition, avec la définition du kibr (orgueil) rapportée par Muslim : \"le rejet de la vérité et le mépris des gens\". L'orgueil n'est donc pas seulement une question d'attitude extérieure, mais un obstacle spirituel majeur, au point qu'un hadith rapporte qu'\"aucune personne ayant un atome d'orgueil dans le cœur n'entrera au Paradis\".\n\nLe tawadu' (humilité) qui s'oppose au kibr ne consiste pas en une dévalorisation de soi, mais en une juste reconnaissance de sa dépendance totale envers Dieu et en un respect égal accordé à autrui quel que soit son rang. Cette vertu complète directement la compréhension de l'ihsan et de la sincérité (ikhlas) déjà abordées dans ce parcours : l'humilité protège l'action religieuse de la vanité qui pourrait en corrompre la valeur.",
        keyTakeaways: [
          "Le Prophète ﷺ refusait systématiquement tout traitement d'exception malgré son statut.",
          "Un hadith définit le kibr comme \"le rejet de la vérité et le mépris des gens\".",
          "Le tawadu' est une juste reconnaissance de sa dépendance envers Dieu, non une dévalorisation de soi.",
        ],
        references: [
          { label: "Concept : Tawadu", url: "/concepts/tawadu" },
          { label: "Concept : Kibr", url: "/concepts/kibr" },
        ],
      },
      {
        order: 12,
        title: "Panorama de l'histoire islamique",
        content:
          "Après la période du Prophète ﷺ vient le califat rashidun (632-661), celui des quatre \"califes bien-guidés\" (Abu Bakr, Omar, Uthman, Ali), marqué par l'expansion rapide hors de la péninsule arabique et par la compilation définitive du texte coranique sous Uthman.\n\nLui succède le califat omeyyade (661-750, capitale Damas), première dynastie héréditaire, sous lequel débute la conquête de l'Andalousie en 711, puis le califat abbasside (750-1258, capitale Bagdad), associé à l'âge d'or scientifique et culturel islamique, jusqu'à la prise de Bagdad par les Mongols. La présence musulmane en Al-Andalus (péninsule ibérique) se prolonge jusqu'à la chute de Grenade en 1492.\n\nCes périodes sont détaillées sur la plateforme avec leurs événements clés et les sources historiques correspondantes (Tabari, Ibn Kathir), permettant de situer chronologiquement le développement du fiqh, de la théologie et des sciences islamiques évoqués dans ce parcours.",
        keyTakeaways: [
          "Le califat rashidun (632-661) voit l'expansion rapide et la compilation du Coran.",
          "Les Omeyyades (Damas) puis les Abbassides (Bagdad) structurent les siècles suivants.",
          "La présence musulmane en Al-Andalus dure de 711 à 1492.",
        ],
        references: [{ label: "Chronologie complete", url: "/history" }],
      },
      {
        order: 13,
        title: "Ash'arisme et Maturidisme",
        content:
          "L'ash'arisme, fondé par Abu al-Hasan al-Ash'ari (260-324 AH), et le maturidisme, fondé par Abu Mansur al-Maturidi (m. 333 AH), sont les deux courants théologiques (aqida) majoritaires dans le sunnisme classique. Tous deux cherchent une voie médiane entre le rationalisme du mu'tazilisme et un littéralisme strict, en utilisant des outils rationnels pour défendre et articuler les croyances plutôt que pour les remettre en cause.\n\nL'ash'arisme, historiquement associé aux écoles shafi'ite et malikite, et le maturidisme, associé à l'école hanafite, partagent l'essentiel de leurs positions théologiques, avec quelques nuances sur le rôle précis de la raison dans la connaissance du bien et du mal avant même la révélation.\n\nCes deux courants sont présentés sur la plateforme de manière descriptive, sans hiérarchie de \"vérité\" entre eux ni avec les autres courants théologiques.",
        keyTakeaways: [
          "Ash'arisme et maturidisme sont les deux courants théologiques sunnites majoritaires.",
          "Ils cherchent un équilibre entre rationalisme et fidélité aux textes.",
          "Ils sont historiquement associés respectivement aux écoles shafi'ite/malikite et hanafite.",
        ],
        references: [
          { label: "Courant : Ash'arisme", url: "/schools/asharisme" },
          { label: "Courant : Maturidisme", url: "/schools/maturidisme" },
        ],
      },
      {
        order: 14,
        title: "Atharisme et Mu'tazilisme",
        content:
          "L'atharisme, historiquement associé à l'école hanbalite, privilégie l'affirmation directe des textes relatifs aux attributs divins tels qu'ils sont rapportés, sans les interpréter allégoriquement ni chercher à en déterminer la modalité précise (bila kayf), évitant ainsi un recours systématique au raisonnement rationnel (kalam).\n\nLe mu'tazilisme, apparu dès le IIe siècle après l'Hégire à Bassora, représente à l'inverse le courant le plus rationaliste de la théologie islamique classique, accordant une place centrale à la raison, notamment sur des questions comme la justice divine et le libre arbitre. Influent sous certains califes abbassides, il est aujourd'hui minoritaire mais demeure une référence incontournable de l'histoire intellectuelle islamique.\n\nCes deux courants illustrent, aux deux extrêmes du spectre, la diversité des réponses historiquement apportées à la question du rapport entre raison et révélation.",
        keyTakeaways: [
          "L'atharisme privilégie l'affirmation des textes sans interprétation rationnelle systématique.",
          "Le mu'tazilisme est le courant le plus rationaliste de la théologie islamique classique.",
          "Ces deux courants représentent des réponses opposées à la question raison/révélation.",
        ],
        references: [
          { label: "Courant : Atharisme", url: "/schools/atharisme" },
          { label: "Courant : Mu'tazilisme", url: "/schools/mutazilisme" },
        ],
      },
      {
        order: 15,
        title: "Sciences du hadith : classification et transmission",
        content:
          "L'étude critique du hadith repose sur l'examen conjoint de la chaîne de transmission (isnad) et du contenu (matn). L'isnad est évalué selon la continuité de la chaîne, la fiabilité et la mémoire de chaque rapporteur ; le matn est examiné pour vérifier l'absence de contradiction avec des textes plus établis.\n\nCet examen aboutit à une classification en plusieurs degrés : sahih (authentique), hasan (bon, avec une chaîne légèrement moins forte), da'if (faible) et mawdu' (fabriqué). Des savants spécialisés (muhaddithun), comme Al-Bukhari et Muslim en leur temps, ou Al-Albani plus récemment, ont consacré leur vie à cet examen critique.\n\nCette plateforme rapporte ces classifications telles qu'attribuées à leurs vérificateurs - jamais inventées - notamment pour les recueils comme Jami at-Tirmidhi ou Sunan Abu Dawud, qui détaillent le degré de chaque hadith et signalent parfois des divergences d'avis entre savants sur un même texte.",
        keyTakeaways: [
          "L'examen d'un hadith porte sur la chaîne de transmission (isnad) et le contenu (matn).",
          "Les hadiths sont classés en degrés : sahih, hasan, da'if, mawdu'.",
          "Ces classifications sont toujours attribuées à leur vérificateur, jamais inventées.",
        ],
        references: [{ label: "Exemple : Jami at-Tirmidhi", url: "/hadith/tirmidhi" }],
      },
    ],
  },
  {
    title: "Étude avancée",
    slug: "avance",
    level: "advanced",
    description: "Méthodologie juridique, sciences coraniques, éthique spirituelle, terminologie du hadith et comparaison des écoles.",
    lessons: [
      {
        order: 1,
        title: "Usul al-fiqh : les quatre sources principales",
        content:
          "L'usul al-fiqh (\"racines du fiqh\") est la discipline qui étudie les sources et méthodes permettant de déduire des règles juridiques concrètes à partir des textes. Quatre sources sont généralement reconnues par l'ensemble des écoles sunnites : le Coran, première source ; la Sunna, qui précise et complète le Coran ; le consensus des savants (ijma'), lorsqu'il est établi sur une question ; et le raisonnement analogique (qiyas), qui étend une règle connue à un cas similaire non explicitement traité.\n\nL'imam ash-Shafi'i, dans Ar-Risala, est considéré comme le premier à avoir systématisé cette hiérarchie et la méthodologie de son application, posant les bases sur lesquelles l'ensemble des écoles ultérieures, y compris hanafite, malikite et hanbalite, ont construit ou affiné leur propre approche.\n\nCette hiérarchie commune explique que les divergences entre écoles portent généralement moins sur les sources elles-mêmes que sur la manière de les articuler et de les pondérer face à un cas concret.",
        keyTakeaways: [
          "Les quatre sources reconnues : Coran, Sunna, ijma' (consensus), qiyas (analogie).",
          "Ash-Shafi'i a le premier systématisé cette hiérarchie méthodologique.",
          "Les divergences entre écoles portent surtout sur l'articulation de ces sources.",
        ],
        references: [{ label: "Savant : Ash-Shafi'i", url: "/scholars/ash-shafii" }],
      },
      {
        order: 2,
        title: "Étude de sourate : Ya-Sin, structure et argumentation",
        content:
          "Ya-Sin, sourate mecquoise de quatre-vingt-trois versets, est traditionnellement surnommée \"le cœur du Coran\" d'après un hadith dont l'authenticité est discutée par les critiques du hadith - certains le classant faible - mais qui reste largement répandu dans la piété populaire, notamment par une récitation fréquente auprès des mourants.\n\nSur le plan du contenu, Ya-Sin est souvent étudiée comme un modèle d'argumentation coranique en faveur de trois piliers de la foi : la prophétie, illustrée par le récit de messagers envoyés à une cité qui les rejette (versets 13-32) ; la résurrection, défendue par plusieurs arguments frappants, notamment la comparaison entre la capacité de Dieu à faire revivre une terre morte par la pluie et Sa capacité à ressusciter les morts (versets 33-36), ou l'argument selon lequel Celui qui a créé l'être humain à partir de rien est nécessairement capable de le recréer (verset 79) ; et le tawhid, rappelé tout au long du texte.\n\nCette structure argumentative fait de Ya-Sin un cas d'étude privilégié pour observer comment le Coran ne se contente pas d'affirmer des doctrines mais déploie, en particulier dans les sourates mecquoises centrées sur les fondements de la foi, des raisonnements destinés à convaincre un auditoire sceptique - une dimension qui rejoint directement l'étude de l'i'jaz (l'inimitabilité) abordée dans ce parcours.",
        keyTakeaways: [
          "Ya-Sin est traditionnellement surnommée \"le cœur du Coran\", bien que le hadith associé soit discuté.",
          "Elle argumente en faveur de la prophétie, de la résurrection et du tawhid, les trois piliers des sourates mecquoises.",
          "Son raisonnement sur la résurrection s'appuie notamment sur l'analogie avec la terre revivifiée par la pluie.",
        ],
        references: [
          { label: "Lire Ya-Sin", url: "/quran/36" },
          { label: "Concept : Nubuwwa", url: "/concepts/nubuwwa" },
          { label: "Concept : Akhira", url: "/concepts/akhira" },
        ],
      },
      {
        order: 3,
        title: "Usul al-fiqh : les outils secondaires",
        content:
          "Au-delà des quatre sources principales, chaque école a développé des outils méthodologiques secondaires pour traiter les cas non explicitement couverts. L'istihsan (\"préférence juridique\"), particulièrement utilisé par l'école hanafite, permet d'écarter une analogie stricte au profit d'une solution jugée plus équitable dans le contexte.\n\nLa maslaha (\"intérêt général\"), mobilisée notamment par l'école malikite, permet de fonder une règle sur la protection d'un intérêt essentiel (vie, religion, raison, lignée, biens) même en l'absence de texte spécifique. D'autres outils incluent la pratique des Medinois (spécifique aux malikites), la coutume ('urf) ou le principe de précaution (sadd adh-dhara'i, \"barrer les moyens\" menant à un interdit).\n\nC'est cette variation dans l'acceptation et l'usage de ces outils secondaires - plus que des textes fondamentalement différents - qui explique une grande partie des divergences juridiques documentées dans le comparateur.",
        keyTakeaways: [
          "L'istihsan (hanafite) et la maslaha (malikite) sont deux outils méthodologiques secondaires majeurs.",
          "Ces outils permettent de traiter des cas non explicitement couverts par les textes.",
          "Leur usage variable explique une grande part des divergences entre écoles.",
        ],
        references: [{ label: "Comparateur de positions", url: "/fiqh" }],
      },
      {
        order: 4,
        title: "Ulum al-Qur'an : asbab al-nuzul et naskh",
        content:
          "Les asbab al-nuzul (\"circonstances de la révélation\") étudient le contexte historique précis dans lequel un verset ou un passage a été révélé - une question posée au Prophète ﷺ, un événement particulier - permettant de mieux saisir la portée et parfois la généralité ou la spécificité d'une règle énoncée.\n\nLa question du naskh (\"abrogation\") examine les cas où un verset ultérieur modifierait la portée pratique d'un verset antérieur sur un même sujet, sujet traité avec beaucoup de prudence méthodologique par les commentateurs classiques, qui distinguent l'abrogation réelle de simples cas de spécification ou de complémentarité entre versets.\n\nCes deux disciplines illustrent l'importance, en ulum al-Qur'an, de ne pas isoler un verset de son contexte de révélation et de l'ensemble du corpus coranique avant d'en tirer une règle ou une compréhension définitive.",
        keyTakeaways: [
          "Les asbab al-nuzul situent un verset dans son contexte historique de révélation.",
          "Le naskh étudie les cas où un verset ultérieur modifie la portée d'un verset antérieur.",
          "Ces disciplines rappellent l'importance de ne pas isoler un verset de son contexte.",
        ],
        references: [{ label: "Explorer le tafsir verset par verset", url: "/tafsir" }],
      },
      {
        order: 5,
        title: "Akhlaq avancé : l'ikhlas et le risque de la riya",
        content:
          "Un hadith rapporté par Muslim, souvent cité dans la littérature spirituelle islamique, décrit trois catégories de personnes jugées en premier au Jour du Jugement précisément parce que leurs actes, en apparence exemplaires - le combattant tombé au combat, le savant qui a enseigné et récité le Coran, le riche qui a dépensé en aumône - se révèlent avoir été accomplis pour être vus et loués des hommes plutôt que pour Dieu seul, et sont en conséquence rejetés malgré leur ampleur extérieure.\n\nCe hadith illustre de manière saisissante la centralité de l'ikhlas (sincérité) dans l'évaluation islamique de l'action religieuse : ce n'est pas l'ampleur ou la visibilité d'un acte qui détermine sa valeur, mais l'intention qui l'anime. La riya (ostentation), parfois qualifiée de \"shirk mineur\" par certains savants en raison du risque qu'elle fait courir à l'exclusivité de l'intention due à Dieu, peut ainsi vider de sa valeur un acte par ailleurs conforme en tout point aux prescriptions religieuses.\n\nCette exigence soulève une difficulté pratique reconnue par les spirituels classiques : comment distinguer une bonne action publique légitime (qui peut encourager autrui à l'exemple) d'un acte motivé par la recherche de reconnaissance ? La réponse généralement proposée insiste moins sur l'évitement systématique de toute visibilité que sur un examen constant de l'intention (muhasaba), reconnaissant que l'ikhlas parfait est un idéal vers lequel on tend plutôt qu'un état définitivement acquis.",
        keyTakeaways: [
          "Un hadith rapporté par Muslim décrit trois profils d'actes apparemment exemplaires rejetés pour manque de sincérité.",
          "La riya est parfois qualifiée de \"shirk mineur\" par certains savants en raison de son atteinte à l'exclusivité de l'intention.",
          "La tradition spirituelle recommande un examen constant de l'intention (muhasaba) plutôt qu'un évitement systématique de toute visibilité.",
        ],
        references: [
          { label: "Concept : Ikhlas", url: "/concepts/ikhlas" },
          { label: "Concept : Riya", url: "/concepts/riya" },
        ],
      },
      {
        order: 6,
        title: "Ulum al-Qur'an : makki, madani et i'jaz",
        content:
          "La distinction entre sourates mecquoises (makki) et médinoises (madani) repose sur plusieurs critères - lieu et période de révélation, style, thèmes abordés - les sourates mecquoises se concentrant davantage sur le tawhid, le Jugement dernier et les récits prophétiques, les sourates médinoises sur la législation et l'organisation de la communauté.\n\nL'i'jaz al-Qur'an (\"inimitabilité\") désigne l'étude de la dimension littéraire, rhétorique et structurelle du texte coranique, considérée par la tradition islamique comme un argument en faveur de son origine divine, le Coran défiant explicitement (sourate Al-Baqara, 2:23) quiconque d'en produire l'équivalent.\n\nCes classifications et cette étude littéraire, bien qu'anciennes, restent au cœur du travail des exégètes contemporains pour situer et comprendre chaque passage coranique.",
        keyTakeaways: [
          "La distinction makki/madani aide à comprendre le contexte et les thèmes d'une sourate.",
          "L'i'jaz étudie la dimension littéraire du Coran, argument traditionnel de son origine divine.",
          "Ces outils restent centraux dans le travail des exégètes contemporains.",
        ],
        references: [{ label: "Consulter les sourates avec leur statut", url: "/quran" }],
      },
      {
        order: 7,
        title: "Mustalah al-Hadith : mutawatir et ahad",
        content:
          "La science de la terminologie du hadith (mustalah al-hadith) classe d'abord les hadiths selon le nombre de leurs chaînes de transmission indépendantes. Un hadith mutawatir est rapporté par un nombre de personnes si important, à chaque génération, qu'une collusion pour le fabriquer est jugée pratiquement impossible - sa fiabilité est alors considérée comme certaine.\n\nUn hadith ahad, transmis par un nombre plus restreint de rapporteurs, ne bénéficie pas de cette certitude automatique et doit être évalué individuellement selon la fiabilité de chaque maillon de sa chaîne. La très grande majorité des hadiths juridiques relève de cette seconde catégorie, ce qui explique en partie pourquoi leur interprétation et leur portée peuvent faire l'objet de discussions entre savants.\n\nCette distinction structure l'ensemble de la méthodologie d'authentification développée par les muhaddithun classiques.",
        keyTakeaways: [
          "Un hadith mutawatir bénéficie d'une certitude automatique du fait du nombre de ses transmetteurs.",
          "Un hadith ahad doit être évalué individuellement selon sa chaîne de transmission.",
          "La majorité des hadiths juridiques relèvent de la catégorie ahad.",
        ],
        references: [{ label: "Exemple : Sahih al-Bukhari", url: "/hadith/bukhari" }],
      },
      {
        order: 8,
        title: "Mustalah al-Hadith : sahih, hasan et da'if",
        content:
          "Un hadith est qualifié de sahih (\"authentique\") lorsque sa chaîne de transmission est continue, composée de rapporteurs fiables et de bonne mémoire, et sans défaut caché (illa) ni contradiction avec une source plus forte (shudhudh). Un hadith hasan (\"bon\") répond aux mêmes critères mais avec une chaîne légèrement moins solide, généralement encore utilisable en droit.\n\nUn hadith da'if (\"faible\") présente une faiblesse dans sa chaîne - rapporteur peu fiable, chaîne interrompue - le rendant impropre à fonder seul une règle juridique, même si certains savants en admettent un usage limité pour l'incitation à la vertu (fada'il al-a'mal) selon des conditions strictes. Un hadith mawdu' (\"fabriqué\") est identifié comme une invention pure et simple, attribuée à tort au Prophète ﷺ.\n\nCette échelle de classification, appliquée de manière indépendante par chaque vérificateur, explique pourquoi un même hadith peut parfois recevoir des appréciations différentes selon les savants, comme le montrent les classifications multiples rapportées sur cette plateforme.",
        keyTakeaways: [
          "Sahih, hasan, da'if et mawdu' forment une échelle décroissante de fiabilité.",
          "Un hadith da'if ne peut en principe fonder seul une règle juridique.",
          "Un même hadith peut recevoir des appréciations différentes selon les vérificateurs.",
        ],
        references: [{ label: "Exemple : Jami at-Tirmidhi", url: "/hadith/tirmidhi" }],
      },
      {
        order: 9,
        title: "Kalam : origines et développement",
        content:
          "Le kalam désigne la théologie islamique argumentée rationnellement, développée pour défendre et articuler les croyances face aux questions philosophiques et aux courants concurrents rencontrés au fil de l'expansion du monde musulman. Ses premières grandes controverses portent sur des questions comme le libre arbitre, la nature du Coran (créé ou incréé) ou le statut du croyant ayant commis un péché grave.\n\nLe mu'tazilisme en constitue l'expression la plus rationaliste ; les écoles ash'arite et maturidite se sont ensuite constituées en réponse, cherchant un équilibre entre argumentation rationnelle et fidélité aux textes, pour devenir majoritaires dans le sunnisme classique. L'atharisme, de son côté, s'est développé en réaction au recours systématique au kalam, privilégiant l'affirmation directe des textes.\n\nCette histoire intellectuelle mouvementée éclaire pourquoi la théologie islamique n'est pas monolithique, mais traversée de courants aux méthodologies distinctes, présentés de manière descriptive sur la plateforme.",
        keyTakeaways: [
          "Le kalam est né du besoin d'argumenter rationnellement les croyances islamiques.",
          "Le mu'tazilisme en est l'expression la plus rationaliste, l'atharisme la plus réticente.",
          "Ash'arisme et maturidisme représentent une voie médiane devenue majoritaire.",
        ],
        references: [{ label: "Panorama des courants théologiques", url: "/schools" }],
      },
      {
        order: 10,
        title: "Comparaison des écoles : méthodologie et exemples",
        content:
          "Étudier le fiqh sans tenir compte de la pluralité des écoles donnerait une image faussement uniforme du droit islamique. Une divergence entre écoles n'est généralement pas un désaccord sur les fondements de la foi, mais le résultat légitime de méthodologies d'interprétation différentes appliquées à des sources largement partagées.\n\nPrenons l'exemple de la position des mains pendant la prière : les quatre écoles s'accordent sur l'essentiel du rituel de la salah, mais divergent sur ce détail précis en raison de la diversité des hadiths rapportés et du poids accordé à la pratique observée dans chaque région - Médine pour les malikites, Kufa pour les hanafites. Comprendre cette origine méthodologique de la divergence permet d'aborder ces questions avec la nuance qu'elles méritent, plutôt que de chercher à désigner une position comme supérieure aux autres.\n\nLe comparateur de cette plateforme applique systématiquement cette approche : chaque position est attribuée à son école et sourcée, accompagnée d'une explication de l'origine de la divergence.",
        keyTakeaways: [
          "Les divergences entre écoles relèvent généralement de la méthodologie, non des fondements de la foi.",
          "L'exemple de la position des mains illustre l'impact des hadiths et des pratiques régionales.",
          "Le comparateur documente systématiquement l'origine de chaque divergence.",
        ],
        references: [
          { label: "Comparateur : position des mains en prière", url: "/fiqh/position-des-mains-priere" },
        ],
      },
      {
        order: 11,
        title: "Utiliser le comparateur de positions",
        content:
          "Le comparateur de fiqh de cette plateforme est organisé par sujet : chaque page présente les positions des quatre écoles sunnites côte à côte, chacune sourcée, suivies d'une explication documentée de l'origine de la divergence lorsque celle-ci est établie. Cette structure permet une lecture rapide et comparative, plutôt qu'une recherche dispersée entre plusieurs ouvrages.\n\nCette approche comparative n'a pas vocation à désigner une position comme \"la bonne\" : elle vise à rendre visible, de manière neutre et sourcée, une pluralité légitime au sein de la tradition juridique sunnite - une pluralité que les savants eux-mêmes ont toujours reconnue et respectée entre écoles.\n\nEn parcourant les différents sujets disponibles, on peut ainsi se familiariser avec la logique propre à chaque école et mieux comprendre pourquoi deux pratiques différentes peuvent, l'une comme l'autre, être le fruit d'un raisonnement juridique rigoureux.",
        keyTakeaways: [
          "Le comparateur présente les positions des quatre écoles sourcées, sujet par sujet.",
          "L'objectif est de rendre visible une pluralité légitime, pas de désigner une position supérieure.",
          "Cette pluralité a toujours été reconnue par les savants eux-mêmes.",
        ],
        references: [{ label: "Ouvrir le comparateur", url: "/fiqh" }],
      },
    ],
  },
  {
    title: "Le jeûne et l'aumône en pratique",
    slug: "jeune-et-aumone",
    level: "beginner",
    description: "Un parcours pratique sur le jeûne du Ramadan et la zakat : conditions, exceptions, rattrapage et calcul, dans la continuité du parcours sur la prière.",
    lessons: [
      {
        order: 1,
        title: "Le jeûne du Ramadan : principe et conditions",
        content:
          "Le jeûne (sawm) du mois de Ramadan constitue le quatrième des cinq piliers de l'Islam. Il consiste à s'abstenir de nourriture, de boisson et de rapports intimes entre l'aube (fajr) et le coucher du soleil (maghrib), chaque jour du mois lunaire de Ramadan, dans une intention (niyya) formulée dans le cœur.\n\nLe jeûne est obligatoire pour tout musulman adulte, sain d'esprit et physiquement capable de l'accomplir. Plusieurs catégories en sont dispensées ou bénéficient d'une concession : les enfants n'y sont pas tenus, les personnes malades ou âgées pour qui le jeûne représenterait une difficulté excessive, les femmes enceintes ou allaitantes selon leur situation, les femmes en période de menstrues ou de lochies, et les voyageurs, dont le cas est développé dans la leçon suivante.\n\nAu-delà de sa dimension d'abstinence physique, le jeûne est présenté dans le Coran (2:183) comme un moyen d'atteindre la piété (taqwa), en associant la maîtrise du corps à un travail de discipline intérieure - patience, maîtrise de soi et conscience accrue de Dieu tout au long de la journée.",
        keyTakeaways: [
          "Le sawm est le quatrième pilier de l'Islam, obligatoire durant tout le mois de Ramadan.",
          "Il consiste à s'abstenir de nourriture, boisson et rapports intimes de l'aube au coucher du soleil.",
          "Plusieurs catégories de personnes en sont dispensées ou bénéficient d'une concession.",
        ],
        references: [
          { label: "Concept : Sawm", url: "/concepts/sawm" },
          { label: "Concept : Taqwa", url: "/concepts/taqwa" },
        ],
      },
      {
        order: 2,
        title: "Ce qui annule le jeûne et les exceptions autorisées",
        content:
          "Le jeûne est rompu par tout ce qui relève d'un acte volontaire de nourriture, de boisson ou de rapport intime durant les heures de jeûne. Un oubli - manger ou boire par inadvertance - n'annule cependant pas le jeûne selon la majorité des écoles, considéré comme une provision accordée par Dieu et non comme une rupture volontaire.\n\nCertains actes font l'objet de divergences entre écoles juridiques quant à leur effet sur le jeûne, notamment la pratique de la ventouse thérapeutique (hijama) : trois des quatre écoles considèrent qu'elle n'annule pas le jeûne, tandis que l'école hanbalite retient qu'elle le rompt, en s'appuyant sur un hadith explicite à ce sujet.\n\nLe voyageur bénéficie d'une concession explicitement mentionnée dans le Coran (2:184-185) : il peut rompre son jeûne durant son déplacement, à charge de le rattraper ultérieurement. Les écoles divergent toutefois sur la préférence entre jeûner ou rompre pendant le voyage, certaines valorisant le jeûne lorsqu'il ne cause pas de difficulté, d'autres valorisant la concession elle-même.",
        keyTakeaways: [
          "Manger, boire ou avoir un rapport intime volontairement rompt le jeûne ; l'oubli ne l'annule pas.",
          "La ventouse (hijama) fait l'objet d'une divergence : rompt le jeûne pour les hanbalites, pas pour les trois autres écoles.",
          "Le voyageur peut rompre son jeûne, avec un rattrapage obligatoire par la suite.",
        ],
        references: [
          { label: "Comparateur : la ventouse annule-t-elle le jeûne ?", url: "/fiqh/hijama-et-jeune" },
          { label: "Comparateur : le jeûne du voyageur", url: "/fiqh/jeune-du-voyageur" },
        ],
      },
      {
        order: 3,
        title: "Rattraper un jeûne manqué (qada et fidya)",
        content:
          "Tout jour de jeûne manqué pour une raison valable - maladie, voyage, menstrues, grossesse ou allaitement - doit être rattrapé (qada) par un jour de jeûne équivalent, à accomplir avant l'arrivée du Ramadan suivant. Ce rattrapage n'a pas besoin d'être consécutif ni immédiat : il peut être réparti sur l'année selon les possibilités de la personne concernée.\n\nSi ce rattrapage est reporté sans excuse valable au-delà du Ramadan suivant, trois des quatre écoles juridiques (malikite, shafi'ite et hanbalite) considèrent qu'un fidya - une compensation alimentaire équivalant généralement à nourrir une personne dans le besoin - doit s'ajouter pour chaque jour ainsi retardé, en plus du jeûne à rattraper. L'école hanafite ne retient pas cette obligation supplémentaire, considérant que le qada seul suffit quel que soit le délai.\n\nLe fidya existe également, de manière distincte, pour les personnes durablement incapables de jeûner - en raison d'une maladie chronique ou d'un âge avancé - qui peuvent alors nourrir un pauvre pour chaque jour non jeûné, sans obligation de rattrapage ultérieur.",
        keyTakeaways: [
          "Un jour de jeûne manqué pour raison valable doit être rattrapé (qada) avant le Ramadan suivant.",
          "Trois écoles sur quatre ajoutent un fidya en cas de retard injustifié au-delà du Ramadan suivant.",
          "Un fidya distinct existe pour les personnes durablement incapables de jeûner.",
        ],
        references: [
          { label: "Comparateur : qada et fidya", url: "/fiqh/qada-et-fidya" },
        ],
      },
      {
        order: 4,
        title: "La Zakat : calcul et biens concernés",
        content:
          "La zakat, troisième pilier de l'Islam, est une aumône obligatoire prélevée annuellement sur certains biens dépassant un seuil minimal (nisab) et détenus depuis une année lunaire complète (hawl). Les biens principalement concernés sont l'or, l'argent, les liquidités, les biens de commerce, ainsi que certaines productions agricoles et le bétail, chacun avec ses propres modalités de calcul.\n\nPour l'or et l'argent, le taux généralement retenu est de 2,5 % de la valeur totale détenue au-delà du nisab. La question des bijoux à usage personnel fait toutefois l'objet d'une divergence notable : l'école hanafite considère qu'ils restent soumis à la zakat comme tout autre or ou argent, tandis que les trois autres écoles en exemptent généralement les bijoux destinés à un usage personnel licite.\n\nLa zakat n'est pas une aumône laissée à la discrétion du donateur quant à son montant : huit catégories de bénéficiaires sont explicitement mentionnées dans le Coran (sourate At-Tawba, 9:60), parmi lesquelles les personnes dans le besoin, les nécessiteux, les collecteurs de la zakat elle-même, et plusieurs autres catégories précisément définies.",
        keyTakeaways: [
          "La zakat est due sur certains biens dépassant un seuil (nisab) détenu depuis un an lunaire (hawl).",
          "Le taux généralement retenu pour l'or et l'argent est de 2,5 %.",
          "Le statut des bijoux à usage personnel varié selon les écoles juridiques.",
        ],
        references: [
          { label: "Concept : Zakat", url: "/concepts/zakat" },
          { label: "Comparateur : la zakat sur les bijoux", url: "/fiqh/zakat-sur-les-bijoux" },
        ],
      },
      {
        order: 5,
        title: "La Zakat al-Fitr : à qui, quand et comment",
        content:
          "Distincte de la zakat annuelle sur les biens, la zakat al-fitr est une aumône spécifique versée à l'occasion de la fin du mois de Ramadan, avant la prière de l'Aïd al-Fitr. Elle est due par chaque musulman disposant de moyens suffisants, pour lui-même et pour les personnes à sa charge, quel que soit leur âge.\n\nSon montant correspond traditionnellement à une mesure déterminée de nourriture de base (dattes, orge, riz ou l'équivalent selon la région), et non à un pourcentage d'un patrimoine. Sur la question de savoir si elle peut être versée sous forme de valeur monétaire équivalente plutôt qu'en nourriture, les écoles divergent : l'école hanafite l'autorise, tandis que les trois autres écoles exigent un versement en nature.\n\nCette aumône a une double finalité rapportée dans la tradition prophétique : purifier le jeûneur des manquements éventuels commis durant le mois de Ramadan, et permettre aux personnes dans le besoin de célébrer la fête de l'Aïd dans de bonnes conditions - d'où l'importance de la verser avant la prière de l'Aïd plutôt qu'après.",
        keyTakeaways: [
          "La zakat al-fitr est due à la fin du Ramadan, pour soi-même et les personnes à charge.",
          "Son montant correspond à une mesure de nourriture de base, versée en nature ou en valeur selon les écoles.",
          "Elle visé à la fois à purifier le jeûneur et à permettre aux nécessiteux de célébrer l'Aïd.",
        ],
        references: [
          { label: "Comparateur : zakat al-fitr, nourriture ou équivalent monétaire", url: "/fiqh/zakat-al-fitr-nature" },
        ],
      },
      {
        order: 6,
        title: "Sadaqah : la charité volontaire au-delà de la zakat",
        content:
          "Au-delà de la zakat, obligation calculée et encadrée, la tradition islamique encourage largement la sadaqah, l'aumône volontaire, sans montant ni fréquence fixés. Elle peut être versée à tout moment de l'année, à toute personne dans le besoin, croyante ou non, et dans la mesure choisie par le donateur.\n\nLa notion de sadaqah dépasse le seul don matériel : un hadith rapporte que même un sourire adressé à autrui, une parole bienveillante, ou le simple fait d'écarter un obstacle du chemin des passants, constituent une forme de sadaqah. Cette conception élargie fait de la charité une disposition du cœur accessible à tous, indépendamment des moyens financiers de chacun.\n\nLe mois de Ramadan est traditionnellement associé à une intensification de la sadaqah, la tradition prophétique rapportant que la générosité du Prophète ﷺ était à son maximum durant ce mois. Elle s'inscrit ainsi dans la continuité du jeûne et de la zakat comme troisième dimension, volontaire celle-ci, de la générosité recommandée en Islam.",
        keyTakeaways: [
          "La sadaqah est une aumône volontaire, sans montant ni fréquence fixés, distincte de la zakat.",
          "Elle englobe des gestes non financiers : sourire, parole bienveillante, aide concrète à autrui.",
          "Le Ramadan est traditionnellement associé à une intensification de la générosité.",
        ],
        references: [
          { label: "Concept : Sadaqah", url: "/concepts/sadaqah" },
          { label: "Concept : Rahma", url: "/concepts/rahma" },
        ],
      },
    ],
  },
  {
    title: "La vie du Prophète ﷺ (Sira)",
    slug: "sira",
    level: "intermediate",
    description: "Un parcours chronologique complet à travers la vie du Prophète Muhammad ﷺ, de La Mecque à Médine, en s'appuyant sur la chronologie sourcée de cette plateforme.",
    lessons: [
      {
        order: 1,
        title: "Enfance et jeunesse : un orphelin devenu \"Al-Amin\"",
        content:
          "Muhammad ibn Abdillah naît à La Mecque vers 570, l'année traditionnellement appelée \"Année de l'Éléphant\". Orphelin de père avant sa naissance puis de mère vers l'âge de six ans, il est élevé successivement par son grand-père Abd al-Muttalib puis par son oncle Abu Talib, chef respecté du clan des Banu Hashim mais de condition modeste.\n\nCette enfance marquée par la perte précoce de ses deux parents ne l'empêche pas de se forger, en grandissant, une réputation exceptionnelle d'honnêteté et de fiabilité au sein de la société mecquoise, où il est surnommé \"Al-Amin\" (le digne de confiance) bien avant le début de sa mission prophétique. C'est cette réputation qui conduit une riche marchande, Khadija, à lui confier la gestion de ses caravanes commerciales, puis à lui proposer le mariage alors qu'il a environ vingt-cinq ans - une union heureuse et monogame qui durera jusqu'à la mort de Khadija, vingt-cinq ans plus tard.\n\nCes années de jeunesse, largement silencieuses dans les sources sur le plan religieux, dessinent néanmoins le portrait d'un homme intègre, réfléchi et déjà porté à la méditation solitaire - une disposition qui le conduira, à l'approche de la quarantaine, à se retirer régulièrement dans la grotte de Hira.",
        keyTakeaways: [
          "Orphelin très jeune, Muhammad ﷺ est élevé par son grand-père puis son oncle Abu Talib.",
          "Il est surnommé \"Al-Amin\" (le digne de confiance) pour son intégrité, bien avant la révélation.",
          "Son mariage avec Khadija, initié par la confiance qu'elle plaçait en lui, dure vingt-cinq ans.",
        ],
        references: [{ label: "Événement : Naissance du Prophète ﷺ", url: "/history/event/naissance-du-prophete" }],
      },
      {
        order: 2,
        title: "Le début de la révélation à la grotte de Hira",
        content:
          "Vers l'âge de quarante ans, Muhammad ﷺ prend l'habitude de se retirer périodiquement dans la grotte de Hira, sur le mont An-Nour près de La Mecque, pour y méditer loin de l'agitation de la ville. C'est là, en l'an 610, que la tradition situé le premier événement de la révélation : l'ange Jibril (Gabriel) lui apparaît et lui ordonne \"Iqra\" (\"Lis\" ou \"Récite\"), correspondant aux premiers versets de la sourate Al-Alaq.\n\nBouleversé par cette expérience inédite, il redescend tremblant auprès de Khadija, qui le rassure et le soutient sans hésitation - un soutien immédiat et inconditionnel qui en fait, selon la tradition unanime, la toute première personne à croire en sa mission. Après une interruption de la révélation qui plonge le Prophète ﷺ dans l'incertitude, celle-ci reprend et se poursuivra, par fragments, sur environ vingt-trois années.\n\nLes tout premiers convertis à l'Islam - Khadija, Ali (son jeune cousin), Abu Bakr (son ami proche) et Zayd ibn Haritha (son affranchi) - marquent le début d'une phase de prédication discrète, limitée au cercle familial et amical le plus proche, qui durera environ trois ans avant l'ordre de prêcher publiquement.",
        keyTakeaways: [
          "La révélation débute vers 610, dans la grotte de Hira, par l'ordre \"Iqra\" transmis par l'ange Jibril.",
          "Khadija est traditionnellement la première personne à croire en la mission du Prophète ﷺ.",
          "Une phase de prédication discrète, limitée aux proches, précède l'appel public.",
        ],
        references: [
          { label: "Événement : Début de la Révélation", url: "/history/event/debut-revelation" },
          { label: "Concept : Wahy (Révélation)", url: "/concepts/wahy" },
        ],
      },
      {
        order: 3,
        title: "La prédication publique et les persécutions à La Mecque",
        content:
          "Après environ trois années de prédication discrète, le Prophète ﷺ reçoit l'ordre de proclamer publiquement son message d'unicité divine (tawhid) et d'abandon du culte des idoles - une remise en cause frontale de l'ordre religieux, social et économique bâti autour de la Kaaba, alors sanctuaire polythéiste majeur de la péninsule. L'opposition de plusieurs chefs de Quraych s'intensifie rapidement : moqueries, boycott économique et social du clan protecteur, puis persécutions physiques directes visant en priorité les premiers musulmans dépourvus de protection tribale forte.\n\nDes esclaves ou affranchis comme Bilal ibn Rabah subissent des tortures particulièrement sévères pour avoir refusé de renier leur foi, tandis que le Prophète ﷺ lui-même, protégé par le statut de son oncle Abu Talib au sein du clan des Banu Hashim malgré le refus de celui-ci de se convertir, échappe aux pires violences physiques sans être épargné par l'hostilité générale.\n\nFace à l'intensification des persécutions, une partie des premiers musulmans les plus vulnérables reçoit le conseil d'émigrer temporairement vers le royaume chrétien d'Aksoum, en Abyssinie, dont le souverain est réputé pour sa justice - un épisode qui illustre, dès les tout premiers temps de l'Islam, une relation pacifique recherchée avec une autorité religieuse différente.",
        keyTakeaways: [
          "L'appel public au tawhid provoque une opposition croissante des chefs de Quraych.",
          "Les premiers musulmans sans protection tribale, comme Bilal ibn Rabah, subissent des persécutions sévères.",
          "Une partie des croyants émigre temporairement vers l'Abyssinie chrétienne, accueillie pacifiquement.",
        ],
        references: [
          { label: "Événement : Prédication publique à La Mecque", url: "/history/event/predication-publique" },
          { label: "Événement : Émigration en Abyssinie", url: "/history/event/emigration-abyssinie" },
        ],
      },
      {
        order: 4,
        title: "L'Année de la Tristesse et le voyage nocturne",
        content:
          "Vers 619, en l'espace de quelques mois, le Prophète ﷺ perd deux de ses soutiens les plus proches : Khadija, sa première épouse et première croyante, puis Abu Talib, son oncle protecteur malgré son propre refus de se convertir. Cette double perte fragilise sensiblement sa position à La Mecque, la protection tribale qu'assurait Abu Talib s'estompant avec sa mort ; un voyage de recherche de soutien à Ta'if se solde peu après par un rejet particulièrement hostile de la population locale.\n\nC'est dans ce contexte de grande difficulté que la tradition islamique situé un événement d'une importance théologique majeure : le voyage nocturne et l'ascension (Isra wal Mi'raj), au cours duquel le Prophète ﷺ est transporté en une seule nuit de La Mecque à Jérusalem, puis élevé à travers les cieux, où les cinq prières quotidiennes sont instituées.\n\nCet épisode, survenu à un moment de grande épreuve personnelle, est traditionnellement lu comme un réconfort divin autant que comme un événement fondateur, établissant un lien spirituel durable entre La Mecque, Médine et Jérusalem qui structure encore aujourd'hui la géographie sacrée de l'Islam.",
        keyTakeaways: [
          "La mort de Khadija et d'Abu Talib, en 619, fragilise la position du Prophète ﷺ à La Mecque.",
          "Le voyage nocturne (Isra) le conduit de La Mecque à Jérusalem, puis à une ascension à travers les cieux (Mi'raj).",
          "La prière rituelle (salah) cinq fois par jour est instituée lors de cet événement.",
        ],
        references: [
          { label: "Événement : Année de la Tristesse", url: "/history/event/annee-de-la-tristesse" },
          { label: "Événement : Voyage nocturne et Ascension", url: "/history/event/isra-wal-miraj" },
        ],
      },
      {
        order: 5,
        title: "L'Hégire : de La Mecque à Médine",
        content:
          "Lors du pèlerinage annuel, des habitants de Yathrib (future Médine) rencontrent le Prophète ﷺ au défilé d'Aqaba et concluent avec lui, en deux étapes successives, un engagement d'accueil et de protection - les serments d'Aqaba - qui ouvrent la voie à l'installation d'une communauté musulmane organisée hors de La Mecque.\n\nFace à un projet d'assassinat fomenté par des chefs de Quraych inquiets de cette nouvelle base, le Prophète ﷺ quitte La Mecque avec Abu Bakr, laissant Ali dormir dans son lit pour couvrir leur départ. Après une halte dans la grotte de Thawr pour échapper à leurs poursuivants, les deux hommes rejoignent Yathrib, rebaptisée Médine (\"la Ville [du Prophète]\") - un événement, l'Hégire (Hijra), qui marque le point de départ du calendrier musulman en l'an 622.\n\nÀ Médine, le Prophète ﷺ organise la première communauté musulmane structurée, encadrant notamment ses relations avec les différentes tribus juives de la ville à travers un document fondateur connu sous le nom de \"Constitution de Médine\", qui établit un cadre de coexistence entre les différentes composantes de la cité.",
        keyTakeaways: [
          "Les serments d'Aqaba, conclus avec des habitants de Yathrib, ouvrent la voie à l'installation à Médine.",
          "L'Hégire de 622 marque le point de départ du calendrier musulman.",
          "La \"Constitution de Médine\" organise la coexistence entre musulmans et tribus juives de la ville.",
        ],
        references: [
          { label: "Événement : Serments d'Aqaba", url: "/history/event/serments-aqaba" },
          { label: "Événement : Hégire vers Médine", url: "/history/event/hegire" },
        ],
      },
      {
        order: 6,
        title: "Badr, Uhud et le Fossé : les grandes batailles",
        content:
          "En 624, alors qu'ils tentent d'intercepter une caravane marchande de Quraych, environ trois cents musulmans de Médine affrontent une armée mecquoise bien plus nombreuse près du puits de Badr. Cette première confrontation militaire majeure se solde par une victoire musulmane inattendue, présentée dans le Coran comme un signe du soutien divin et devenue un repère central de la mémoire islamique.\n\nUn an plus tard, à Uhud, les Mecquois reviennent en force venger leur défaite : favorable aux musulmans dans un premier temps, la bataille bascule lorsqu'un groupe d'archers quitte sa position stratégique pour participer au butin, permettant à la cavalerie mecquoise de prendre les musulmans à revers. Le Prophète ﷺ est blessé et plusieurs compagnons, dont son oncle Hamza, sont tués - un épisode généralement lu comme une leçon sur la discipline plutôt que comme une défaite décisive.\n\nEn 627, une coalition menée par les Quraych assiège Médine avec une force considérable ; sur suggestion de Salman al-Farisi, compagnon d'origine perse, les musulmans creusent un fossé défensif (khandaq) autour des zones vulnérables de la ville, tactique alors inhabituelle qui rend l'assaut de la cavalerie ennemie inefficace et contraint la coalition à se retirer sans combat décisif.",
        keyTakeaways: [
          "Badr (624) est la première grande victoire militaire musulmane, présentée comme un signe divin.",
          "Uhud (625) illustre l'importance de la discipline face à la tentation du butin.",
          "Le Fossé (627), creusé sur suggestion de Salman al-Farisi, met en échec un siège coalisé de Médine.",
        ],
        references: [
          { label: "Événement : Bataille de Badr", url: "/history/event/bataille-de-badr" },
          { label: "Événement : Bataille d'Uhud", url: "/history/event/bataille-d-uhud" },
          { label: "Événement : Bataille du Fossé", url: "/history/event/bataille-du-fosse" },
        ],
      },
      {
        order: 7,
        title: "Hudaybiyya et la conquête pacifique de La Mecque",
        content:
          "En 628, parti avec environ mille quatre cents compagnons pour accomplir la 'umra et non pour combattre, le Prophète ﷺ est arrêté par les Quraych à Hudaybiyya, aux abords de La Mecque. Après négociation, un traité de trêve de dix ans est conclu : les musulmans acceptent de rebrousser chemin cette année-là, mais obtiennent le droit d'effectuer le pèlerinage l'année suivante ainsi qu'une reconnaissance politique implicite de leur communauté - un accord perçu par certains compagnons comme désavantageux sur le moment, mais présenté dans le Coran comme une \"victoire manifeste\" ayant permis à l'Islam de se diffuser largement durant la période de paix qui suit.\n\nCette trêve est rompue en 630 lorsqu'une tribu alliée aux Mecquois attaque une tribu alliée aux musulmans ; le Prophète ﷺ marche alors sur La Mecque à la tête d'une force importante. La ville se rend avec peu de résistance, et le Prophète ﷺ y entre en accordant une amnistie générale, y compris à nombre de ses anciens persécuteurs - une clémence largement soulignée dans la tradition islamique comme l'un des épisodes les plus marquants de sa vie.\n\nIl fait alors détruire les idoles entourant et à l'intérieur de la Kaaba, restituant le sanctuaire, selon la croyance islamique, à sa vocation originelle de lieu de culte du Dieu unique associée à Ibrahim et Isma'il.",
        keyTakeaways: [
          "Le traité de Hudaybiyya (628), désavantageux en apparence, permet une diffusion pacifique de l'Islam.",
          "La conquête de La Mecque (630) se fait avec très peu de résistance et se conclut par une amnistie générale.",
          "Les idoles de la Kaaba sont détruites, restituant le sanctuaire à l'adoration du Dieu unique.",
        ],
        references: [
          { label: "Événement : Traité de Hudaybiyya", url: "/history/event/traite-hudaybiyya" },
          { label: "Événement : Conquête de La Mecque", url: "/history/event/conquete-de-la-mecque" },
        ],
      },
      {
        order: 8,
        title: "Le Pèlerinage d'Adieu et le décès du Prophète ﷺ",
        content:
          "Quelques mois avant sa mort, en l'an 632, le Prophète ﷺ effectue son unique pèlerinage complet à La Mecque depuis l'Hégire, accompagné d'un très grand nombre de musulmans. À cette occasion, il prononce le célèbre Sermon d'Adieu, dans lequel il rappelle des principes fondamentaux restés au cœur de l'éthique islamique : l'égalité entre les croyants au-delà de toute origine ethnique, l'interdiction de l'usure et de la vengeance tribale, les droits et devoirs réciproques entre époux, et l'appel pressant à transmettre fidèlement son message aux générations futures.\n\nPeu après ce pèlerinage, le Prophète ﷺ tombe malade et décède à Médine, dans les appartements de son épouse Aisha, où il est enterré. Sa disparition plonge la jeune communauté musulmane dans un choc profond ; selon la tradition, Abu Bakr rassure les compagnons en rappelant que si Muhammad ﷺ est mort comme tout être humain, le message qu'il a transmis, lui, demeure.\n\nSa mort ouvre immédiatement la question de la succession à la tête de la communauté, résolue par la désignation d'Abu Bakr comme premier calife - un événement qui marque à la fois la fin de la Sira et le début de la période rashidun, développée dans la section Histoire de cette plateforme.",
        keyTakeaways: [
          "Le Sermon d'Adieu (632) rappelle des principes fondamentaux d'égalité et d'éthique sociale.",
          "Le Prophète ﷺ décède à Médine peu après, laissant un message que la communauté s'engage à transmettre.",
          "Sa mort ouvre la question de la succession, résolue par la désignation d'Abu Bakr comme premier calife.",
        ],
        references: [
          { label: "Événement : Pèlerinage d'Adieu", url: "/history/event/pelerinage-d-adieu" },
          { label: "Événement : Décès du Prophète ﷺ", url: "/history/event/deces-du-prophete" },
          { label: "Période : Califat Rashidun", url: "/history/rashidun" },
        ],
      },
    ],
  },
];

export async function seedLearning(db: Database): Promise<void> {
  let pathCount = 0;
  let lessonCount = 0;

  for (const p of PATHS) {
    const [path] = await db
      .insert(learningPaths)
      .values({ title: p.title, slug: p.slug, level: p.level, description: p.description })
      .onConflictDoUpdate({
        target: learningPaths.slug,
        set: { title: p.title, level: p.level, description: p.description },
      })
      .returning();
    pathCount++;

    for (const lesson of p.lessons) {
      // Upsert manuel par (pathId, order) : pas de contrainte unique dédiée,
      // on vérifie l'existence avant d'insérer pour rester idempotent.
      const existingLesson = await db.query.learningLessons.findFirst({
        where: (l, { and, eq: eqOp }) => and(eqOp(l.pathId, path.id), eqOp(l.order, lesson.order)),
      });
      const values = {
        title: lesson.title,
        content: lesson.content,
        keyTakeaways: lesson.keyTakeaways,
        references: lesson.references,
        isPublished: true,
      };
      if (existingLesson) {
        await db.update(learningLessons).set(values).where(eq(learningLessons.id, existingLesson.id));
      } else {
        await db.insert(learningLessons).values({ pathId: path.id, order: lesson.order, ...values });
      }
      lessonCount++;
    }
  }

  console.log(`Parcours: ${pathCount} parcours, ${lessonCount} leçons seedes.`);
}
