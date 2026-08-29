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
    quranicMentions: "Mentionne notamment dans les sourates Al-Baqara, Al-A'raf et Ta-Ha.",
    description:
      "Considère comme le premier être humain et le premier prophète en Islam. Le Coran relate sa création directe par Dieu a partir d'argile, l'insufflation de l'âme, puis l'ordre donne aux anges de se prosterner devant lui - qu'Iblis (Satan), par orgueil, refuse d'executer, provoquant son bannissement. Installé au paradis avec son épouse Hawwa (Eve), Adam se voit interdire l'approche d'un arbre precis ; seduits par Iblis, le couple en mange et est renvoyé sur terre, non par punition definitive mais après avoir sincerement demande pardon et l'avoir obtenu - un récit que la tradition islamique lit comme fondateur de la notion de repentir (tawba) plutôt que comme un peche originel transmis a toute l'humanité. Il est présente comme le père de l'humanité et le premier a avoir reçu une révélation divine.",
    era: "Origines de l'humanité",
  },
  {
    name: "Idris",
    nameArabic: "إدريس",
    slug: "idris",
    peopleAddressed: null,
    quranicMentions: "Mentionne dans les sourates Maryam et Al-Anbiya.",
    description:
      "Prophète mentionne brievement dans le Coran, decrit comme veridique (siddiq) et élevé par Dieu a un haut rang (makan 'aliyy). La tradition exegetique l'associé parfois a des connaissances anciennes (ecriture, calcul, astronomie selon certains commentateurs) et, dans certains récits non coraniques d'authenticité discutee, a la figure biblique d'Hénoch, sans que le texte coranique lui-même n'en dise davantage. Il demeure l'une des figures prophetiques les moins documentees du Coran, ce qui invite a la prudence quant a tout détail au-dela de ce que le texte affirme explicitement.",
    era: "Période ancienne, avant Nuh selon la tradition",
  },
  {
    name: "Nuh (Noe)",
    nameArabic: "نوح",
    slug: "nuh",
    peopleAddressed: "Son peuple, qui pratiquait l'idolatrie",
    quranicMentions: "Sujet d'une sourate entière (Nuh) ; également évoque dans Al-A'raf, Hud et Al-Ankabut.",
    description:
      "Envoye à un peuple qui persiste dans l'idolatrie malgre neuf cent cinquante ans d'appel, selon le chiffre donne par le Coran (sourate Al-Ankabut, 29:14), à l'unicité de Dieu, Nuh ne convainc qu'une poignee de croyants. Sur ordre divin, il construit une arche pour sauver les croyants et un couple de chaque espèce animale avant qu'un deluge ne detruise le reste de son peuple. Son fils, refusant de le suivre et cherchant refuge sur une montagne par orgueil, perit dans les flots - épisode ou Nuh, bouleverse, interroge Dieu sur cette perte, et reçoit en réponse que l'appartenance familiale ne suffit pas sans la foi. L'arche s'echoue finalement sur le mont Al-Judi, et Nuh est célèbre dans le Coran comme un \"serviteur reconnaissant\" (13:3) et l'un des cinq \"messagers dotes de fermete\" (ulu al-'azm).",
    era: "Période ancienne",
  },
  {
    name: "Hud",
    nameArabic: "هود",
    slug: "hud",
    peopleAddressed: "Le peuple de 'Ad",
    quranicMentions: "Sujet d'une sourate entière (Hud) ; également évoque dans Al-A'raf et Ash-Shu'ara.",
    description:
      "Envoye au peuple de 'Ad, installe dans la région d'Al-Ahqaf (au sud de la péninsule arabique) et connu pour sa puissance physique et ses constructions imposantes sur des hauteurs, Hud les appelle a abandonner l'idolatrie et a reconnaitre les bienfaits que Dieu leur avait accordes. Face à leur refus obstine et a leurs moqueries, un vent violent et glacial, decrit dans le Coran comme s'etant abattu sur eux durant sept nuits et huit jours (sourate Al-Haqqa, 69:7), les extermine entièrement, tandis que Hud et les croyants qui l'avaient suivi sont epargnes.",
    era: "Période ancienne, après Nuh",
  },
  {
    name: "Salih",
    nameArabic: "صالح",
    slug: "salih",
    peopleAddressed: "Le peuple de Thamud",
    quranicMentions: "Évoque dans Al-A'raf, Hud, Ash-Shu'ara et Al-Qamar, entre autres.",
    description:
      "Envoye au peuple de Thamud, successeur du peuple de 'Ad et connu pour avoir taille des demeures dans la roche des montagnes (des vestiges archeologiques traditionnellement associés a ce récit se trouvent a Madain Salih, dans le nord-ouest de l'Arabie saoudite actuelle), Salih leur présente une chamelle miraculeuse comme signe divin tangible et les met en garde de ne lui causer aucun tort, sous peine de châtiment. Le peuple, pousse par quelques instigateurs, sacrifie neanmoins la chamelle, provoquant trois jours plus tard un châtiment (traditionnellement decrit comme un tremblement de terre accompagne d'un cri terrible, sayha) qui les extermine, a l'exception de Salih et des croyants qui l'avaient suivi.",
    era: "Période ancienne, après 'Ad",
  },
  {
    name: "Ibrahim (Abraham)",
    nameArabic: "إبراهيم",
    slug: "ibrahim",
    peopleAddressed: "Son peuple babylonien, puis plus largement les générations suivantes",
    quranicMentions: "Très largement évoque, notamment dans Al-Baqara, Al-An'am, Ibrahim et As-Saffat.",
    description:
      "Figure centrale du monotheisme en Islam, Ibrahim entame sa quête de Dieu, selon le récit coranique (sourate Al-An'am, 6:74-79), en observant les astres, la lune puis le soleil avant de conclure qu'aucun d'eux ne peut être divin puisqu'ils declinent tous. Il brise ensuite les idoles de son peuple, ne laissant que la plus grande pour qu'elle en soit accusee, et confronte le roi tyrannique de son époque (traditionnellement identifie a Nemrod), echappant miraculeusement a un bucher rendu \"fraicheur et paix\" par ordre divin. Avec son fils Isma'il, il reconstruit les fondations de la Kaaba à La Mecque en y invoquant Dieu pour les générations a venir. Sa disposition a sacrifier son fils en songe sur ordre divin, remplace in extremis par un belier envoye par Dieu, est commemoree chaque année lors de l'Aid al-Adha. Père d'Isma'il et d'Ishaq, il est considère comme l'ancetre spirituel commun aux traditions juive, chrétienne et musulmane, et le Coran le designe comme \"ami intime de Dieu\" (khalil Allah, 4:125).",
    era: "Environ IIe millenaire avant l'ere commune (chronologie traditionnelle)",
  },
  {
    name: "Lut (Loth)",
    nameArabic: "لوط",
    slug: "lut",
    peopleAddressed: "Le peuple de Sodome",
    quranicMentions: "Évoque dans Al-A'raf, Hud, Al-Hijr et Ash-Shu'ara, entre autres.",
    description:
      "Neveu d'Ibrahim selon la tradition, Lut est envoye au peuple de Sodome et des cités voisines pour les avertir de leurs pratiques immorales, notamment des rapports entre hommes que le Coran présente comme une transgression inedite parmi les peuples anterieurs. Des anges, envoyes sous forme humaine pour annoncer le châtiment, sont reçus par Lut qui craint pour leur sécurité face a son peuple ; celui-ci, refusant tout avertissement, voit ses cités detruites et retournees sens dessus dessous. Lut et sa famille sont sauves durant la nuit, a l'exception de son épouse, qui s'était retournee vers la destruction en signe de son manque de foi et perit avec le peuple.",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Isma'il (Ismael)",
    nameArabic: "إسماعيل",
    slug: "ismail",
    peopleAddressed: "Les habitants de La Mecque",
    quranicMentions: "Évoque dans Al-Baqara, As-Saffat, Maryam et Al-Anbiya.",
    description:
      "Fils aine d'Ibrahim, ne de sa servante Hajar, Isma'il est installé encore nourrisson avec sa mère dans la vallee desertique de La Mecque sur ordre divin. Selon la tradition, alors qu'Hajar court desesperement entre les collines de Safa et Marwa a la recherche d'eau - course commemoree aujourd'hui dans le rituel du sa'y du hajj et de la 'umra -, la source de Zamzam jaillit miraculeusement sous les pieds de l'enfant. Devenu adulte, il participe avec son père a la reconstruction de la Kaaba et accepte, selon le récit coranique, de se soumettre au sacrifice demande a Ibrahim en songe. Il est traditionnellement considère comme l'ancetre des tribus arabes du Hijaz, dont est issu, plusieurs générations plus tard, le Prophète Muhammad ﷺ.",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Ishaq (Isaac)",
    nameArabic: "إسحاق",
    slug: "ishaq",
    peopleAddressed: null,
    quranicMentions: "Évoque dans Al-Baqara, As-Saffat et Hud.",
    description:
      "Second fils d'Ibrahim, ne de son épouse Sarah alors que celle-ci et Ibrahim étaient déjà âges, Ishaq est annonce par des anges venus visiter Ibrahim pour lui apprendre la destruction imminente du peuple de Lut - une naissance decrite dans le Coran comme un signe supplémentaire de la puissance divine, la reaction de surprise de Sarah étant explicitement rapportee (sourate Hud, 11:71-72). Il est le père de Ya'qub et, par sa lignee, l'ancetre traditionnel des Enfants d'Israel (Bani Isra'il), dont la plupart des prophètes ulterieurs mentionnes dans le Coran sont issus.",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Ya'qub (Jacob)",
    nameArabic: "يعقوب",
    slug: "yaqub",
    peopleAddressed: null,
    quranicMentions: "Évoque notamment dans la sourate Yusuf et dans Al-Baqara.",
    description:
      "Fils d'Ishaq et père de Yusuf (ainsi que de onze autres fils, patriarches traditionnels des douze tribus d'Israel), Ya'qub, également appele Isra'il, est présente par le Coran comme un père d'une profonde tendresse, dont la douleur après la disparition de Yusuf le rend litteralement aveugle de chagrin, selon le récit de la sourate Yusuf. Sa confiance inebranlable dans la misericorde et la sagesse divines, malgre l'incomprehension de son entourage, culmine avec le recouvrement miraculeux de sa vue au contact de la chemise de Yusuf, envoyee depuis l'Égypte, et avec les retrouvailles finales de toute la famille.",
    era: "Descendant d'Ibrahim",
  },
  {
    name: "Yusuf (Joseph)",
    nameArabic: "يوسف",
    slug: "yusuf",
    peopleAddressed: "L'Égypte antique",
    quranicMentions: "Sujet d'une sourate entière (Yusuf), présentée comme \"le plus beau des récits\".",
    description:
      "Fils préfère de Ya'qub, jete dans un puits par ses frères jaloux de l'affection que leur père lui portait, Yusuf est recueilli par une caravane et vendu comme esclave en Égypte, ou il est achete par un haut dignitaire. Devenu jeune homme, il résiste a la tentation de l'épouse de son maitre, qui l'accuse neanmoins injustement, le conduisant en prison pendant plusieurs années malgre son innocence établie. En detention, sa capacité a interpréter les songes se révèle, jusqu'a ce que Pharaon lui-même fasse appel a lui pour un rêve prophetique annoncant une famine ; Yusuf, libère, s'élevé alors au rang de haut responsable charge des reserves alimentaires du pays. Une famine ramene finalement ses frères en Égypte pour y chercher des vivres, sans le reconnaitre, avant qu'il ne se révèle a eux et pardonne leur trahison passee, permettant les retrouvailles de toute la famille, y compris son père Ya'qub.",
    era: "Descendant d'Ibrahim, en Égypte",
  },
  {
    name: "Ayyub (Job)",
    nameArabic: "أيوب",
    slug: "ayyub",
    peopleAddressed: null,
    quranicMentions: "Évoque dans Al-Anbiya et Sad.",
    description:
      "Symbole coranique de la patience dans l'épreuve (sabr), Ayyub, homme riche et pieux, subit une longue maladie physique ainsi que la perte de ses biens et, selon les récits exegetiques traditionnels, d'une partie de sa famille, sans jamais cesser d'invoquer Dieu avec confiance ni se plaindre au-dela d'une brève et pudique invocation rapportee dans le Coran (\"le mal m'a touche, et Tu es le plus Misericordieux des misericordieux\", 21:83). Sa guerison, obtenue selon la tradition par une source d'eau jaillie a l'endroit ou il frappe le sol du pied, et la restauration au double de ce qu'il avait perdu, sont présentées comme la récompense de sa perseverance et une misericorde particulière de Dieu envers lui.",
    era: "Période ancienne",
  },
  {
    name: "Shu'ayb",
    nameArabic: "شعيب",
    slug: "shuayb",
    peopleAddressed: "Le peuple de Madyan",
    quranicMentions: "Évoque dans Al-A'raf, Hud et Ash-Shu'ara.",
    description:
      "Envoye au peuple de Madyan, région marchande de la peninsule arabique, Shu'ayb les appelle a l'unicité de Dieu et dénonce vigoureusement leurs pratiques commerciales malhonnetes, notamment la fraude sur les poids et mesures qui semble avoir été une pratique repandue et normalisee dans cette société. Souvent surnomme par la tradition exegetique \"l'orateur des prophètes\" (khatib al-anbiya) pour l'eloquence de ses arguments rapportes dans le Coran, il fait face au rejet et aux menaces d'expulsion de son peuple ; un châtiment (traditionnellement decrit comme un cri accompagne d'une chaleur accablante suivie d'une ombre trompeuse) s'abat finalement sur eux, tandis que Shu'ayb et les croyants sont epargnes.",
    era: "Période ancienne",
  },
  {
    name: "Musa (Moïse)",
    nameArabic: "موسى",
    slug: "musa",
    peopleAddressed: "Pharaon et les Enfants d'Israel",
    quranicMentions: "Le prophète le plus frequemment mentionne dans le Coran, notamment dans Al-Baqara, Al-A'raf, Ta-Ha et Al-Qasas.",
    description:
      "Ne parmi les Enfants d'Israel a une époque ou Pharaon fait tuer les nouveau-nes males par crainte d'une prophetie, Musa est sauve en etant confie aux eaux du Nil dans un panier et recueilli, selon le récit coranique, par la propre famille de Pharaon qui l'elevera. Devenu adulte, après avoir tue accidentellement un Égyptien et fui vers Madyan ou il épouse la fille de Shu'ayb (ou d'un homme pieux identifie a lui par la tradition), il reçoit la révélation au mont Sinai en voyant un feu depuis lequel Dieu lui parle directement, un statut de dialogue direct qui vaut a Musa le titre de \"Kalim Allah\" (celui a qui Dieu a parle). Envoye avec son frère Harun aupres de Pharaon pour libérer les Enfants d'Israel de l'oppression, il affronte les magiciens de la cour egyptienne dans un duel de prodiges qu'il remporte, avant de conduire son peuple hors d'Égypte lors d'une traversée miraculeuse de la mer qui s'ouvre devant eux et se referme sur l'armee de Pharaon, provoquant sa noyade. La reception de la Torah (Tawrat) au Sinai et les epreuves prolongees du peuple d'Israel dans le desert comptent parmi les récits les plus developpes du Coran.",
    era: "Environ XIIIe siècle avant l'ere commune (chronologie traditionnelle)",
  },
  {
    name: "Harun (Aaron)",
    nameArabic: "هارون",
    slug: "harun",
    peopleAddressed: "Les Enfants d'Israel, aux côtés de Musa",
    quranicMentions: "Évoque notamment dans Ta-Ha, Al-A'raf et Maryam.",
    description:
      "Frère aine de Musa, désigne par Dieu, a la demande expresse de Musa qui invoque son manque d'eloquence (sourate Ta-Ha, 20:25-35), comme assistant, ministre et porte-parole dans sa mission face a Pharaon. Il accompagne Musa dans la confrontation avec Pharaon puis dans la conduite des Enfants d'Israel a travers le desert, et se voit confier la responsabilité du peuple lorsque Musa s'absente pour recevoir la révélation au Sinai - episode marque par l'adoration du veau d'or par une partie du peuple malgre les avertissements de Harun, qui tente en vain de les en dissuader.",
    era: "Contemporain de Musa",
  },
  {
    name: "Dhul-Kifl",
    nameArabic: "ذو الكفل",
    slug: "dhul-kifl",
    peopleAddressed: null,
    quranicMentions: "Mentionne brievement dans Al-Anbiya et Sad, parmi les hommes patients et vertueux.",
    description:
      "Figure mentionnee de manière très succincte dans le Coran (deux occurrences seulement), associée explicitement a la patience et a l'appartenance aux \"vertueux\" (akhyar). Son identification précise fait l'objet de discussions parmi les commentateurs classiques : certains l'associent au prophète biblique Ézéchiel, d'autres y voient un homme pieux non prophete ayant pris la responsabilité (kifl) d'une tâche exigeante, sans qu'un consensus definitif ne se degage. Cette incertitude exegetique elle-même illustre la prudence avec laquelle le Coran est généralement etudie sur les points qu'il ne detaille pas explicitement.",
    era: "Période incertaine",
  },
  {
    name: "Dawud (David)",
    nameArabic: "داود",
    slug: "dawud",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Évoque dans Al-Baqara, Sad, Saba et Al-Anbiya.",
    description:
      "Roi et prophète des Enfants d'Israel, Dawud remporte, alors qu'il n'est encore qu'un jeune combattant dans l'armee du roi Talut (Saul), une victoire decisive sur le geant Jalut (Goliath), episode rapporte dans la sourate Al-Baqara (2:251) qui marque le debut de son ascension. Il reçoit ensuite le Zabur (Psaumes), livre de louanges dont le Coran souligne la beaute, et est célèbre pour une voix si melodieuse que montagnes et oiseaux se seraient joints a ses invocations. Le Coran lui attribué également le don de travailler le fer a mains nues pour en faire des cottes de mailles, et le présente comme un juge equitable exerce a trancher les litiges avec discernement, notamment dans le récit celèbre des deux plaignants venus le consulter (sourate Sad, 38:21-24).",
    era: "Environ Xe siècle avant l'ere commune (chronologie traditionnelle)",
  },
  {
    name: "Sulayman (Salomon)",
    nameArabic: "سليمان",
    slug: "sulayman",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Évoque notamment dans An-Naml, Sad et Al-Anbiya.",
    description:
      "Fils de Dawud, Sulayman hérite d'un royaume étendu et reçoit de Dieu, en réponse a une prière ou il demande un royaume que nul après lui ne possedera, un pouvoir exceptionnel sur les vents, sur les djinns qu'il met a son service pour des travaux de construction, et sur la comprehension du langage des animaux, notamment des oiseaux. Le récit le plus developpe le concernant est sa correspondance avec la reine de Saba (Bilqis), initiee par une huppe (hudhud) qui lui rapporte l'existence de ce royaume prospere mais adorateur du soleil ; après un echange de messages et le transport miraculeux du trone de la reine jusqu'a lui, celle-ci, impressionnee par la sagesse de Sulayman et par son palais au sol de verre qu'elle prend d'abord pour de l'eau, se convertit finalement a l'adoration du Dieu unique.",
    era: "Fils de Dawud",
  },
  {
    name: "Ilyas (Elie)",
    nameArabic: "إلياس",
    slug: "ilyas",
    peopleAddressed: "Son peuple, adorateur de l'idole Baal",
    quranicMentions: "Évoque dans As-Saffat et Al-An'am.",
    description:
      "Envoye a un peuple des Enfants d'Israel adorant l'idole Baal, Ilyas les appelle avec insistance a revenir a l'adoration exclusive du Dieu createur de leurs ancetres, en des termes rapportes de façon relativement developpee dans la sourate As-Saffat (37:123-132). Le Coran le présente parmi les vertueux et les envoyes, et note qu'une paix (salam) particulière lui a été accordee parmi les générations suivantes, signe de la place respectée qu'il occupe dans le récit prophetique malgre le rejet initial de son peuple.",
    era: "Période des Enfants d'Israel",
  },
  {
    name: "Al-Yasa (Elisee)",
    nameArabic: "اليسع",
    slug: "al-yasa",
    peopleAddressed: null,
    quranicMentions: "Mentionne brievement dans Al-An'am et Sad.",
    description:
      "Mentionne très brievement dans le Coran, toujours au sein d'une liste de prophètes decrits collectivement comme favorises par Dieu au-dessus des mondes, sans récit narratif propre associé dans le texte coranique lui-même. La tradition exegetique l'associé généralement, sur la base des sources bibliques et de récits post-coraniques, a un successeur du prophète Ilyas, sans que cela ne soit précise par le Coran.",
    era: "Période des Enfants d'Israel",
  },
  {
    name: "Yunus (Jonas)",
    nameArabic: "يونس",
    slug: "yunus",
    peopleAddressed: "Le peuple de Ninive",
    quranicMentions: "Sujet d'une sourate entière (Yunus, bien que le récit principal soit dans As-Saffat et Al-Anbiya).",
    description:
      "Envoye au peuple de Ninive, Yunus, decourage par le rejet initial de son message, quitte sa mission sans attendre l'ordre divin et embarque sur un navire ; designe par tirage au sort pour être jete a la mer afin d'alleger le bateau en difficulté, il est avale par un grand poisson. Dans les tenebres du ventre du poisson, il implore le pardon divin par une invocation devenue celèbre dans la tradition islamique (\"Il n'y a de divinite que Toi, gloire a Toi, j'ai vraiment été du nombre des injustes\", 21:87) et est ensuite rejette sain et sauf sur le rivage. Son peuple, entretemps, voyant les signes avant-coureurs d'un châtiment imminent, se repent collectivement et est épargne - un cas présente dans le Coran (10:98) comme rare et notable d'un peuple entier sauve après avoir cru, contrairement au sort des peuples de Nuh, 'Ad ou Thamud.",
    era: "Période des Enfants d'Israel",
  },
  {
    name: "Zakariya (Zacharie)",
    nameArabic: "زكريا",
    slug: "zakariya",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Évoque dans Maryam et Al Imran.",
    description:
      "Gardien de Maryam (Marie) au Temple de Jerusalem, Zakariya, qui y decouvre regulierement des provisions inexpliquees aupres d'elle, en tire lui-même l'espoir de demander a Dieu un enfant malgre son grand âge et la sterilite reconnue de son épouse. Sa prière discrete et confiante est exaucee par l'annonce, faite par les anges, de la naissance prochaine de Yahya - une réponse a laquelle Zakariya demande un signe, recevant alors, selon le Coran, l'incapacite temporaire de parler pendant trois jours malgre sa bonne santé, comme confirmation de la promesse divine.",
    era: "Contemporain de Maryam",
  },
  {
    name: "Yahya (Jean-Baptiste)",
    nameArabic: "يحيى",
    slug: "yahya",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Évoque dans Maryam et Al Imran.",
    description:
      "Fils de Zakariya, ne en réponse a la prière de son père malgre le grand âge de ses parents, Yahya reçoit la sagesse des son enfance et est decrit par le Coran comme pieux, tendre envers ses parents, pur, et \"non tyrannique ni desobeissant\" (19:14). Il est traditionnellement identifie a Jean le Baptiste et le Coran lui adresse directement une salutation de paix pour le jour de sa naissance, de sa mort et de sa resurrection (19:15), formule identique a celle réservée a Isa quelques versets plus loin.",
    era: "Contemporain d'Isa",
  },
  {
    name: "Isa (Jésus)",
    nameArabic: "عيسى",
    slug: "isa",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Très largement évoque, notamment dans Al Imran, Maryam et Al-Ma'ida.",
    description:
      "Ne miraculeusement de Maryam (Marie) sans intervention paternelle - un signe explicitement compare par le Coran a la création d'Adam (3:59) - Isa parle des le berceau pour defendre l'honneur de sa mère face aux accusations portees contre elle. Il est considère en Islam comme un prophète et messager, porteur de l'Évangile (Injil) confirmant la Torah, mais non comme divin ni fils de Dieu : le Coran rejette explicitement et a plusieurs reprises la trinite et la filiation divine (notamment sourate Al-Ma'ida, 5:72-75), tout en honorant profondement Isa et Maryam. Le Coran lui attribué, par permission divine et non par pouvoir propre, plusieurs miracles - guerir aveugles et lepreux, ressusciter des morts, faconner un oiseau d'argile qu'il anime - et affirme qu'il n'a pas été tue ni crucifie mais que Dieu l'a élève aupres de Lui, la nature exacte de cette fin terrestre (mort naturelle ulterieure ou elevation corporelle immédiate suivie d'un retour eschatologique attendu) restant discutee parmi les commentateurs, la majorité retenant l'idée d'une elevation sans mort a ce moment-la et d'un retour a la fin des temps.",
    era: "Debut de l'ere commune",
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
