import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, prophets, sources } from "../schema";

/**
 * Les prophètes reconnus par l'Islam, du point de vue islamique. Contenu
 * compilé a partir du Coran (source première, citee par sourate) et de
 * l'ouvrage classique "Qisas al-Anbiya" (Histoires des prophètes) d'Ibn
 * Kathir, référence standard sur ce sujet. Aucun récit invente - voir
 * CONTRIBUTING.md.
 */

const QISAS_AL_ANBIYA = {
  title: "Qisas al-Anbiya (Histoires des prophètes)",
  authorName: "Ibn Kathir",
  authorEra: "701-774 AH / 1300-1373",
};

interface ProphetSeed {
  name: string;
  nameArabic: string;
  slug: string;
  peopleAddressed: string | null;
  quranicMentions: string;
  description: string;
  era: string;
}

const PROPHETS: ProphetSeed[] = [
  {
    name: "Adam",
    nameArabic: "آدم",
    slug: "adam",
    peopleAddressed: null,
    quranicMentions: "Mentionné notamment dans les sourates Al-Baqara, Al-A'raf et Ta-Ha.",
    description:
      "Considéré comme le premier être humain et le premier prophète en Islam. Le Coran relate sa création directe par Dieu à partir d'argile, l'insufflation de l'âme, puis l'ordre donné aux anges de se prosterner devant lui - qu'Iblis (Satan), par orgueil, refuse d'exécuter, provoquant son bannissement. Installé au paradis avec son épouse Hawwa (Ève), Adam se voit interdire l'approche d'un arbre précis ; séduits par Iblis, le couple en mange et est renvoyé sur terre, non par punition définitive mais après avoir sincèrement demandé pardon et l'avoir obtenu - un récit que la tradition islamique lit comme fondateur de la notion de repentir (tawba) plutôt que comme un péché originel transmis à toute l'humanité. Il est présenté comme le père de l'humanité et le premier à avoir reçu une révélation divine.",
    era: "Origines de l'humanité",
  },
  {
    name: "Idris",
    nameArabic: "إدريس",
    slug: "idris",
    peopleAddressed: null,
    quranicMentions: "Mentionné dans les sourates Maryam et Al-Anbiya.",
    description:
      "Prophète mentionné brièvement dans le Coran, décrit comme véridique (siddiq) et élevé par Dieu à un haut rang (makan 'aliyy). La tradition exégétique l'associe parfois à des connaissances anciennes (écriture, calcul, astronomie selon certains commentateurs) et, dans certains récits non coraniques d'authenticité discutée, à la figure biblique d'Hénoch, sans que le texte coranique lui-même n'en dise davantage. Il demeure l'une des figures prophétiques les moins documentées du Coran, ce qui invite à la prudence quant à tout détail au-delà de ce que le texte affirme explicitement.",
    era: "Période ancienne, avant Nuh selon la tradition",
  },
  {
    name: "Nuh (Noe)",
    nameArabic: "نوح",
    slug: "nuh",
    peopleAddressed: "Son peuple, qui pratiquait l'idolâtrie",
    quranicMentions: "Sujet d'une sourate entière (Nuh) ; également évoqué dans Al-A'raf, Hud et Al-Ankabut.",
    description:
      "Envoyé à un peuple qui persiste dans l'idolâtrie malgré neuf cent cinquante ans d'appel, selon le chiffre donné par le Coran (sourate Al-Ankabut, 29:14), à l'unicité de Dieu, Nuh ne convainc qu'une poignée de croyants. Sur ordre divin, il construit une arche pour sauver les croyants et un couple de chaque espèce animale avant qu'un déluge ne détruise le reste de son peuple. Son fils, refusant de le suivre et cherchant refuge sur une montagne par orgueil, périt dans les flots - épisode où Nuh, bouleversé, interroge Dieu sur cette perte, et reçoit en réponse que l'appartenance familiale ne suffit pas sans la foi. L'arche s'échoue finalement sur le mont Al-Judi, et Nuh est célèbre dans le Coran comme un \"serviteur reconnaissant\" (13:3) et l'un des cinq \"messagers dotés de fermeté\" (ulu al-'azm).",
    era: "Période ancienne",
  },
  {
    name: "Hud",
    nameArabic: "هود",
    slug: "hud",
    peopleAddressed: "Le peuple de 'Ad",
    quranicMentions: "Sujet d'une sourate entière (Hud) ; également évoqué dans Al-A'raf et Ash-Shu'ara.",
    description:
      "Envoyé au peuple de 'Ad, installé dans la région d'Al-Ahqaf (au sud de la péninsule arabique) et connu pour sa puissance physique et ses constructions imposantes sur des hauteurs, Hud les appelle à abandonner l'idolâtrie et à reconnaître les bienfaits que Dieu leur avait accordés. Face à leur refus obstiné et à leurs moqueries, un vent violent et glacial, décrit dans le Coran comme s'étant abattu sur eux durant sept nuits et huit jours (sourate Al-Haqqa, 69:7), les extermine entièrement, tandis que Hud et les croyants qui l'avaient suivi sont épargnés.",
    era: "Période ancienne, après Nuh",
  },
  {
    name: "Salih",
    nameArabic: "صالح",
    slug: "salih",
    peopleAddressed: "Le peuple de Thamud",
    quranicMentions: "Évoqué dans Al-A'raf, Hud, Ash-Shu'ara et Al-Qamar, entre autres.",
    description:
      "Envoyé au peuple de Thamud, successeur du peuple de 'Ad et connu pour avoir taillé des demeures dans la roche des montagnes (des vestiges archéologiques traditionnellement associés à ce récit se trouvent à Madain Salih, dans le nord-ouest de l'Arabie saoudite actuelle), Salih leur présente une chamelle miraculeuse comme signe divin tangible et les met en garde de ne lui causer aucun tort, sous peine de châtiment. Le peuple, poussé par quelques instigateurs, sacrifie néanmoins la chamelle, provoquant trois jours plus tard un châtiment (traditionnellement décrit comme un tremblement de terre accompagné d'un cri terrible, sayha) qui les extermine, à l'exception de Salih et des croyants qui l'avaient suivi.",
    era: "Période ancienne, après 'Ad",
  },
  {
    name: "Ibrahim (Abraham)",
    nameArabic: "إبراهيم",
    slug: "ibrahim",
    peopleAddressed: "Son peuple babylonien, puis plus largement les générations suivantes",
    quranicMentions: "Très largement évoqué, notamment dans Al-Baqara, Al-An'am, Ibrahim et As-Saffat.",
    description:
      "Figure centrale du monothéisme en Islam, Ibrahim entame sa quête de Dieu, selon le récit coranique (sourate Al-An'am, 6:74-79), en observant les astres, la lune puis le soleil avant de conclure qu'aucun d'eux ne peut être divin puisqu'ils déclinent tous. Il brise ensuite les idoles de son peuple, ne laissant que la plus grande pour qu'elle en soit accusée, et confronte le roi tyrannique de son époque (traditionnellement identifié à Nemrod), échappant miraculeusement à un bûcher rendu \"fraîcheur et paix\" par ordre divin. Avec son fils Isma'il, il reconstruit les fondations de la Kaaba à La Mecque en y invoquant Dieu pour les générations à venir. Sa disposition à sacrifier son fils en songe sur ordre divin, remplacé in extremis par un bélier envoyé par Dieu, est commémorée chaque année lors de l'Aid al-Adha. Père d'Isma'il et d'Ishaq, il est considéré comme l'ancêtre spirituel commun aux traditions juive, chrétienne et musulmane, et le Coran le désigne comme \"ami intime de Dieu\" (khalil Allah, 4:125).",
    era: "Environ IIe millénaire avant l'ère commune (chronologie traditionnelle)",
  },
  {
    name: "Lut (Loth)",
    nameArabic: "لوط",
    slug: "lut",
    peopleAddressed: "Le peuple de Sodome",
    quranicMentions: "Évoqué dans Al-A'raf, Hud, Al-Hijr et Ash-Shu'ara, entre autres.",
    description:
      "Neveu d'Ibrahim selon la tradition, Lut est envoyé au peuple de Sodome et des cités voisines pour les avertir de leurs pratiques immorales, notamment des rapports entre hommes que le Coran présente comme une transgression inédite parmi les peuples antérieurs. Des anges, envoyés sous forme humaine pour annoncer le châtiment, sont reçus par Lut qui craint pour leur sécurité face à son peuple ; celui-ci, refusant tout avertissement, voit ses cités détruites et retournées sens dessus dessous. Lut et sa famille sont sauvés durant la nuit, à l'exception de son épouse, qui s'était retournée vers la destruction en signe de son manque de foi et périt avec le peuple.",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Isma'il (Ismael)",
    nameArabic: "إسماعيل",
    slug: "ismail",
    peopleAddressed: "Les habitants de La Mecque",
    quranicMentions: "Évoqué dans Al-Baqara, As-Saffat, Maryam et Al-Anbiya.",
    description:
      "Fils aîné d'Ibrahim, né de sa servante Hajar, Isma'il est installé encore nourrisson avec sa mère dans la vallée désertique de La Mecque sur ordre divin. Selon la tradition, alors qu'Hajar court désespérément entre les collines de Safa et Marwa à la recherche d'eau - course commémorée aujourd'hui dans le rituel du sa'y du hajj et de la 'umra -, la source de Zamzam jaillit miraculeusement sous les pieds de l'enfant. Devenu adulte, il participe avec son père à la reconstruction de la Kaaba et accepte, selon le récit coranique, de se soumettre au sacrifice demandé à Ibrahim en songe. Il est traditionnellement considéré comme l'ancêtre des tribus arabes du Hijaz, dont est issu, plusieurs générations plus tard, le Prophète Muhammad ﷺ.",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Ishaq (Isaac)",
    nameArabic: "إسحاق",
    slug: "ishaq",
    peopleAddressed: null,
    quranicMentions: "Évoqué dans Al-Baqara, As-Saffat et Hud.",
    description:
      "Second fils d'Ibrahim, né de son épouse Sarah alors que celle-ci et Ibrahim étaient déjà âgés, Ishaq est annoncé par des anges venus visiter Ibrahim pour lui apprendre la destruction imminente du peuple de Lut - une naissance décrite dans le Coran comme un signe supplémentaire de la puissance divine, la réaction de surprise de Sarah étant explicitement rapportée (sourate Hud, 11:71-72). Il est le père de Ya'qub et, par sa lignée, l'ancêtre traditionnel des Enfants d'Israël (Bani Isra'il), dont la plupart des prophètes ultérieurs mentionnés dans le Coran sont issus.",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Ya'qub (Jacob)",
    nameArabic: "يعقوب",
    slug: "yaqub",
    peopleAddressed: null,
    quranicMentions: "Évoqué notamment dans la sourate Yusuf et dans Al-Baqara.",
    description:
      "Fils d'Ishaq et père de Yusuf (ainsi que de onze autres fils, patriarches traditionnels des douze tribus d'Israël), Ya'qub, également appelé Isra'il, est présenté par le Coran comme un père d'une profonde tendresse, dont la douleur après la disparition de Yusuf le rend littéralement aveugle de chagrin, selon le récit de la sourate Yusuf. Sa confiance inébranlable dans la miséricorde et la sagesse divines, malgré l'incompréhension de son entourage, culmine avec le recouvrement miraculeux de sa vue au contact de la chemise de Yusuf, envoyée depuis l'Égypte, et avec les retrouvailles finales de toute la famille.",
    era: "Descendant d'Ibrahim",
  },
  {
    name: "Yusuf (Joseph)",
    nameArabic: "يوسف",
    slug: "yusuf",
    peopleAddressed: "L'Égypte antique",
    quranicMentions: "Sujet d'une sourate entière (Yusuf), présentée comme \"le plus beau des récits\".",
    description:
      "Fils préféré de Ya'qub, jeté dans un puits par ses frères jaloux de l'affection que leur père lui portait, Yusuf est recueilli par une caravane et vendu comme esclave en Égypte, où il est acheté par un haut dignitaire. Devenu jeune homme, il résiste à la tentation de l'épouse de son maître, qui l'accuse néanmoins injustement, le conduisant en prison pendant plusieurs années malgré son innocence établie. En détention, sa capacité à interpréter les songes se révèle, jusqu'à ce que Pharaon lui-même fasse appel à lui pour un rêve prophétique annonçant une famine ; Yusuf, libéré, s'élève alors au rang de haut responsable chargé des réserves alimentaires du pays. Une famine ramène finalement ses frères en Égypte pour y chercher des vivres, sans le reconnaître, avant qu'il ne se révèle à eux et pardonne leur trahison passée, permettant les retrouvailles de toute la famille, y compris son père Ya'qub.",
    era: "Descendant d'Ibrahim, en Égypte",
  },
  {
    name: "Ayyub (Job)",
    nameArabic: "أيوب",
    slug: "ayyub",
    peopleAddressed: null,
    quranicMentions: "Évoqué dans Al-Anbiya et Sad.",
    description:
      "Symbole coranique de la patience dans l'épreuve (sabr), Ayyub, homme riche et pieux, subit une longue maladie physique ainsi que la perte de ses biens et, selon les récits exégétiques traditionnels, d'une partie de sa famille, sans jamais cesser d'invoquer Dieu avec confiance ni se plaindre au-delà d'une brève et pudique invocation rapportée dans le Coran (\"le mal m'a touché, et Tu es le plus Miséricordieux des miséricordieux\", 21:83). Sa guérison, obtenue selon la tradition par une source d'eau jaillie à l'endroit où il frappe le sol du pied, et la restauration au double de ce qu'il avait perdu, sont présentées comme la récompense de sa persévérance et une miséricorde particulière de Dieu envers lui.",
    era: "Période ancienne",
  },
  {
    name: "Shu'ayb",
    nameArabic: "شعيب",
    slug: "shuayb",
    peopleAddressed: "Le peuple de Madyan",
    quranicMentions: "Évoqué dans Al-A'raf, Hud et Ash-Shu'ara.",
    description:
      "Envoyé au peuple de Madyan, région marchande de la péninsule arabique, Shu'ayb les appelle à l'unicité de Dieu et dénonce vigoureusement leurs pratiques commerciales malhonnêtes, notamment la fraude sur les poids et mesures qui semble avoir été une pratique répandue et normalisée dans cette société. Souvent surnommé par la tradition exégétique \"l'orateur des prophètes\" (khatib al-anbiya) pour l'éloquence de ses arguments rapportés dans le Coran, il fait face au rejet et aux menaces d'expulsion de son peuple ; un châtiment (traditionnellement décrit comme un cri accompagné d'une chaleur accablante suivie d'une ombre trompeuse) s'abat finalement sur eux, tandis que Shu'ayb et les croyants sont épargnés.",
    era: "Période ancienne",
  },
  {
    name: "Musa (Moïse)",
    nameArabic: "موسى",
    slug: "musa",
    peopleAddressed: "Pharaon et les Enfants d'Israël",
    quranicMentions: "Le prophète le plus fréquemment mentionné dans le Coran, notamment dans Al-Baqara, Al-A'raf, Ta-Ha et Al-Qasas.",
    description:
      "Né parmi les Enfants d'Israël à une époque où Pharaon fait tuer les nouveau-nés mâles par crainte d'une prophétie, Musa est sauvé en étant confié aux eaux du Nil dans un panier et recueilli, selon le récit coranique, par la propre famille de Pharaon qui l'élèvera. Devenu adulte, après avoir tué accidentellement un Égyptien et fui vers Madyan où il épouse la fille de Shu'ayb (ou d'un homme pieux identifié à lui par la tradition), il reçoit la révélation au mont Sinaï en voyant un feu depuis lequel Dieu lui parle directement, un statut de dialogue direct qui vaut à Musa le titre de \"Kalim Allah\" (celui à qui Dieu a parlé). Envoyé avec son frère Harun auprès de Pharaon pour libérer les Enfants d'Israël de l'oppression, il affronte les magiciens de la cour égyptienne dans un duel de prodiges qu'il remporte, avant de conduire son peuple hors d'Égypte lors d'une traversée miraculeuse de la mer qui s'ouvre devant eux et se referme sur l'armée de Pharaon, provoquant sa noyade. La réception de la Torah (Tawrat) au Sinaï et les épreuves prolongées du peuple d'Israël dans le désert comptent parmi les récits les plus développés du Coran.",
    era: "Environ XIIIe siècle avant l'ère commune (chronologie traditionnelle)",
  },
  {
    name: "Harun (Aaron)",
    nameArabic: "هارون",
    slug: "harun",
    peopleAddressed: "Les Enfants d'Israël, aux côtés de Musa",
    quranicMentions: "Évoqué notamment dans Ta-Ha, Al-A'raf et Maryam.",
    description:
      "Frère aîné de Musa, désigné par Dieu, à la demande expresse de Musa qui invoque son manque d'éloquence (sourate Ta-Ha, 20:25-35), comme assistant, ministre et porte-parole dans sa mission face à Pharaon. Il accompagne Musa dans la confrontation avec Pharaon puis dans la conduite des Enfants d'Israël à travers le désert, et se voit confier la responsabilité du peuple lorsque Musa s'absente pour recevoir la révélation au Sinaï - épisode marqué par l'adoration du veau d'or par une partie du peuple malgré les avertissements de Harun, qui tente en vain de les en dissuader.",
    era: "Contemporain de Musa",
  },
  {
    name: "Dhul-Kifl",
    nameArabic: "ذو الكفل",
    slug: "dhul-kifl",
    peopleAddressed: null,
    quranicMentions: "Mentionné brièvement dans Al-Anbiya et Sad, parmi les hommes patients et vertueux.",
    description:
      "Figure mentionnée de manière très succincte dans le Coran (deux occurrences seulement), associée explicitement à la patience et à l'appartenance aux \"vertueux\" (akhyar). Son identification précise fait l'objet de discussions parmi les commentateurs classiques : certains l'associent au prophète biblique Ézéchiel, d'autres y voient un homme pieux non prophète ayant pris la responsabilité (kifl) d'une tâche exigeante, sans qu'un consensus définitif ne se dégage. Cette incertitude exégétique elle-même illustre la prudence avec laquelle le Coran est généralement étudié sur les points qu'il ne détaille pas explicitement.",
    era: "Période incertaine",
  },
  {
    name: "Dawud (David)",
    nameArabic: "داود",
    slug: "dawud",
    peopleAddressed: "Les Enfants d'Israël",
    quranicMentions: "Évoqué dans Al-Baqara, Sad, Saba et Al-Anbiya.",
    description:
      "Roi et prophète des Enfants d'Israël, Dawud remporte, alors qu'il n'est encore qu'un jeune combattant dans l'armée du roi Talut (Saül), une victoire décisive sur le géant Jalut (Goliath), épisode rapporté dans la sourate Al-Baqara (2:251) qui marque le début de son ascension. Il reçoit ensuite le Zabur (Psaumes), livre de louanges dont le Coran souligne la beauté, et est célèbre pour une voix si mélodieuse que montagnes et oiseaux se seraient joints à ses invocations. Le Coran lui attribue également le don de travailler le fer à mains nues pour en faire des cottes de mailles, et le présente comme un juge équitable exercé à trancher les litiges avec discernement, notamment dans le récit célèbre des deux plaignants venus le consulter (sourate Sad, 38:21-24).",
    era: "Environ Xe siècle avant l'ère commune (chronologie traditionnelle)",
  },
  {
    name: "Sulayman (Salomon)",
    nameArabic: "سليمان",
    slug: "sulayman",
    peopleAddressed: "Les Enfants d'Israël",
    quranicMentions: "Évoqué notamment dans An-Naml, Sad et Al-Anbiya.",
    description:
      "Fils de Dawud, Sulayman hérite d'un royaume étendu et reçoit de Dieu, en réponse à une prière où il demande un royaume que nul après lui ne possédera, un pouvoir exceptionnel sur les vents, sur les djinns qu'il met à son service pour des travaux de construction, et sur la compréhension du langage des animaux, notamment des oiseaux. Le récit le plus développé le concernant est sa correspondance avec la reine de Saba (Bilqis), initiée par une huppe (hudhud) qui lui rapporte l'existence de ce royaume prospère mais adorateur du soleil ; après un échange de messages et le transport miraculeux du trône de la reine jusqu'à lui, celle-ci, impressionnée par la sagesse de Sulayman et par son palais au sol de verre qu'elle prend d'abord pour de l'eau, se convertit finalement à l'adoration du Dieu unique.",
    era: "Fils de Dawud",
  },
  {
    name: "Ilyas (Elie)",
    nameArabic: "إلياس",
    slug: "ilyas",
    peopleAddressed: "Son peuple, adorateur de l'idole Baal",
    quranicMentions: "Évoqué dans As-Saffat et Al-An'am.",
    description:
      "Envoyé à un peuple des Enfants d'Israël adorant l'idole Baal, Ilyas les appelle avec insistance à revenir à l'adoration exclusive du Dieu créateur de leurs ancêtres, en des termes rapportés de façon relativement développée dans la sourate As-Saffat (37:123-132). Le Coran le présente parmi les vertueux et les envoyés, et note qu'une paix (salam) particulière lui a été accordée parmi les générations suivantes, signe de la place respectée qu'il occupe dans le récit prophétique malgré le rejet initial de son peuple.",
    era: "Période des Enfants d'Israël",
  },
  {
    name: "Al-Yasa (Elisee)",
    nameArabic: "اليسع",
    slug: "al-yasa",
    peopleAddressed: null,
    quranicMentions: "Mentionné brièvement dans Al-An'am et Sad.",
    description:
      "Mentionné très brièvement dans le Coran, toujours au sein d'une liste de prophètes décrits collectivement comme favorisés par Dieu au-dessus des mondes, sans récit narratif propre associé dans le texte coranique lui-même. La tradition exégétique l'associe généralement, sur la base des sources bibliques et de récits post-coraniques, à un successeur du prophète Ilyas, sans que cela ne soit précisé par le Coran.",
    era: "Période des Enfants d'Israël",
  },
  {
    name: "Yunus (Jonas)",
    nameArabic: "يونس",
    slug: "yunus",
    peopleAddressed: "Le peuple de Ninive",
    quranicMentions: "Sujet d'une sourate entière (Yunus, bien que le récit principal soit dans As-Saffat et Al-Anbiya).",
    description:
      "Envoyé au peuple de Ninive, Yunus, découragé par le rejet initial de son message, quitte sa mission sans attendre l'ordre divin et embarque sur un navire ; désigné par tirage au sort pour être jeté à la mer afin d'alléger le bateau en difficulté, il est avalé par un grand poisson. Dans les ténèbres du ventre du poisson, il implore le pardon divin par une invocation devenue célèbre dans la tradition islamique (\"Il n'y a de divinité que Toi, gloire à Toi, j'ai vraiment été du nombre des injustes\", 21:87) et est ensuite rejeté sain et sauf sur le rivage. Son peuple, entretemps, voyant les signes avant-coureurs d'un châtiment imminent, se repent collectivement et est épargné - un cas présenté dans le Coran (10:98) comme rare et notable d'un peuple entier sauvé après avoir cru, contrairement au sort des peuples de Nuh, 'Ad ou Thamud.",
    era: "Période des Enfants d'Israël",
  },
  {
    name: "Zakariya (Zacharie)",
    nameArabic: "زكريا",
    slug: "zakariya",
    peopleAddressed: "Les Enfants d'Israël",
    quranicMentions: "Évoqué dans Maryam et Al Imran.",
    description:
      "Gardien de Maryam (Marie) au Temple de Jérusalem, Zakariya, qui y découvre régulièrement des provisions inexpliquées auprès d'elle, en tire lui-même l'espoir de demander à Dieu un enfant malgré son grand âge et la stérilité reconnue de son épouse. Sa prière discrète et confiante est exaucée par l'annonce, faite par les anges, de la naissance prochaine de Yahya - une réponse à laquelle Zakariya demande un signe, recevant alors, selon le Coran, l'incapacité temporaire de parler pendant trois jours malgré sa bonne santé, comme confirmation de la promesse divine.",
    era: "Contemporain de Maryam",
  },
  {
    name: "Yahya (Jean-Baptiste)",
    nameArabic: "يحيى",
    slug: "yahya",
    peopleAddressed: "Les Enfants d'Israël",
    quranicMentions: "Évoqué dans Maryam et Al Imran.",
    description:
      "Fils de Zakariya, né en réponse à la prière de son père malgré le grand âge de ses parents, Yahya reçoit la sagesse dès son enfance et est décrit par le Coran comme pieux, tendre envers ses parents, pur, et \"non tyrannique ni désobéissant\" (19:14). Il est traditionnellement identifié à Jean le Baptiste et le Coran lui adresse directement une salutation de paix pour le jour de sa naissance, de sa mort et de sa résurrection (19:15), formule identique à celle réservée à Isa quelques versets plus loin.",
    era: "Contemporain d'Isa",
  },
  {
    name: "Isa (Jésus)",
    nameArabic: "عيسى",
    slug: "isa",
    peopleAddressed: "Les Enfants d'Israël",
    quranicMentions: "Très largement évoqué, notamment dans Al Imran, Maryam et Al-Ma'ida.",
    description:
      "Né miraculeusement de Maryam (Marie) sans intervention paternelle - un signe explicitement comparé par le Coran à la création d'Adam (3:59) - Isa parle dès le berceau pour défendre l'honneur de sa mère face aux accusations portées contre elle. Il est considéré en Islam comme un prophète et messager, porteur de l'Évangile (Injil) confirmant la Torah, mais non comme divin ni fils de Dieu : le Coran rejette explicitement et à plusieurs reprises la trinité et la filiation divine (notamment sourate Al-Ma'ida, 5:72-75), tout en honorant profondément Isa et Maryam. Le Coran lui attribue, par permission divine et non par pouvoir propre, plusieurs miracles - guérir aveugles et lépreux, ressusciter des morts, façonner un oiseau d'argile qu'il anime - et affirme qu'il n'a pas été tué ni crucifié mais que Dieu l'a élevé auprès de Lui, la nature exacte de cette fin terrestre (mort naturelle ultérieure ou élévation corporelle immédiate suivie d'un retour eschatologique attendu) restant discutée parmi les commentateurs, la majorité retenant l'idée d'une élévation sans mort à ce moment-là et d'un retour à la fin des temps.",
    era: "Début de l'ère commune",
  },
];

export async function seedProphets(db: Database): Promise<void> {
  const [refAuthor] = await db
    .insert(authors)
    .values({ name: QISAS_AL_ANBIYA.authorName, era: QISAS_AL_ANBIYA.authorEra })
    .onConflictDoNothing()
    .returning();
  const refAuthorRow =
    refAuthor ?? (await db.query.authors.findFirst({ where: eq(authors.name, QISAS_AL_ANBIYA.authorName) }));

  const [refSource] = await db
    .insert(sources)
    .values({ title: QISAS_AL_ANBIYA.title, type: "book", authorId: refAuthorRow?.id, language: "ar" })
    .onConflictDoNothing()
    .returning();
  const refSourceRow =
    refSource ?? (await db.query.sources.findFirst({ where: eq(sources.title, QISAS_AL_ANBIYA.title) }));
  if (!refSourceRow) throw new Error("Impossible de créer la source de référence Qisas al-Anbiya");

  let count = 0;
  for (const [index, p] of PROPHETS.entries()) {
    await db
      .insert(prophets)
      .values({
        name: p.name,
        nameArabic: p.nameArabic,
        slug: p.slug,
        peopleAddressed: p.peopleAddressed,
        quranicMentions: p.quranicMentions,
        description: p.description,
        era: p.era,
        orderIndex: index,
        sourceId: refSourceRow.id,
      })
      .onConflictDoUpdate({
        target: prophets.slug,
        set: {
          name: p.name,
          nameArabic: p.nameArabic,
          peopleAddressed: p.peopleAddressed,
          quranicMentions: p.quranicMentions,
          description: p.description,
          era: p.era,
          orderIndex: index,
        },
      });
    count++;
  }

  console.log(`Prophètes: ${count} fiches seedees.`);
}
