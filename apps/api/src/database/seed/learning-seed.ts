import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { learningLessons, learningPaths } from "../schema";

/**
 * Parcours d'apprentissage deterministes (aucune IA). Chaque lecon est un
 * véritable contenu pedagogique redige (plusieurs paragraphes), avec des
 * points clés a retenir et des références internes citees en contexte -
 * jamais un simple bouton de redirection vers une autre page.
 *
 * Les lecons melangent volontairement piliers, croyance, vie du Prophète ﷺ,
 * ethique (akhlaq) et étude directe de sourates plutôt que de regrouper le
 * contenu par categorie : l'objectif est un parcours de connaissance
 * religieuse integree, pas une simple serie d'articles sur le Coran.
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
    description: "Croyance, piliers, éthique prophétique et premières sourates - un parcours integre, pas seulement une lecture du Coran.",
    lessons: [
      {
        order: 1,
        title: "Qu'est-ce que l'Islam ?",
        content:
          "Le mot \"Islam\" vient de la racine arabe s-l-m, qui exprime à la fois l'idee de soumission et celle de paix (salam). L'Islam se définit ainsi comme la soumission consciente et volontaire à Dieu, l'Unique créateur de l'univers, et par extension la paix intérieure qui découle de cette soumission.\n\nL'Islam se présente comme la continuation et l'aboutissement d'un même message monotheiste transmis à l'humanite par une longue chaine de prophètes - d'Adam a Muhammad ﷺ, en passant par Nuh, Ibrahim, Musa et Isa. Ce message central est le tawhid : l'unicité absolue de Dieu, sans associe ni intermédiaire nécessaire entre le croyant et son Créateur.\n\nContrairement à une pratique cantonnee au rituel, l'Islam se concoit traditionnellement comme un \"din\", un mode de vie complet englobant la croyance, le culte, l'éthique personnelle et les relations sociales. C'est cette vision intégrale qui explique la structure de ce parcours : croyance, pratique, étude directe du Coran et exemple prophétique s'y succèdent plutôt que d'être traités separement.",
        keyTakeaways: [
          "\"Islam\" signifie soumission à Dieu et partage la racine du mot \"paix\" (salam).",
          "Le tawhid, l'unicité de Dieu, est le fondement de toute la pratique islamique.",
          "L'Islam se présente comme la continuite du message monotheiste des prophètes anterieurs.",
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
          "Un hadith rapporte par Al-Bukhari et Muslim, connu comme le \"hadith de Jibril\", organise la religion en trois niveaux complementaires. Un homme - identifie plus tard comme l'ange Gabriel sous forme humaine - interroge le Prophète ﷺ successivement sur l'islam, l'iman et l'ihsan.\n\nL'islam y designe la soumission pratique : l'attestation de foi, la prière, l'aumone, le jeune et le pelerinage - les actes extérieurs observables. L'iman designe la croyance intérieure : les six articles de foi (Dieu, les anges, les livres, les messagers, le Jour dernier, le décret divin). L'ihsan, enfin, designe le degré le plus élevé : \"adorer Dieu comme si tu Le voyais, et si tu ne Le vois pas, sache que Lui te voit\".\n\nCes trois niveaux ne sont pas des etapes que l'on quitte l'une après l'autre, mais des dimensions simultanees d'une même pratique : le geste sans la croyance serait vide de sens, la croyance sans le geste resterait abstraite, et l'ensemble sans la sincérité (ihsan) resterait mecanique.",
        keyTakeaways: [
          "Le hadith de Jibril structure la religion en trois niveaux : islam (pratique), iman (croyance), ihsan (excellence spirituelle).",
          "Ces trois dimensions sont complementaires, non successives.",
          "L'ihsan est présente comme le degré le plus élevé de la pratique religieuse.",
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
          "Le Coran est, pour les musulmans, la parole de Dieu révélée au Prophète ﷺ sur environ vingt-trois ans, transmise oralement puis mise par ecrit et standardisee sous le califat d'Uthman. Il comprend 114 sourates de longueur très variable, classees dans le mushaf non par ordre chronologique mais globalement de la plus longue à la plus courte.\n\nChaque sourate est traditionnellement qualifiée de mecquoise ou medinoise selon la période de sa révélation, ce qui influence souvent ses thèmes : fondements de la foi et recits prophetiques pour les sourates mecquoises, législation et vie communautaire pour les medinoises. Le texte arabe fait l'objet d'une transmission particulièrement rigoureuse, récitée et memorisee intégralement par des millions de personnes à travers le monde.\n\nSur cette plateforme, chaque verset est accompagne de son texte arabe, de plusieurs traductions attribuees à leurs auteurs, et de plusieurs tafsirs, permettant d'en étudier à la fois la lettre et l'interprétation. Les prochaines lecons de ce parcours reviendront regulierement sur des sourates precises, plutôt que de traiter le Coran comme un theme unique et abstrait.",
        keyTakeaways: [
          "Le Coran comprend 114 sourates, classees globalement par longueur decroissante.",
          "Chaque sourate est qualifiée de mecquoise ou medinoise selon sa période de révélation.",
          "Le texte fait l'objet d'une transmission orale et ecrite particulièrement rigoureuse.",
        ],
        references: [{ label: "Lire le Coran", url: "/quran" }],
      },
      {
        order: 4,
        title: "Étude de sourate : Al-Fatiha, l'ouverture",
        content:
          "Al-Fatiha (\"l'Ouverture\") est la première sourate du Coran, composee de sept versets. Sourate mecquoise, elle est unique par sa fonction : elle est récitée intégralement dans chacun des rak'at de la prière rituelle, ce qui en fait le passage coranique le plus répété quotidiennement par tout musulman pratiquant.\n\nLa sourate s'ouvre par la basmala (\"Au nom de Dieu, le Tout Misericordieux, le Tres Misericordieux\"), puis loue Dieu comme \"Seigneur des mondes\", Misericordieux et Maitre du Jour du Jugement. Les versets suivants marquent le passage de la louange à la supplication : le croyant affirme n'adorer et ne demander secours qu'à Dieu seul, avant de formuler l'unique demande explicite de la sourate - être guide sur le \"droit chemin\", celui des gens que Dieu a combles de Ses bienfaits, et non celui de ceux qui ont encouru Sa colere ou se sont egares.\n\nLes commentateurs classiques soulignent que cette sourate condense, en sept versets, l'ensemble de la relation entre le croyant et Dieu : reconnaissance de Sa seigneurie, de Sa misericorde, de Son autorite sur le jugement final, engagement exclusif dans l'adoration, et demande de guidance - ce qui explique qu'elle soit parfois designee comme \"la mere du Livre\" (Umm al-Kitab).",
        keyTakeaways: [
          "Al-Fatiha comprend sept versets et est récitée dans chaque rak'a de la prière.",
          "Elle passe de la louange de Dieu à une demande explicite de guidance sur le droit chemin.",
          "Elle est parfois appelée \"la mere du Livre\" pour sa fonction de synthese.",
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
          "La shahada (\"attestation\") est le premier des cinq piliers et la porte d'entree dans l'Islam. Elle consiste a témoigner, avec conviction intérieure, qu'\"il n'y a de divinite [digne d'adoration] que Dieu, et que Muhammad est Son messager\" (la ilaha illa Allah, Muhammadun rasulu Allah).\n\nCette formule condense les deux piliers de la foi islamique : le tawhid (l'unicité exclusive de Dieu dans l'adoration) et la reconnaissance de la prophétie de Muhammad ﷺ, dernier maillon d'une chaine prophétique. Prononcer sincèrement cette attestation, en presence de témoins si l'on se convertit, suffit theologiquement a faire entrer une personne dans l'Islam.\n\nLa shahada n'est cependant pas qu'une formule initiale : elle est répétée quotidiennement dans l'appel à la prière (adhan) et au sein même de la prière, rappelant en permanence au croyant le fondement de sa pratique.",
        keyTakeaways: [
          "La shahada comprend deux temoignages : l'unicité de Dieu et la prophétie de Muhammad ﷺ.",
          "Elle est à la fois la porte d'entree dans l'Islam et une formule répétée quotidiennement.",
        ],
        references: [{ label: "Concept : Tawhid", url: "/concepts/tawhid" }],
      },
      {
        order: 6,
        title: "Akhlaq : la sincérité (sidq) à l'exemple du Prophète ﷺ",
        content:
          "Avant même le debut de sa mission prophétique, Muhammad ﷺ etait connu à La Mecque sous le surnom d'\"Al-Amin\" (le digne de confiance) tant sa veracite et son honnetete etaient reconnues, y compris par ceux qui deviendront plus tard ses adversaires les plus feroces. Cette reputation n'etait pas accidentelle : elle refletait une exigence de sidq (veracite) que la tradition islamique présente comme une vertu fondamentale, non reservee aux grandes occasions mais pratiquee dans chaque parole et chaque engagement du quotidien.\n\nLe sidq va au-dela du simple fait de ne pas mentir : il implique une coherence complete entre ce que l'on pense, ce que l'on dit et ce que l'on fait. Le Coran (sourate At-Tawba, 9:119) associe directement la veracite à la compagnie des gens sinceres, et plusieurs hadiths rapportent que la veracite conduit à la piété, tandis que le mensonge conduit à la transgression.\n\nUn episode celebre illustre cette reputation : lors de la reconstruction de la Kaaba, les tribus de La Mecque, sur le point de s'affronter pour l'honneur de placer la Pierre Noire, choisirent d'un commun accord de s'en remettre au jugement du premier homme qui entrerait dans l'enceinte - et ce fut Muhammad, encore jeune homme, dont l'integrite faisait deja consensus bien avant la révélation.",
        keyTakeaways: [
          "Muhammad ﷺ etait surnomme \"Al-Amin\" (le digne de confiance) des avant sa mission prophétique.",
          "Le sidq (veracite) exige une coherence entre pensee, parole et action, pas seulement l'absence de mensonge.",
          "L'episode de la Pierre Noire illustre une reputation d'integrite reconnue par tous, y compris ses futurs adversaires.",
        ],
        references: [{ label: "Concept : Sidq", url: "/concepts/sidq" }],
      },
      {
        order: 7,
        title: "La Salah : la prière quotidienne",
        content:
          "La salah est la prière rituelle, accomplie cinq fois par jour a des horaires determines par la position du soleil : l'aube (fajr), le milieu de journee (dhuhr), l'après-midi (asr), le coucher du soleil (maghrib) et la nuit (isha). Chaque prière comprend un nombre fixe de cycles (rak'at) associant positions corporelles précises - station debout, inclinaison, prosternation - et récitations coraniques.\n\nAu-dela de son aspect rituel, la salah est présentée dans le Coran comme un moyen de discipline spirituelle et de rappel constant de Dieu au fil de la journee. Sa validite est conditionnee par un état de purete rituelle (obtenu par le wudu, les petites ablutions) et par l'orientation vers La Mecque (qibla).\n\nLes modalites précises de certains gestes - comme la position des mains ou le fait de lever les mains a certains moments - font partie des questions ou les quatre écoles juridiques présentent des positions differentes, documentees dans le comparateur de la plateforme.",
        keyTakeaways: [
          "La salah est priée cinq fois par jour a des horaires determines.",
          "Elle nécessite un état de purete rituelle (wudu) et l'orientation vers La Mecque.",
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
          "Muhammad ﷺ nait à La Mecque vers 570, orphelin de pere avant sa naissance et de mère dès l'âge de six ans, élevé par son grand-pere puis son oncle Abu Talib. Vers l'âge de quarante ans, il recoit dans la grotte de Hira la première révélation coranique, marquant le debut de sa mission prophétique.\n\nLa période mecquoise (610-622) est celle d'une predication d'abord discrete, puis publique, centree sur l'unicité de Dieu et l'avertissement du Jugement dernier. Elle se heurte à une opposition croissante des chefs de Quraych, qui y voient une remise en cause de leur ordre social et religieux, la Kaaba etant alors un centre polytheiste majeur.\n\nCette période est marquee par des persecutions, une émigration partielle vers l'Abyssinie chrétienne, et deux pertes personnelles majeures - son epouse Khadija et son oncle protecteur Abu Talib - qui fragilisent sa position et le conduisent, après l'échec d'une demarche auprès de la ville voisine de Ta'if, a chercher un nouvel accueil aupres des habitants de Yathrib.",
        keyTakeaways: [
          "La période mecquoise (610-622) est centree sur le tawhid et le Jugement dernier.",
          "Elle est marquee par une opposition croissante et des persecutions.",
          "Elle se termine par la recherche d'un accueil a Yathrib, future Médine.",
        ],
        references: [{ label: "Histoire : Debut de la Révélation", url: "/history/event/debut-revelation" }],
      },
      {
        order: 9,
        title: "Étude de sourate : Al-Ikhlas, l'unicité pure",
        content:
          "Al-Ikhlas (\"le monotheisme pur\") est une courte sourate mecquoise de quatre versets, souvent citee comme une declaration condensee du tawhid. Un hadith rapporte par Al-Bukhari indique qu'elle \"equivaut au tiers du Coran\" en raison de sa concentration exclusive sur l'unicité divine, theme central de l'ensemble de la révélation.\n\nLa sourate répond, selon la tradition exegetique, a une question posee au Prophète ﷺ sur la nature de Dieu. Elle affirme que Dieu est \"Un\" (Ahad), qu'Il est \"As-Samad\" (Celui dont tous dependent sans qu'Il ne dependent de personne), qu'Il n'a ni engendre ni ete engendre, et que rien ne Lui est semblable ou comparable.\n\nPar sa brievete et sa densite theologique, Al-Ikhlas est l'une des sourates les plus recitees dans la prière quotidienne et les plus memorisees dès le plus jeune âge, servant souvent de première introduction des enfants au concept de tawhid déjà rencontre dans ce parcours.",
        keyTakeaways: [
          "Al-Ikhlas comprend quatre versets et condense le tawhid en une declaration unique.",
          "Un hadith la decrit comme \"equivalente au tiers du Coran\" en raison de sa portée théologique.",
          "Elle nie toute filiation ou ressemblance entre Dieu et Sa creation.",
        ],
        references: [
          { label: "Lire Al-Ikhlas", url: "/quran/112" },
          { label: "Concept : Tawhid", url: "/concepts/tawhid" },
        ],
      },
      {
        order: 10,
        title: "La Zakat : l'aumone purificatrice",
        content:
          "La zakat est une aumone obligatoire, due annuellement par tout musulman dont les biens depassent un seuil minimal (nisab) pendant une année lunaire complete. Le taux le plus connu, applicable à l'epargne monetaire, est de 2,5 %, mais il varie selon la nature des biens (betail, recoltes, commerce...).\n\nLe Coran (sourate At-Tawba, 9:60) précise huit categories de beneficiaires possibles : les pauvres, les necessiteux, ceux qui administrent la collecte, ceux dont le cœur est a rallier, l'affranchissement d'esclaves, les endettes, la cause de Dieu et le voyageur dans le besoin. La zakat n'est donc pas une simple charite facultative mais un droit reconnu aux beneficiaires sur une part déterminée de la richesse du croyant.\n\nLa racine z-k-w évoque à la fois la purification et la croissance : la zakat est concue comme purifiant le reste des biens du donateur tout en favorisant, à l'echelle collective, une forme de redistribution sociale.",
        keyTakeaways: [
          "La zakat est due annuellement sur les biens depassant un seuil minimal (nisab).",
          "Le Coran fixe huit categories de beneficiaires possibles.",
          "Son taux varie selon la nature des biens concernes.",
        ],
        references: [{ label: "Concept : Zakat", url: "/concepts/zakat" }],
      },
      {
        order: 11,
        title: "Akhlaq : la patience (sabr) face à l'épreuve",
        content:
          "Après la mort de son epouse Khadija et de son oncle protecteur Abu Talib, survenues la même année (appelee par la tradition \"l'année de la tristesse\"), le Prophète ﷺ se rendit a Ta'if, ville voisine de La Mecque, dans l'espoir d'y trouver un soutien pour sa predication. Il y fut non seulement rejete, mais insulte et lapide par les habitants et les enfants de la ville, au point de rentrer blesse et epuise.\n\nSelon la tradition, un ange lui proposa alors, sur ordre divin, d'ecraser la ville entre les deux montagnes qui l'encadraient en punition de cet accueil. Le Prophète ﷺ refusa, exprimant l'espoir que, si ce peuple ne le suivait pas, sa descendance pourrait un jour adorer Dieu seul. Cet episode est présente dans la tradition comme l'un des plus hauts exemples de sabr (patience) et de pardon face à une epreuve personnelle severe.\n\nLe sabr, en Islam, ne designe pas une resignation passive mais un effort actif de constance : perseverer dans l'obeissance, s'abstenir du peche malgre la tentation, et endurer l'epreuve sans desespoir ni ressentiment durable. Le Coran promet a ceux qui l'incarnent une recompense \"sans limite\" (sourate Az-Zumar, 39:10).",
        keyTakeaways: [
          "L'episode de Ta'if, survenu après l'année de la tristesse, illustre le sabr et le pardon du Prophète ﷺ.",
          "Il refusa la destruction de la ville, esperant que la descendance de ses habitants finirait par croire.",
          "Le sabr est un effort actif de constance, non une resignation passive.",
        ],
        references: [
          { label: "Concept : Sabr", url: "/concepts/sabr" },
          { label: "Histoire : Année de la tristesse", url: "/history/event/annee-de-la-tristesse" },
        ],
      },
      {
        order: 12,
        title: "Le Sawm : le jeune du Ramadan",
        content:
          "Le sawm consiste a s'abstenir de nourriture, de boisson et de rapports intimes du lever au coucher du soleil. Il est obligatoire durant tout le mois de Ramadan, neuvième mois du calendrier lunaire islamique, période durant laquelle, selon la tradition, la première révélation coranique a été recue par le Prophète ﷺ.\n\nLe Coran (sourate Al-Baqara, 2:183) présente le jeune comme un moyen d'acceder à la piété (taqwa), c'est-a-dire à une conscience accrue de Dieu. Au-dela de la dimension purement physique, le Ramadan est traditionnellement associe à une intensification de la lecture du Coran, de la prière nocturne (tarawih) et de la generosite envers autrui.\n\nCertaines categories de personnes (malades, voyageurs, femmes enceintes ou allaitantes, personnes agees) beneficient d'amenagements - report du jeune ou compensation - dont les modalites précises sont également discutees entre écoles juridiques.",
        keyTakeaways: [
          "Le sawm est obligatoire durant le mois de Ramadan, du lever au coucher du soleil.",
          "Le Coran le présente comme un moyen d'acceder à la taqwa (conscience de Dieu).",
          "Des amenagements existent pour certaines categories de personnes.",
        ],
        references: [{ label: "Concept : Taqwa", url: "/concepts/taqwa" }],
      },
      {
        order: 13,
        title: "Vie du Prophète ﷺ : l'Hegire et la période medinoise",
        content:
          "En 622, le Prophète ﷺ émigré de La Mecque a Yathrib, rebaptisee Médine, événement fondateur appele Hegire (hijra) et point de depart du calendrier islamique. A Médine, il organise la première communauté musulmane structurée, y compris ses relations avec les tribus juives de la ville.\n\nLa période medinoise (622-632) voit plusieurs confrontations militaires avec les Mecquois - Badr, Uhud, le siege du Fosse - jusqu'au traité de treve de Hudaybiyya en 628, puis à la conquête pacifique de La Mecque en 630, marquee par une large amnistie et la destruction des idoles de la Kaaba. Cette période voit aussi la révélation de la plupart des versets a portée législative et sociale.\n\nLe Prophète ﷺ meurt à Médine en 632, peu après son pelerinage d'adieu, laissant une communauté déjà étendue à l'ensemble de la péninsule arabique et une chronologie détaillée, consultable événement par événement dans la section Histoire.",
        keyTakeaways: [
          "L'Hegire (622) marque le debut du calendrier islamique.",
          "La période medinoise voit la structuration de la communauté et plusieurs confrontations majeures.",
          "Elle se termine par la conquête pacifique de La Mecque (630) et le décès du Prophète ﷺ (632).",
        ],
        references: [{ label: "Chronologie complete : Vie du Prophète ﷺ", url: "/history/vie-du-prophete" }],
      },
      {
        order: 14,
        title: "Étude de sourate : Al-Asr, le temps",
        content:
          "Al-Asr (\"le Temps\") est l'une des plus courtes sourates du Coran, composee de seulement trois versets, mais considérée par de nombreux savants comme un resume complet du message islamique. L'imam ash-Shafi'i aurait déclaré que si les hommes ne meditaient que sur cette sourate, elle leur suffirait.\n\nDieu y jure par le temps (al-asr) que l'être humain est \"en perte\", a l'exception de ceux qui reunissent quatre elements : la foi (iman), les bonnes actions (amal salih), le rappel mutuel de la verite, et le rappel mutuel de la patience (sabr). Cette structure en quatre points est souvent présentée comme une feuille de route personnelle et collective : croire ne suffit pas sans agir, et agir individuellement ne suffit pas sans une dimension communautaire de rappel et de soutien mutuel.\n\nLa brievete de la sourate contraste avec la densite de son contenu, ce qui en fait un texte frequemment étudie par les debutants comme synthese accessible de plusieurs notions déjà abordees dans ce parcours : l'iman, la pratique, et le sabr.",
        keyTakeaways: [
          "Al-Asr ne comprend que trois versets mais est considérée comme un resume du message islamique.",
          "Elle identifie quatre conditions pour echapper a la \"perte\" : foi, bonnes actions, rappel de la verite, rappel de la patience.",
          "Sa structure souligne que la foi individuelle doit s'accompagner d'une dimension communautaire.",
        ],
        references: [
          { label: "Lire Al-Asr", url: "/quran/103" },
          { label: "Concept : Sabr", url: "/concepts/sabr" },
        ],
      },
      {
        order: 15,
        title: "Le Hajj : le pelerinage à La Mecque",
        content:
          "Le hajj est le grand pelerinage annuel à La Mecque, obligatoire une fois dans la vie pour tout musulman qui en à la capacite physique et financiere. Il se déroule durant les premiers jours du mois de Dhul-Hijja et comprend une série de rites accomplis sur des lieux precis : circumambulation autour de la Kaaba (tawaf), parcours entre les collines de Safa et Marwa, stationnement sur le mont Arafat, et lapidation symbolique a Mina.\n\nCes rites sont traditionnellement rattaches à l'histoire d'Ibrahim, de son epouse Hajar et de leur fils Isma'il, dont le Coran situe le séjour et l'épreuve à La Mecque. Le hajj est ainsi présente comme la reactualisation d'un épisode fondateur du monotheisme abrahamique.\n\nLe pelerinage se distingue de la 'umra, un pelerinage mineur pouvant être effectue a tout moment de l'année, comprenant certains des mêmes rites mais sans les stations propres au hajj.",
        keyTakeaways: [
          "Le hajj est obligatoire une fois dans la vie, pour qui en à la capacite.",
          "Ses rites sont rattaches à l'histoire d'Ibrahim, Hajar et Isma'il.",
          "La 'umra est un pelerinage mineur distinct, realisable toute l'année.",
        ],
        references: [{ label: "Prophète : Ibrahim", url: "/prophets/ibrahim" }],
      },
      {
        order: 16,
        title: "Akhlaq : la miséricorde (rahma) envers toute la création",
        content:
          "La misericorde (rahma) occupe une place centrale dans l'exemple prophétique, s'etendant bien au-dela des relations humaines. Plusieurs recits rapportent la tendresse du Prophète ﷺ envers les enfants - il interrompait parfois sa prière pour ne pas deranger un enfant agrippe a lui, et s'etonnait publiquement de voir un compagnon n'avoir jamais embrasse ses propres enfants.\n\nCette misericorde s'etendait également aux animaux : plusieurs hadiths rapportent des mises en garde explicites contre la maltraitance animale, et un recit celebre evoque le pardon accorde a une personne pour avoir donne à boire à un chien assoiffe, illustrant que la misericorde envers toute creature est considérée comme un acte meritoire en soi.\n\nLe Coran (sourate Al-Anbiya, 21:107) resume cette dimension en decrivant la mission même du Prophète ﷺ comme \"une misericorde pour l'univers\" (rahmatan lil-alamin) - non pour les seuls croyants, mais pour l'ensemble de la creation. Cette universalite de la rahma en fait, dans la tradition islamique, un principe ethique transversal à toute interaction, humaine ou non.",
        keyTakeaways: [
          "La misericorde prophétique s'etendait aux enfants, aux etrangers et aux animaux, pas seulement aux croyants.",
          "Plusieurs hadiths mettent explicitement en garde contre la maltraitance animale.",
          "Le Coran decrit la mission du Prophète ﷺ comme \"une misericorde pour l'univers\" (21:107).",
        ],
        references: [{ label: "Concept : Rahma", url: "/concepts/rahma" }],
      },
      {
        order: 17,
        title: "Les six piliers de la foi (iman)",
        content:
          "Toujours d'après le hadith de Jibril, la foi (iman) repose sur six croyances : Dieu, Ses anges, Ses livres reveles, Ses messagers, le Jour dernier et le décret divin (qadar). Croire en Dieu implique Son unicité absolue ; croire aux anges reconnaît l'existence d'entites créées chargees de missions spécifiques (comme Jibril, porteur de la révélation) ; croire aux livres reconnaît plusieurs révélations anterieures (Tawrat, Zabur, Injil) dont le Coran est considère comme l'aboutissement et la préservation finale.\n\nCroire aux messagers reconnaît une lignee prophétique commune, de Adam a Muhammad ﷺ ; croire au Jour dernier engage une responsabilité morale des actes dans une perspective post-mortem ; croire au qadar, enfin, reconnaît que Dieu connait et a décrété de toute éternité ce qui adviendra, sans annuler pour autant la responsabilité reelle de l'être humain sur ses choix.\n\nL'articulation précise entre décret divin et libre arbitre humain a fait l'objet de debats théologiques historiques importants, notamment face au mu'tazilisme, developpes plus en détail dans le parcours intermédiaire.",
        keyTakeaways: [
          "Les six piliers de la foi : Dieu, les anges, les livres, les messagers, le Jour dernier, le qadar.",
          "Le Coran est considère comme l'aboutissement et la préservation finale des révélations anterieures.",
          "L'articulation entre décret divin et libre arbitre a fait l'objet de debats théologiques historiques.",
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
          "Un hadith rapporte une parole, un acte ou une approbation attribues au Prophète ﷺ. Chaque hadith comprend en principe une chaine de transmetteurs (isnad) et un contenu (matn), les deux etant examines par les specialistes pour en evaluer la fiabilite.\n\nSix recueils sont traditionnellement consideres comme canoniques chez les sunnites (Kutub as-Sittah) : Sahih al-Bukhari et Sahih Muslim, unanimement reconnus comme les plus authentiques, ainsi que les Sunan d'Abu Dawud, At-Tirmidhi, An-Nasa'i et Ibn Majah, qui detaillent souvent le degré d'authenticité de chaque hadith individuellement.\n\nLes hadiths completent le Coran en précisant, illustrant ou détaillant son application concrete - c'est notamment le cas pour les modalites précises de la prière ou les episodes de sidq, de sabr et de rahma deja rencontres dans ce parcours. Ils constituent, avec le Coran, l'une des deux sources scripturaires majeures de l'Islam.",
        keyTakeaways: [
          "Un hadith comprend une chaine de transmission (isnad) et un contenu (matn).",
          "Six recueils sont consideres comme canoniques chez les sunnites (Kutub as-Sittah).",
          "Les hadiths précisent et completent l'application concrete du Coran.",
        ],
        references: [{ label: "Explorer les hadiths", url: "/hadith" }],
      },
    ],
  },
  {
    title: "Approfondir sa compréhension",
    slug: "intermediaire",
    level: "intermediate",
    description: "Tafsir, fiqh, écoles juridiques, ethique et étude de sourates plus longues - une comprehension integree, avec les madhabs.",
    lessons: [
      {
        order: 1,
        title: "Le tafsir : deux grandes approches",
        content:
          "Le tafsir est la discipline consacree à l'explication du Coran. On distingue traditionnellement le tafsir bi'l-ma'thur (\"par la transmission\"), qui explique le Coran par le Coran lui-même, par la Sunna, ou par les propos rapportes des Compagnons et de leurs successeurs, et le tafsir bi'r-ra'y (\"par l'opinion raisonnee\"), qui mobilise davantage le raisonnement personnel du commentateur, dans le respect des règles de la langue arabe et de la méthodologie exégétique établie.\n\nCes deux approches ne sont pas strictement opposees : la plupart des grands tafsirs combinent les deux, en s'appuyant d'abord sur la transmission disponible avant de recourir au raisonnement pour les points non explicitement traites. La qualite d'un tafsir se juge notamment à la rigueur avec laquelle il articule ces deux dimensions.\n\nCertains tafsirs se concentrent sur l'aspect juridique du texte, d'autres sur sa dimension linguistique, spirituelle ou historique - une diversite d'approches que l'on retrouve dans les differentes éditions disponibles sur cette plateforme.",
        keyTakeaways: [
          "Le tafsir bi'l-ma'thur s'appuie sur la transmission (Coran, Sunna, propos des premieres generations).",
          "Le tafsir bi'r-ra'y mobilise davantage le raisonnement, dans un cadre méthodologique défini.",
          "La plupart des tafsirs de référence combinent les deux approches.",
        ],
        references: [{ label: "Bibliothèque de tafsirs", url: "/tafsir" }],
      },
      {
        order: 2,
        title: "Étude de sourate : Al-Baqara, les premiers versets",
        content:
          "Al-Baqara (\"la Vache\"), plus longue sourate du Coran avec 286 versets, est une sourate medinoise qui aborde un très large spectre de sujets : législation, recits prophetiques, exhortations et fondements de la foi. Ses tout premiers versets (2:1-5) sont particulièrement étudies car ils dressent le portrait des \"muttaqin\" (ceux qui craignent Dieu) censes beneficier pleinement de la guidance du Livre.\n\nCe portrait initial associe la croyance en l'invisible (al-ghayb), l'accomplissement de la prière, la depense en aumone de ce que Dieu leur a accorde, et la croyance en ce qui a été révélé au Prophète ﷺ ainsi qu'aux messagers precedents - reliant ainsi explicitement, dès l'ouverture de la sourate, la foi islamique à la continuite des révélations anterieures déjà abordee dans le parcours d'introduction.\n\nLes versets suivants (2:6-20) présentent, en contraste, trois postures face au message : les croyants sinceres, les mecreants declares, et les hypocrites (munafiqun) dont le Coran denonce le double discours - première apparition dans le texte coranique de cette categorie, qui reviendra frequemment dans les sourates medinoises traitant de la vie de la jeune communauté musulmane.",
        keyTakeaways: [
          "Al-Baqara est la plus longue sourate du Coran (286 versets), de période medinoise.",
          "Ses premiers versets dressent le portrait des \"muttaqin\", ceux qui craignent Dieu.",
          "Elle introduit dès l'ouverture la categorie des hypocrites (munafiqun), centrale dans les sourates medinoises.",
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
          "L'école hanafite, fondée par l'imam Abu Hanifa (80-150 AH) a Kufa, est aujourd'hui l'école sunnite la plus répandue numériquement, notamment en Turquie, en Asie centrale et dans le sous-continent indien. Elle se caracterise par un usage frequent du raisonnement analogique (qiyas) et de la préférence juridique (istihsan) pour traiter les situations non explicitement couvertes par les textes.\n\nL'enseignement d'Abu Hanifa a été transmis et systématisé par ses élèves, notamment Abu Yusuf et Muhammad ash-Shaybani, qui ont largement contribue à la formalisation ecrite de l'école. L'approche hanafite accorde également une place notable à la coutume locale ('urf) dans certains domaines contractuels et commerciaux.",
        keyTakeaways: [
          "L'école hanafite est aujourd'hui l'école sunnite la plus répandue numériquement.",
          "Elle privilegie le qiyas et l'istihsan pour les cas non explicitement traites.",
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
          "Le Coran etablit un lien direct et explicite entre la justice (adl) et l'integrite morale, en insistant sur un point particulièrement exigeant : l'inimitie personnelle envers autrui ne doit jamais conduire à l'injustice envers lui. La sourate Al-Ma'ida (5:8) enjoint ainsi aux croyants de ne pas laisser la haine envers un peuple les empecher d'être equitables, \"car cela est plus proche de la piété\".\n\nCette exigence s'illustre dans la pratique juridique islamique classique par le principe selon lequel un juge doit statuer selon le droit, même en faveur d'un adversaire declare, et par des exemples rapportes de califes ou de savants rendant justice contre leurs propres interets ou relations. L'adl n'est ainsi pas présente comme une vertu abstraite, mais comme une discipline concrete a maintenir précisement lorsque l'emotion ou l'intérêt personnel pousseraient à y deroger.\n\nCette insistance coranique sur la justice \"malgre soi\" complete la comprehension du fiqh abordee dans ce parcours : les règles juridiques deduites par les savants (qiyas, ijma', istihsan...) ne sont pas de simples techniques, mais des outils au service d'un principe ethique supérieur - rendre à chacun son droit, sans distinction d'affection ou d'inimitie.",
        keyTakeaways: [
          "Le Coran (5:8) interdit explicitement que la haine envers autrui conduise à l'injustice a son egard.",
          "L'adl est présentée comme une discipline concrete, particulièrement exigeante face à un adversaire.",
          "Les outils juridiques du fiqh sont au service de ce principe ethique supérieur.",
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
          "Parmi les tafsirs classiques, celui d'Ibn Kathir (VIIIe siècle après l'Hegire) est particulièrement estime pour son usage systématique du Coran et de la Sunna comme première source d'explication, dans la tradition du tafsir bi'l-ma'thur. Plus ancien encore, le tafsir d'At-Tabari (IIIe-IVe siècle) est l'un des plus vastes commentaires complets du Coran, rassemblant un très grand nombre de transmissions.\n\nDes tafsirs modernes et concis, comme At-Tafsir al-Muyassar ou Al-Mukhtasar fi at-Tafsir, ont été produits par des comites de savants contemporains pour rendre le sens du Coran accessible à un large public, souvent traduits en plusieurs langues - une caracteristique qui en fait un bon point d'entree pour l'étude comparee verset par verset.\n\nCette diversite d'éditions, disponibles sur la plateforme, permet de croiser un commentaire classique et détaillé avec un commentaire moderne et synthetique pour un même verset.",
        keyTakeaways: [
          "Ibn Kathir et At-Tabari sont deux références classiques du tafsir bi'l-ma'thur.",
          "Al-Muyassar et Al-Mukhtasar sont des tafsirs modernes, concis et multilingues.",
          "Croiser plusieurs tafsirs permet une lecture plus complete d'un même verset.",
        ],
        references: [{ label: "Éditions de tafsir disponibles", url: "/tafsir" }],
      },
      {
        order: 6,
        title: "L'école malikite",
        content:
          "L'école malikite, fondée par l'imam Malik ibn Anas (93-179 AH) à Médine, s'est particulièrement diffusee au Maghreb, en Afrique de l'Ouest et dans certaines regions du Golfe. Son ouvrage majeur, le Muwatta, est l'un des plus anciens recueils organisant hadiths et positions juridiques par thèmes.\n\nL'école malikite accorde une importance particulière à la pratique vivante des habitants de Médine ('amal ahl al-Madina), considérée comme un témoignage privilegie de la Sunna, la ville ayant été le cadre de vie du Prophète ﷺ et de la première generation de musulmans. Elle mobilise également largement le principe d'intérêt général (maslaha) dans son raisonnement juridique.",
        keyTakeaways: [
          "L'école malikite s'est particulièrement diffusee au Maghreb et en Afrique de l'Ouest.",
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
          "Le fiqh est la discipline juridique islamique : l'ensemble des règles pratiques deduites des sources scripturaires par les savants, à l'aide d'une méthodologie (usul al-fiqh). Il se distingue de la \"charia\" au sens large, qui designe plutôt l'ensemble des principes et valeurs divins consideres immuables, tandis que le fiqh en est l'élaboration humaine, faillible et donc susceptible de varier selon les contextes et les écoles.\n\nCette distinction explique pourquoi il existe plusieurs écoles de fiqh sans que cela remette en cause l'unicité de la charia : les juristes partagent les mêmes sources mais peuvent aboutir a des conclusions differentes selon la méthodologie employee, la force accordee a tel ou tel hadith, ou le contexte social pris en compte.\n\nLe fiqh couvre deux grands domaines : le culte (ibadat), qui regit la relation entre le croyant et Dieu (prière, jeune, zakat...), et les relations sociales (mu'amalat), qui regissent les rapports entre individus (contrats, famille, droit penal...).",
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
          "L'école shafi'ite, fondée par l'imam Muhammad ibn Idris ash-Shafi'i (150-204 AH), est répandue notamment en Égypte, en Asie du Sud-Est, au Yemen et en Afrique de l'Est. Ash-Shafi'i est reconnu pour avoir, avec son ouvrage Ar-Risala, propose la première systématisation rigoureuse de la méthodologie juridique islamique (usul al-fiqh), influencant durablement la manière dont l'ensemble des écoles ulterieures ont structure leur raisonnement.\n\nL'approche shafi'ite se caracterise par une hiérarchisation stricte des sources - Coran, Sunna, consensus (ijma'), puis raisonnement analogique (qiyas) - et par une prudence méthodologique marquee vis-a-vis des outils secondaires moins codifies comme l'istihsan hanafite.",
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
          "Al-Hujurat (\"les Appartements\"), sourate medinoise de dix-huit versets, est parfois designee comme la \"charte de l'éthique sociale\" du Coran, tant elle concentre en un espace reduit des principes regissant les relations entre croyants. Elle s'ouvre par des règles de politesse envers le Prophète ﷺ, avant d'aborder une série de comportements sociaux a eviter.\n\nLe verset 11 interdit la moquerie entre croyants (\"qu'un groupe ne raille pas un autre groupe, il se peut que ce dernier soit meilleur que lui\") ainsi que les surnoms blessants et l'atteinte à la reputation d'autrui. Le verset 12 met en garde contre la suspicion excessive (dhann), l'espionnage des affaires d'autrui, et la medisance (ghiba), comparee de manière frappante au fait de \"manger la chair de son frere mort\" - image déjà rencontree dans l'étude du concept de ghiba.\n\nLe verset 13, l'un des plus cites du Coran sur la question de la diversite humaine, affirme que Dieu a créé les êtres humains en peuples et tribus \"afin qu'ils se connaissent mutuellement\", et que le critere de superiorite auprès de Dieu n'est autre que la piété (taqwa) - non l'origine, la richesse ou le statut social.",
        keyTakeaways: [
          "Al-Hujurat concentre des principes d'éthique sociale : interdiction de la moquerie, de la suspicion et de la medisance.",
          "Le verset 12 compare la medisance au fait de manger la chair de son frere mort.",
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
          "L'école hanbalite, fondée par l'imam Ahmad ibn Hanbal (164-241 AH) a Bagdad, est aujourd'hui predominante en Arabie Saoudite et dans le Golfe. L'imam Ahmad est également célèbre pour son immense recueil de hadiths, le Musnad, et pour avoir resiste, au prix d'emprisonnements, à la pression du pouvoir abbasside durant l'épisode de la mihna concernant la nature du Coran.\n\nL'école hanbalite accorde une importance particulière au hadith authentique, y compris parfois des hadiths faibles preferes à l'opinion personnelle en l'absence de texte plus fort, et se montre généralement prudente vis-a-vis du raisonnement analogique lorsqu'un texte est disponible. Elle est historiquement associee au courant théologique atharite.",
        keyTakeaways: [
          "L'école hanbalite est aujourd'hui predominante en Arabie Saoudite et dans le Golfe.",
          "Ahmad ibn Hanbal a resiste à la pression politique durant l'épisode de la mihna.",
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
          "Malgre son statut de dernier messager de Dieu, le Prophète ﷺ est rapporte dans de nombreux hadiths comme ayant systématiquement refuse tout traitement d'exception : il reparait lui-même ses vetements, trayait ses chevres, s'asseyait parmi ses compagnons sans place reservee au point qu'un visiteur devait parfois demander lequel d'entre eux etait le Prophète, et refusait que l'on se leve en signe de deference excessive a son entree.\n\nCe refus systématique de la deference est mis en regard, dans la tradition, avec la définition du kibr (orgueil) rapportee par Muslim : \"le rejet de la verite et le mepris des gens\". L'orgueil n'est donc pas seulement une question d'attitude exterieure, mais un obstacle spirituel majeur, au point qu'un hadith rapporte qu'\"aucune personne ayant un atome d'orgueil dans le cœur n'entrera au Paradis\".\n\nLe tawadu' (humilite) qui s'oppose au kibr ne consiste pas en une devalorisation de soi, mais en une juste reconnaissance de sa dependance totale envers Dieu et en un respect egal accorde a autrui quel que soit son rang. Cette vertu complete directement la comprehension de l'ihsan et de la sincérité (ikhlas) déjà abordees dans ce parcours : l'humilite protege l'action religieuse de la vanite qui pourrait en corrompre la valeur.",
        keyTakeaways: [
          "Le Prophète ﷺ refusait systématiquement tout traitement d'exception malgre son statut.",
          "Un hadith définit le kibr comme \"le rejet de la verite et le mepris des gens\".",
          "Le tawadu' est une juste reconnaissance de sa dependance envers Dieu, non une devalorisation de soi.",
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
          "Après la période du Prophète ﷺ vient le califat rashidun (632-661), celui des quatre \"califes bien-guidés\" (Abu Bakr, Omar, Uthman, Ali), marque par l'expansion rapide hors de la péninsule arabique et par la compilation definitive du texte coranique sous Uthman.\n\nLui succède le califat omeyyade (661-750, capitale Damas), première dynastie héréditaire, sous lequel debute la conquête de l'Andalousie en 711, puis le califat abbasside (750-1258, capitale Bagdad), associe à l'âge d'or scientifique et culturel islamique, jusqu'à la prise de Bagdad par les Mongols. La presence musulmane en Al-Andalus (péninsule ibérique) se prolonge jusqu'à la chute de Grenade en 1492.\n\nCes périodes sont détaillées sur la plateforme avec leurs événements clés et les sources historiques correspondantes (Tabari, Ibn Kathir), permettant de situer chronologiquement le développement du fiqh, de la théologie et des sciences islamiques evoques dans ce parcours.",
        keyTakeaways: [
          "Le califat rashidun (632-661) voit l'expansion rapide et la compilation du Coran.",
          "Les Omeyyades (Damas) puis les Abbassides (Bagdad) structurent les siècles suivants.",
          "La presence musulmane en Al-Andalus dure de 711 a 1492.",
        ],
        references: [{ label: "Chronologie complete", url: "/history" }],
      },
      {
        order: 13,
        title: "Ash'arisme et Maturidisme",
        content:
          "L'ash'arisme, fonde par Abu al-Hasan al-Ash'ari (260-324 AH), et le maturidisme, fonde par Abu Mansur al-Maturidi (m. 333 AH), sont les deux courants théologiques (aqida) majoritaires dans le sunnisme classique. Tous deux cherchent une voie mediane entre le rationalisme du mu'tazilisme et un litteralisme strict, en utilisant des outils rationnels pour defendre et articuler les croyances plutôt que pour les remettre en cause.\n\nL'ash'arisme, historiquement associe aux écoles shafi'ite et malikite, et le maturidisme, associe à l'école hanafite, partagent l'essentiel de leurs positions théologiques, avec quelques nuances sur le role precis de la raison dans la connaissance du bien et du mal avant même la révélation.\n\nCes deux courants sont presentes sur la plateforme de manière descriptive, sans hiérarchie de \"vérité\" entre eux ni avec les autres courants théologiques.",
        keyTakeaways: [
          "Ash'arisme et maturidisme sont les deux courants théologiques sunnites majoritaires.",
          "Ils cherchent un équilibre entre rationalisme et fidélité aux textes.",
          "Ils sont historiquement associes respectivement aux écoles shafi'ite/malikite et hanafite.",
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
          "L'atharisme, historiquement associe à l'école hanbalite, privilegie l'affirmation directe des textes relatifs aux attributs divins tels qu'ils sont rapportes, sans les interpréter allegoriquement ni chercher a en determiner la modalite précise (bila kayf), evitant ainsi un recours systématique au raisonnement rationnel (kalam).\n\nLe mu'tazilisme, apparu des le IIe siècle après l'Hegire a Bassora, représente à l'inverse le courant le plus rationaliste de la théologie islamique classique, accordant une place centrale à la raison, notamment sur des questions comme la justice divine et le libre arbitre. Influent sous certains califes abbassides, il est aujourd'hui minoritaire mais demeure une référence incontournable de l'histoire intellectuelle islamique.\n\nCes deux courants illustrent, aux deux extrêmes du spectre, la diversite des réponses historiquement apportees à la question du rapport entre raison et révélation.",
        keyTakeaways: [
          "L'atharisme privilegie l'affirmation des textes sans interprétation rationnelle systématique.",
          "Le mu'tazilisme est le courant le plus rationaliste de la théologie islamique classique.",
          "Ces deux courants representent des réponses opposees à la question raison/révélation.",
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
          "L'étude critique du hadith repose sur l'examen conjoint de la chaine de transmission (isnad) et du contenu (matn). L'isnad est évalue selon la continuite de la chaine, la fiabilite et la memoire de chaque rapporteur ; le matn est examine pour verifier l'absence de contradiction avec des textes plus etablis.\n\nCet examen aboutit à une classification en plusieurs degrés : sahih (authentique), hasan (bon, avec une chaine legerement moins forte), da'if (faible) et mawdu' (fabrique). Des savants specialises (muhaddithun), comme Al-Bukhari et Muslim en leur temps, ou Al-Albani plus recemment, ont consacre leur vie a cet examen critique.\n\nCette plateforme rapporte ces classifications telles qu'attribuees à leurs verificateurs - jamais inventees - notamment pour les recueils comme Jami at-Tirmidhi ou Sunan Abu Dawud, qui detaillent le degré de chaque hadith et signalent parfois des divergences d'avis entre savants sur un même texte.",
        keyTakeaways: [
          "L'examen d'un hadith porte sur la chaine de transmission (isnad) et le contenu (matn).",
          "Les hadiths sont classes en degrés : sahih, hasan, da'if, mawdu'.",
          "Ces classifications sont toujours attribuees à leur verificateur, jamais inventees.",
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
          "L'usul al-fiqh (\"racines du fiqh\") est la discipline qui étudie les sources et méthodes permettant de déduire des règles juridiques concretes a partir des textes. Quatre sources sont généralement reconnues par l'ensemble des écoles sunnites : le Coran, première source ; la Sunna, qui précise et complete le Coran ; le consensus des savants (ijma'), lorsqu'il est établi sur une question ; et le raisonnement analogique (qiyas), qui etend une règle connue à un cas similaire non explicitement traité.\n\nL'imam ash-Shafi'i, dans Ar-Risala, est considère comme le premier a avoir systématisé cette hiérarchie et la méthodologie de son application, posant les bases sur lesquelles l'ensemble des écoles ulterieures, y compris hanafite, malikite et hanbalite, ont construit ou affine leur propre approche.\n\nCette hiérarchie commune explique que les divergences entre écoles portent généralement moins sur les sources elles-mêmes que sur la manière de les articuler et de les ponderer face à un cas concret.",
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
          "Ya-Sin, sourate mecquoise de quatre-vingt-trois versets, est traditionnellement surnommee \"le cœur du Coran\" d'après un hadith dont l'authenticité est discutee par les critiques du hadith - certains le classant faible - mais qui reste largement repandu dans la piété populaire, notamment par une récitation frequente aupres des mourants.\n\nSur le plan du contenu, Ya-Sin est souvent étudiée comme un modele d'argumentation coranique en faveur de trois piliers de la foi : la prophétie, illustrée par le recit de messagers envoyes à une cite qui les rejette (versets 13-32) ; la resurrection, defendue par plusieurs arguments frappants, notamment la comparaison entre la capacite de Dieu à faire revivre une terre morte par la pluie et Sa capacite à ressusciter les morts (versets 33-36), ou l'argument selon lequel Celui qui a créé l'être humain a partir de rien est necessairement capable de le recreer (verset 79) ; et le tawhid, rappele tout au long du texte.\n\nCette structure argumentative fait de Ya-Sin un cas d'etude privilegie pour observer comment le Coran ne se contente pas d'affirmer des doctrines mais deploie, en particulier dans les sourates mecquoises centrees sur les fondements de la foi, des raisonnements destines a convaincre un auditoire sceptique - une dimension qui rejoint directement l'étude de l'i'jaz (l'inimitabilite) abordee dans ce parcours.",
        keyTakeaways: [
          "Ya-Sin est traditionnellement surnommee \"le cœur du Coran\", bien que le hadith associe soit discute.",
          "Elle argumente en faveur de la prophétie, de la resurrection et du tawhid, les trois piliers des sourates mecquoises.",
          "Son raisonnement sur la resurrection s'appuie notamment sur l'analogie avec la terre revivifiee par la pluie.",
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
          "Au-dela des quatre sources principales, chaque école a développe des outils méthodologiques secondaires pour traiter les cas non explicitement couverts. L'istihsan (\"préférence juridique\"), particulièrement utilisé par l'école hanafite, permet d'ecarter une analogie stricte au profit d'une solution jugée plus équitable dans le contexte.\n\nLa maslaha (\"intérêt général\"), mobilisee notamment par l'école malikite, permet de fonder une règle sur la protection d'un intérêt essentiel (vie, religion, raison, lignee, biens) même en l'absence de texte spécifique. D'autres outils incluent la pratique des Medinois (spécifique aux malikites), la coutume ('urf) ou le principe de précaution (sadd adh-dhara'i, \"barrer les moyens\" menant à un interdit).\n\nC'est cette variation dans l'acceptation et l'usage de ces outils secondaires - plus que des textes fondamentalement differents - qui explique une grande partie des divergences juridiques documentees dans le comparateur.",
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
          "Les asbab al-nuzul (\"circonstances de la révélation\") etudient le contexte historique precis dans lequel un verset ou un passage a été révèle - une question posee au Prophète ﷺ, un événement particulier - permettant de mieux saisir la portée et parfois la généralité ou la specificite d'une règle enoncee.\n\nLa question du naskh (\"abrogation\") examine les cas ou un verset ulterieur modifierait la portée pratique d'un verset anterieur sur un même sujet, sujet traité avec beaucoup de prudence méthodologique par les commentateurs classiques, qui distinguent l'abrogation reelle de simples cas de specification ou de complementarite entre versets.\n\nCes deux disciplines illustrent l'importance, en ulum al-Qur'an, de ne pas isoler un verset de son contexte de révélation et de l'ensemble du corpus coranique avant d'en tirer une règle ou une compréhension definitive.",
        keyTakeaways: [
          "Les asbab al-nuzul situent un verset dans son contexte historique de révélation.",
          "Le naskh étudie les cas ou un verset ulterieur modifie la portée d'un verset anterieur.",
          "Ces disciplines rappellent l'importance de ne pas isoler un verset de son contexte.",
        ],
        references: [{ label: "Explorer le tafsir verset par verset", url: "/tafsir" }],
      },
      {
        order: 5,
        title: "Akhlaq avancé : l'ikhlas et le risque de la riya",
        content:
          "Un hadith rapporte par Muslim, souvent cite dans la litterature spirituelle islamique, decrit trois categories de personnes jugees en premier au Jour du Jugement precisement parce que leurs actes, en apparence exemplaires - le combattant tombe au combat, le savant qui a enseigne et récite le Coran, le riche qui a depense en aumone - se revelent avoir été accomplis pour être vus et loues des hommes plutôt que pour Dieu seul, et sont en consequence rejetes malgre leur ampleur exterieure.\n\nCe hadith illustre de manière saisissante la centralite de l'ikhlas (sincérité) dans l'evaluation islamique de l'action religieuse : ce n'est pas l'ampleur ou la visibilite d'un acte qui determine sa valeur, mais l'intention qui l'anime. La riya (ostentation), parfois qualifiée de \"shirk mineur\" par certains savants en raison du risque qu'elle fait courir à l'exclusivite de l'intention due à Dieu, peut ainsi vider de sa valeur un acte par ailleurs conforme en tout point aux prescriptions religieuses.\n\nCette exigence souleve une difficulte pratique reconnue par les spirituels classiques : comment distinguer une bonne action publique legitime (qui peut encourager autrui à l'exemple) d'un acte motive par la recherche de reconnaissance ? La réponse généralement proposee insiste moins sur l'evitement systématique de toute visibilite que sur un examen constant de l'intention (muhasaba), reconnaissant que l'ikhlas parfait est un ideal vers lequel on tend plutôt qu'un état definitivement acquis.",
        keyTakeaways: [
          "Un hadith rapporte par Muslim decrit trois profils d'actes apparemment exemplaires rejetes pour manque de sincérité.",
          "La riya est parfois qualifiée de \"shirk mineur\" par certains savants en raison de son atteinte à l'exclusivite de l'intention.",
          "La tradition spirituelle recommande un examen constant de l'intention (muhasaba) plutôt qu'un evitement systématique de toute visibilite.",
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
          "La distinction entre sourates mecquoises (makki) et medinoises (madani) repose sur plusieurs criteres - lieu et période de révélation, style, thèmes abordes - les sourates mecquoises se concentrant davantage sur le tawhid, le Jugement dernier et les recits prophetiques, les sourates medinoises sur la législation et l'organisation de la communauté.\n\nL'i'jaz al-Qur'an (\"inimitabilite\") designe l'étude de la dimension littéraire, rhetorique et structurelle du texte coranique, considérée par la tradition islamique comme un argument en faveur de son origine divine, le Coran defiant explicitement (sourate Al-Baqara, 2:23) quiconque d'en produire l'equivalent.\n\nCes classifications et cette étude littéraire, bien qu'anciennes, restent au cœur du travail des exégètes contemporains pour situer et comprendre chaque passage coranique.",
        keyTakeaways: [
          "La distinction makki/madani aide a comprendre le contexte et les thèmes d'une sourate.",
          "L'i'jaz étudie la dimension littéraire du Coran, argument traditionnel de son origine divine.",
          "Ces outils restent centraux dans le travail des exégètes contemporains.",
        ],
        references: [{ label: "Consulter les sourates avec leur statut", url: "/quran" }],
      },
      {
        order: 7,
        title: "Mustalah al-Hadith : mutawatir et ahad",
        content:
          "La science de la terminologie du hadith (mustalah al-hadith) classe d'abord les hadiths selon le nombre de leurs chaines de transmission independantes. Un hadith mutawatir est rapporte par un nombre de personnes si important, a chaque generation, qu'une collusion pour le fabriquer est jugée pratiquement impossible - sa fiabilite est alors considérée comme certaine.\n\nUn hadith ahad, transmis par un nombre plus restreint de rapporteurs, ne beneficie pas de cette certitude automatique et doit être évalue individuellement selon la fiabilite de chaque maillon de sa chaine. La très grande majorite des hadiths juridiques relève de cette seconde categorie, ce qui explique en partie pourquoi leur interprétation et leur portée peuvent faire l'objet de discussions entre savants.\n\nCette distinction structure l'ensemble de la méthodologie d'authentification développée par les muhaddithun classiques.",
        keyTakeaways: [
          "Un hadith mutawatir beneficie d'une certitude automatique du fait du nombre de ses transmetteurs.",
          "Un hadith ahad doit être évalue individuellement selon sa chaine de transmission.",
          "La majorite des hadiths juridiques relevent de la categorie ahad.",
        ],
        references: [{ label: "Exemple : Sahih al-Bukhari", url: "/hadith/bukhari" }],
      },
      {
        order: 8,
        title: "Mustalah al-Hadith : sahih, hasan et da'if",
        content:
          "Un hadith est qualifié de sahih (\"authentique\") lorsque sa chaine de transmission est continue, composee de rapporteurs fiables et de bonne memoire, et sans defaut cache (illa) ni contradiction avec une source plus forte (shudhudh). Un hadith hasan (\"bon\") répond aux mêmes criteres mais avec une chaine legerement moins solide, généralement encore utilisable en droit.\n\nUn hadith da'if (\"faible\") présente une faiblesse dans sa chaine - rapporteur peu fiable, chaine interrompue - le rendant impropre a fonder seul une règle juridique, même si certains savants en admettent un usage limite pour l'incitation à la vertu (fada'il al-a'mal) selon des conditions strictes. Un hadith mawdu' (\"fabrique\") est identifie comme une invention pure et simple, attribuee a tort au Prophète ﷺ.\n\nCette echelle de classification, appliquee de manière independante par chaque verificateur, explique pourquoi un même hadith peut parfois recevoir des appreciations differentes selon les savants, comme le montrent les classifications multiples rapportees sur cette plateforme.",
        keyTakeaways: [
          "Sahih, hasan, da'if et mawdu' forment une echelle decroissante de fiabilite.",
          "Un hadith da'if ne peut en principe fonder seul une règle juridique.",
          "Un même hadith peut recevoir des appreciations differentes selon les verificateurs.",
        ],
        references: [{ label: "Exemple : Jami at-Tirmidhi", url: "/hadith/tirmidhi" }],
      },
      {
        order: 9,
        title: "Kalam : origines et développement",
        content:
          "Le kalam designe la théologie islamique argumentee rationnellement, développée pour defendre et articuler les croyances face aux questions philosophiques et aux courants concurrents rencontres au fil de l'expansion du monde musulman. Ses premieres grandes controverses portent sur des questions comme le libre arbitre, la nature du Coran (créé ou incree) ou le statut du croyant ayant commis un peche grave.\n\nLe mu'tazilisme en constitue l'expression la plus rationaliste ; les écoles ash'arite et maturidite se sont ensuite constituees en réponse, cherchant un équilibre entre argumentation rationnelle et fidélité aux textes, pour devenir majoritaires dans le sunnisme classique. L'atharisme, de son cote, s'est développe en reaction au recours systématique au kalam, privilegiant l'affirmation directe des textes.\n\nCette histoire intellectuelle mouvementee eclaire pourquoi la théologie islamique n'est pas monolithique, mais traversee de courants aux methodologies distinctes, presentes de manière descriptive sur la plateforme.",
        keyTakeaways: [
          "Le kalam est ne du besoin d'argumenter rationnellement les croyances islamiques.",
          "Le mu'tazilisme en est l'expression la plus rationaliste, l'atharisme la plus reticente.",
          "Ash'arisme et maturidisme representent une voie mediane devenue majoritaire.",
        ],
        references: [{ label: "Panorama des courants théologiques", url: "/schools" }],
      },
      {
        order: 10,
        title: "Comparaison des écoles : méthodologie et exemples",
        content:
          "Étudier le fiqh sans tenir compte de la pluralite des écoles donnerait une image faussement uniforme du droit islamique. Une divergence entre écoles n'est généralement pas un desaccord sur les fondements de la foi, mais le résultat legitime de methodologies d'interprétation differentes appliquees a des sources largement partagees.\n\nPrenons l'exemple de la position des mains pendant la prière : les quatre écoles s'accordent sur l'essentiel du rituel de la salah, mais divergent sur ce détail precis en raison de la diversite des hadiths rapportes et du poids accorde à la pratique observee dans chaque region - Médine pour les malikites, Kufa pour les hanafites. Comprendre cette origine méthodologique de la divergence permet d'aborder ces questions avec la nuance qu'elles meritent, plutôt que de chercher a designer une position comme supérieure aux autres.\n\nLe comparateur de cette plateforme applique systématiquement cette approche : chaque position est attribuee à son école et sourcée, accompagnee d'une explication de l'origine de la divergence.",
        keyTakeaways: [
          "Les divergences entre écoles relevent généralement de la méthodologie, non des fondements de la foi.",
          "L'exemple de la position des mains illustre l'impact des hadiths et des pratiques regionales.",
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
          "Le comparateur de fiqh de cette plateforme est organise par sujet : chaque page présente les positions des quatre écoles sunnites cote a cote, chacune sourcée, suivies d'une explication documentee de l'origine de la divergence lorsque celle-ci est établie. Cette structure permet une lecture rapide et comparative, plutôt qu'une recherche dispersee entre plusieurs ouvrages.\n\nCette approche comparative n'a pas vocation a designer une position comme \"la bonne\" : elle vise a rendre visible, de manière neutre et sourcée, une pluralite legitime au sein de la tradition juridique sunnite - une pluralite que les savants eux-mêmes ont toujours reconnue et respectee entre écoles.\n\nEn parcourant les differents sujets disponibles, on peut ainsi se familiariser avec la logique propre a chaque école et mieux comprendre pourquoi deux pratiques differentes peuvent, l'une comme l'autre, être le fruit d'un raisonnement juridique rigoureux.",
        keyTakeaways: [
          "Le comparateur présente les positions des quatre écoles sourcées, sujet par sujet.",
          "L'objectif est de rendre visible une pluralite legitime, pas de designer une position supérieure.",
          "Cette pluralite a toujours été reconnue par les savants eux-mêmes.",
        ],
        references: [{ label: "Ouvrir le comparateur", url: "/fiqh" }],
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
      // Upsert manuel par (pathId, order) : pas de contrainte unique dediee,
      // on verifie l'existence avant d'inserer pour rester idempotent.
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

  console.log(`Parcours: ${pathCount} parcours, ${lessonCount} lecons seedes.`);
}
