import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, eventSources, historicalEvents, historicalPeriods, sources } from "../schema";

/**
 * Chronologie de référence, compilee (pas importee d'une API - aucune
 * n'existe pour ce domaine) a partir d'ouvrages historiques classiques
 * largement reconnus. Dates et faits limites au consensus historiographique
 * établi ; toute date est approximative et suivie de sa source. Ne pas
 * étendre cette liste sans vérification croisee sérieuse - voir
 * CONTRIBUTING.md (principe des sources vérifiables).
 */

interface SourceRef {
  title: string;
  authorName: string;
  authorEra: string;
}

const SIRA_IBN_HISHAM: SourceRef = {
  title: "As-Sira an-Nabawiyya",
  authorName: "Ibn Hisham",
  authorEra: "m. 218 AH / 833",
};
const TARIKH_TABARI: SourceRef = {
  title: "Tarikh al-Rusul wal-Muluk",
  authorName: "At-Tabari",
  authorEra: "224-310 AH / 839-923",
};
const BIDAYA_IBN_KATHIR: SourceRef = {
  title: "Al-Bidaya wan-Nihaya",
  authorName: "Ibn Kathir",
  authorEra: "701-774 AH / 1300-1373",
};
const SULUK_AL_MAQRIZI: SourceRef = {
  title: "Kitab as-Suluk li-Ma'rifat Duwal al-Muluk",
  authorName: "Al-Maqrizi",
  authorEra: "766-845 AH / 1364-1442",
};
const BADAI_IBN_IYAS: SourceRef = {
  title: "Bada'i' az-Zuhur fi Waqa'i' ad-Duhur",
  authorName: "Ibn Iyas",
  authorEra: "852-930 AH / 1448-1524",
};
// Pour les périodes trop récentes ou trop étendues géographiquement pour être
// couvertes par une chronique classique unique (empire ottoman sur six
// siècles, Afrique de l'Ouest, Asie du Sud-Est...), on cité une synthese
// académique de référence plutôt que d'inventer une source classique
// inexistante - voir CONTRIBUTING.md.
const CAMBRIDGE_HISTORY_ISLAM: SourceRef = {
  title: "The Cambridge History of Islam",
  authorName: "P.M. Holt, Ann K.S. Lambton, Bernard Lewis (dir.)",
  authorEra: "XXe siècle",
};

interface EventSeed {
  title: string;
  slug: string;
  dateApprox: string;
  eventType: string;
  description: string;
  source: SourceRef;
}

interface PeriodSeed {
  name: string;
  slug: string;
  startYear: number;
  endYear: number;
  region: string;
  description: string;
  events: EventSeed[];
}

const PERIODS: PeriodSeed[] = [
  {
    name: "Vie du Prophète Muhammad ﷺ",
    slug: "vie-du-prophete",
    startYear: 570,
    endYear: 632,
    region: "Hijaz (Mecque et Médine)",
    description:
      "Chronologie de la vie du Prophète Muhammad ﷺ, de sa naissance à son décès, d'après les sources sira classiques.",
    events: [
      {
        title: "Naissance du Prophète ﷺ",
        slug: "naissance-du-prophete",
        dateApprox: "~570",
        eventType: "birth",
        description:
          "Muhammad ibn Abdillah nait à La Mecque au sein du clan des Banu Hashim, l'un des clans de la tribu de Quraych, qui à la garde de la Kaaba. Son père, Abdullah, est mort avant sa naissance ; sa mère, Amina, mourra alors qu'il a environ six ans. L'année de sa naissance est traditionnellement appelee \"Année de l'Elephant\" (Am al-Fil), en référence à une expédition abyssine menée contre La Mecque avec des elephants de guerre, évoquée dans la sourate Al-Fil. Orphelin très jeune, il est confie à son grand-père Abd al-Muttalib puis, après le décès de celui-ci, à son oncle Abu Talib, qui l'elevera et le protegera durant une grande partie de sa vie adulte.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Debut de la Révélation",
        slug: "debut-revelation",
        dateApprox: "610",
        eventType: "révélation",
        description:
          "Âge d'environ quarante ans, Muhammad ﷺ a pris l'habitude de se retirer periodiquement dans la grotte de Hira, sur le mont An-Nour près de La Mecque, pour y mediter. C'est la que, selon la tradition, l'ange Gabriel (Jibril) lui apparait et lui transmet les premiers versets reveles, l'ordre \"Iqra\" (\"Lis\" ou \"Récite\"), correspondant au debut de la sourate Al-Alaq. Bouleverse par cette experience, il rentre auprès de son épouse Khadija, qui le rassure et le soutient ; ce moment marqué, dans la tradition islamique, le debut de sa mission prophétique.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Prédication publique à La Mecque",
        slug: "predication-publique",
        dateApprox: "~613",
        eventType: "event",
        description:
          "Après environ trois années de prédication discrete auprès de proches (parmi les premiers convertis : Khadija, Ali, Abu Bakr et Zayd ibn Haritha), le Prophète ﷺ reçoit, selon la tradition, l'ordre de proclamer publiquement son message. Cet appel à l'unicité de Dieu (tawhid) et à l'abandon du culte des idoles se heurte à l'opposition croissante de plusieurs chefs de Quraych, qui y voient une remise en cause de leur ordre social, religieux et économique, la Kaaba etant alors un centre polytheiste majeur de la péninsule. Cette période est marquee par le boycott, la moquerie et, pour certains des premiers musulmans issus de familles sans protection tribale forte, des persecutions physiques.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Émigration en Abyssinie",
        slug: "emigration-abyssinie",
        dateApprox: "615",
        eventType: "migration",
        description:
          "Face à l'intensification des persecutions contre les premiers musulmans les plus vulnerables, le Prophète ﷺ conseille à un groupe d'entre eux d'émigrer vers le royaume chretien d'Aksoum, en Abyssinie, dont le souverain (le Negus) est reconnu pour sa justice. Deux vagues d'émigration y ont lieu. Selon la tradition, une delegation de Quraych tente d'obtenir du Negus l'extradition des réfugiés, mais celui-ci, après avoir entendu leur présentation de l'Islam - notamment un passage de la sourate Maryam concernant Jésus et Marie - refusé de les livrer. Cet épisode est souvent cité comme un exemple ancien de relations pacifiques entre les premiers musulmans et une autorité chrétienne.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Année de la Tristesse",
        slug: "annee-de-la-tristesse",
        dateApprox: "619",
        eventType: "event",
        description:
          "En l'espace de quelques mois, le Prophète ﷺ perd deux de ses soutiens les plus proches. Khadija, sa première épouse, qui l'avait soutenu financierement et moralement depuis le debut de la révélation, décédé. Peu après, Abu Talib, son oncle qui l'avait protège des Quraych malgre son propre refus de se convertir, meurt également. Cette double perte, survenue alors que la protection tribale d'Abu Talib s'estompe, fragilise la position du Prophète ﷺ à La Mecque et précède une période de recherche de soutien aupres d'autres tribus, notamment lors d'un voyage a Ta'if qui se solde par un rejet hostile.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Voyage nocturne et Ascension (Isra wal Mi'raj)",
        slug: "isra-wal-miraj",
        dateApprox: "~620-621",
        eventType: "event",
        description:
          "Selon la tradition islamique, le Prophète ﷺ est transporte en une seule nuit de la Mosquee sacrée de La Mecque à la \"Mosquee la plus éloignée\" (Al-Masjid al-Aqsa), identifiée a Jerusalem (l'Isra), évoque au debut de la sourate Al-Isra. De la, il effectue une ascension à travers les cieux (le Mi'raj), au cours de laquelle les cinq prières quotidiennes sont instituees. Cet événement, survenu durant une période difficile de sa prédication mecquoise, occupé une place théologique et spirituelle majeure dans l'Islam, notamment pour le lien qu'il etablit avec Jerusalem.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Serments d'Aqaba",
        slug: "serments-aqaba",
        dateApprox: "621-622",
        eventType: "treaty",
        description:
          "A l'occasion du pèlerinage annuel, des habitants de Yathrib (future Médine), appartenant aux tribus arabes des Aws et des Khazraj, rencontrent le Prophète ﷺ au defile d'Aqaba, près de La Mecque. Un premier engagement (622 selon certaines datations, ou l'année précédente) porte sur des principes moraux et religieux ; un second, l'année suivante, rassemble un groupe plus large qui s'engage a protéger le Prophète ﷺ comme l'un des leurs s'il vient s'installer à Médine. Ces accords ouvrent la voie à l'installation d'une communauté musulmane organisée à Médine et preparent directement l'Hegire.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Hegire vers Médine",
        slug: "hegire",
        dateApprox: "622",
        eventType: "migration",
        description:
          "Face à un projet d'assassinat fomente par des chefs de Quraych, le Prophète ﷺ quitte La Mecque avec Abu Bakr pour rejoindre Médine, laissant Ali dormir dans son lit pour couvrir son depart. Le voyage inclut une halte dans la grotte de Thawr, ou les deux hommes se cachent pendant que leurs poursuivants les recherchent. A leur arrivée a Yathrib, rebaptisee Médine (\"la Ville [du Prophète]\"), le Prophète ﷺ y organise la première communauté musulmane structurée, y compris ses relations avec les tribus juives de la ville via ce que la tradition appelle la \"Constitution de Médine\". Cette émigration (Hijra) marqué le point de depart du calendrier hegirien.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Bataille de Badr",
        slug: "bataille-de-badr",
        dateApprox: "624 / 2 AH",
        eventType: "battle",
        description:
          "Alors qu'ils tentent d'intercepter une caravane marchande de Quraych revenant de Syrie, environ 300 musulmans de Médine se retrouvent face à une armee mecquoise nettement supérieure en nombre, venue defendre la caravane et affirmer son autorité. La bataille, qui se déroule près du puits de Badr, se solde par une victoire musulmane inattendue, avec la mort de plusieurs chefs mecquois dont Abu Jahl. Première confrontation militaire majeure entre les deux camps, Badr est présentée dans le Coran (sourate Al-Anfal) comme un signe du soutien divin et occupé depuis une place symbolique centrale dans la mémoire islamique.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille d'Uhud",
        slug: "bataille-d-uhud",
        dateApprox: "625 / 3 AH",
        eventType: "battle",
        description:
          "Un an après Badr, les Mecquois reviennent en force pour venger leur defaite et affrontent les musulmans près du mont Uhud, non loin de Médine. Dans un premier temps favorable aux musulmans, l'issue de la bataille bascule lorsque un groupe d'archers postes sur une colline strategique quitte sa position pour participer au butin, permettant à la cavalerie mecquoise, menée par Khalid ibn al-Walid (alors encore non converti), de prendre les musulmans a revers. Le Prophète ﷺ est blesse et plusieurs compagnons, dont son oncle Hamza, sont tues. Uhud est généralement présentée comme une lecon sur la discipline et l'obéissance plutôt que comme une defaite decisive.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille du Fosse (Khandaq)",
        slug: "bataille-du-fosse",
        dateApprox: "627 / 5 AH",
        eventType: "battle",
        description:
          "Une coalition reunissant les Quraych et plusieurs tribus alliees assiège Médine avec une force consequente. Sur suggestion de Salman al-Farisi, compagnon d'origine perse, les musulmans creusent un large fosse defensif (khandaq) autour des zones vulnerables de la ville, une tactique alors inhabituelle dans la guerre arabe traditionnelle qui rend l'assaut de la cavalerie ennemie inefficace. Après plusieurs semaines de siège infructueux, aggravees par des dissensions internes à la coalition et des conditions climatiques defavorables, les assiegeants se retirent sans combat decisif. L'épisode se conclut par la reddition de la tribu juive des Banu Qurayza, accusee d'avoir comploté avec les assiegeants pendant le siège.",
        source: TARIKH_TABARI,
      },
      {
        title: "Traité de Hudaybiyya",
        slug: "traite-hudaybiyya",
        dateApprox: "628 / 6 AH",
        eventType: "treaty",
        description:
          "Parti avec environ 1400 compagnons pour effectuer la 'umra (petit pèlerinage) et non pour combattre, le Prophète ﷺ est arrete par les Quraych a Hudaybiyya, aux abords de La Mecque, qui refusent de le laisser entrer dans la ville. Après des negociations, un traité de treve de dix ans est conclu : les musulmans acceptent de rebrousser chemin cette année-la mais obtiennent le droit d'effectuer le pèlerinage l'année suivante, ainsi qu'une reconnaissance politique implicite de leur communauté par les Mecquois. Bien que percu par certains compagnons comme desavantageux sur le moment, ce traité est présente dans le Coran (sourate Al-Fath) comme une \"victoire manifeste\", ayant permis une période de paix relative durant laquelle l'Islam se diffuse largement parmi les tribus arabes.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Conquête de La Mecque",
        slug: "conquete-de-la-mecque",
        dateApprox: "630 / 8 AH",
        eventType: "conquest",
        description:
          "Après qu'une tribu alliee aux Mecquois attaque une tribu alliee aux musulmans, rompant ainsi la treve de Hudaybiyya, le Prophète ﷺ marche sur La Mecque à la tete d'une force importante. La ville se rend avec peu de résistance ; le Prophète ﷺ y entre en accordant une amnistie générale à la population, y compris a nombre de ses anciens persecuteurs, une clemence largement soulignee dans la tradition islamique. Il fait detruire les idoles entourant et à l'intérieur de la Kaaba, restituant le sanctuaire, selon la croyance islamique, à sa vocation originelle de lieu de culte du Dieu unique associée a Abraham et Ismael.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Pèlerinage d'Adieu",
        slug: "pelerinage-d-adieu",
        dateApprox: "632 / 10 AH",
        eventType: "event",
        description:
          "Quelques mois avant sa mort, le Prophète ﷺ effectue son unique pèlerinage complet à La Mecque depuis l'Hegire, accompagne d'un très grand nombre de musulmans. A cette occasion, il prononce le célèbre Sermon d'Adieu (Khutbat al-Wada'), dans lequel il rappelle des principes fondamentaux : l'égalité entre les croyants, l'interdiction de l'usure et de la vengeance tribale, les droits et devoirs reciproques entre époux, et l'appel a transmettre son message aux générations futures. C'est durant ce pèlerinage qu'est traditionnellement située la révélation du verset coranique (5:3) évoquant l'achevement de la religion.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Deces du Prophète ﷺ",
        slug: "deces-du-prophete",
        dateApprox: "632 / 11 AH",
        eventType: "death",
        description:
          "Quelques mois après le pèlerinage d'adieu, le Prophète ﷺ tombe malade et décédé à Médine, dans les appartements de son épouse Aisha, ou il est enterre. Sa mort plonge la jeune communauté musulmane dans un profond choc ; selon la tradition, Abu Bakr rassure les compagnons en rappelant que si Muhammad ﷺ est mort comme tout être humain, le message qu'il a transmis demeure. Sa disparition ouvre la question de sa succession à la tete de la communauté, resolue par la designation d'Abu Bakr comme premier calife, marquant le debut de la période rashidun.",
        source: SIRA_IBN_HISHAM,
      },
    ],
  },
  {
    name: "Califat Rashidun (bien-guidé)",
    slug: "rashidun",
    startYear: 632,
    endYear: 661,
    region: "Péninsule arabique, Levant, Perse, Égypte",
    description:
      "Période des quatre premiers califes ayant succède au Prophète ﷺ - Abu Bakr, Omar, Uthman et Ali - traditionnellement désignes comme \"bien guides\" (rashidun) en raison de leur proximité directe avec le Prophète ﷺ et de leur rôle dans la consolidation puis l'expansion rapide de la communauté musulmane. En moins de trente ans, cette période voit la péninsule arabique unifiee, l'Empire sassanide effondre et les provinces orientales de l'Empire byzantin conquises, tout en posant les bases institutionnelles (administration, compilation du Coran) et en connaissant les premières fractures politiques internes (fitna) qui marqueront durablement l'histoire musulmane.",
    events: [
      {
        title: "Abu Bakr devient calife",
        slug: "abu-bakr-calife",
        dateApprox: "632",
        eventType: "event",
        description:
          "Dans les heures suivant le décès du Prophète ﷺ, alors qu'aucune procédure de succession n'avait été formellement établie, les principaux compagnons se reunissent à la Saqifa des Banu Sa'ida à Médine. Après discussion entre Muhajirun (émigrés mecquois) et Ansar (auxiliaires médinois), Abu Bakr as-Siddiq, proche compagnon du Prophète ﷺ et père d'Aisha, est désigne premier calife (\"successeur\") par allegeance (bay'a). Il prend le titre de \"Khalifat Rasul Allah\" (successeur du Messager de Dieu) et dirige la communauté depuis Médine jusqu'à sa mort en 634, ou il désigne lui-même Omar comme successeur.",
        source: TARIKH_TABARI,
      },
      {
        title: "Guerres de Ridda",
        slug: "guerres-de-ridda",
        dateApprox: "632-633",
        eventType: "battle",
        description:
          "Des la mort du Prophète ﷺ, plusieurs tribus arabes qui s'étaient ralliees à l'Islam ou avaient accepte de verser la zakat à Médine font secession (ridda), certaines revenant à leurs croyances anterieures, d'autres refusant simplement l'autorité fiscale et politique de Médine, et d'autres encore suivant de faux pretendants a la prophetie comme Musaylima. Abu Bakr, malgré les réticences de certains compagnons dont Omar, engage une série de campagnes militaires menées notamment par le général Khalid ibn al-Walid pour rétablir l'autorité de Médine. Ces guerres, achevees en un peu plus d'un an, consolident l'unité politique de la péninsule arabique et permettent, une fois la paix retablie, de rediriger l'énergie militaire vers l'expansion hors d'Arabie.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille de Yarmouk",
        slug: "bataille-de-yarmouk",
        dateApprox: "636",
        eventType: "battle",
        description:
          "Sur les rives du fleuve Yarmouk, aux confins de la Syrie et de la Jordanie actuelles, une armee musulmane commandee notamment par Khalid ibn al-Walid affronte une force byzantine bien plus nombreuse envoyee par l'empereur Heraclius pour reconquerir les territoires perdus. Profitant d'une tempête de sable et d'une coordination tactique supérieure, les musulmans infligent une defaite decisive aux Byzantins. Cette victoire met fin durablement à la domination byzantine sur la Syrie et ouvre la voie à la conquête rapide du Levant, y compris de Jerusalem, remise pacifiquement au calife Omar en personne peu après.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille de Qadisiyya",
        slug: "bataille-de-qadisiyya",
        dateApprox: "636",
        eventType: "battle",
        description:
          "Près de la ville de Qadisiyya, en Irak actuel, l'armee musulmane commandee par Sa'd ibn Abi Waqqas affronte les forces de l'Empire sassanide, alors affaibli par des décennies de guerre contre Byzance et des troubles dynastiques internes. La victoire musulmane, survenue la même année que Yarmouk, ouvre la voie à la conquête de la capitale sassanide Ctesiphon puis, dans les années suivantes, de l'ensemble de la Perse. L'effondrement de l'Empire sassanide qui s'ensuit constitue l'un des bouleversements géopolitiques majeurs du VIIe siècle et permet la diffusion rapide de l'Islam en Perse, en Asie centrale et au-delà.",
        source: TARIKH_TABARI,
      },
      {
        title: "Compilation du Coran sous Uthman",
        slug: "compilation-coran-uthman",
        dateApprox: "~650",
        eventType: "event",
        description:
          "Alors que l'expansion territoriale rapide disperse les compagnons connaissant le Coran par cœur dans des régions eloignees, et que des divergences de lecture commencent a apparaitre entre les garnisons, le calife Uthman ibn Affan charge une commission dirigee par Zayd ibn Thabit - qui avait déjà supervise une première compilation sous Abu Bakr - d'établir un texte de référence unique à partir des copies existantes et des temoignages des derniers compagnons vivants. Plusieurs exemplaires officiels de ce texte standardise (souvent appele mushaf uthmani) sont ensuite envoyes dans les grandes villes de l'empire naissant, avec instruction de detruire les variantes divergentes, afin de garantir l'unité du texte coranique pour les générations futures.",
        source: TARIKH_TABARI,
      },
      {
        title: "Assassinat d'Uthman",
        slug: "assassinat-uthman",
        dateApprox: "656",
        eventType: "event",
        description:
          "Après plusieurs années de tensions croissantes, alimentees par des accusations de favoritisme envers certains membres de son clan (les Omeyyades) dans la nomination des gouverneurs provinciaux, le calife Uthman ibn Affan, alors âgé, est assiège dans sa demeure à Médine par des mecontents venus de plusieurs provinces, notamment d'Égypte. Il est finalement tue alors qu'il récite le Coran, sans opposer de résistance armee par souci d'éviter un bain de sang parmi les musulmans. Cet assassinat, le premier d'un calife par d'autres musulmans, ouvre une période prolongee de troubles internes (la première fitna) qui fragilisera durablement l'unité politique de la communauté.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille de Siffin",
        slug: "bataille-de-siffin",
        dateApprox: "657",
        eventType: "battle",
        description:
          "Devenu calife après Uthman, Ali ibn Abi Talib fait face au refus de Muawiya, gouverneur de Syrie et parent d'Uthman, de lui preter allegeance tant que les assassins de son cousin n'ont pas été punis. Les deux armees s'affrontent près du fleuve Euphrate, a Siffin, dans une bataille prolongee et indecise. Lorsque les troupes de Muawiya, en position defavorable, brandissent des pages du Coran au bout de leurs lances pour demander un arbitrage, Ali accepte, malgré l'opposition d'une partie de ses propres troupes. Cet arbitrage, percu comme desavantageux pour Ali, provoque la secession d'un groupe de ses partisans, les Kharijites, et affaiblit durablement son autorité.",
        source: TARIKH_TABARI,
      },
      {
        title: "Assassinat d'Ali",
        slug: "assassinat-ali",
        dateApprox: "661",
        eventType: "death",
        description:
          "Le calife Ali ibn Abi Talib, cousin et gendre du Prophète ﷺ, est mortellement blesse à Kufa par un Kharijite, Ibn Muljam, qui lui reprochait notamment d'avoir accepte l'arbitrage de Siffin ; il décédé peu après. Son fils Hassan lui succède brievement avant de ceder le pouvoir a Muawiya afin d'éviter une nouvelle guerre civile, mettant fin à la première fitna. Cette transition marque la fin de la période rashidun et l'avenement du califat omeyyade hereditaire, un tournant que les traditions sunnite et chiite interpretent de manière significativement différente quant a la légitimité de la succession.",
        source: TARIKH_TABARI,
      },
    ],
  },
  {
    name: "Califat Omeyyade",
    slug: "omeyyades",
    startYear: 661,
    endYear: 750,
    region: "Damas, du Levant à l'Andalousie",
    description:
      "Première dynastie califale héréditaire de l'Islam, fondée par Muawiya ibn Abi Sufyan après la fin de la période rashidun, avec Damas pour capitale. En moins d'un siècle, les Omeyyades étendent l'empire musulman de l'Andalousie à l'Asie centrale et à l'Indus, faisant de lui le plus vaste empire que le monde ait connu jusqu'alors, tout en administrant un territoire immense et culturellement divers grâce a une bureaucratie largement héritee des administrations byzantine et sassanide. Leur légitimité reste néanmoins contestee par une partie de la communauté, notamment les partisans d'Ali (proto-chiites) et les Kharijites, jusqu'à leur renversement par les Abbassides en 750.",
    events: [
      {
        title: "Muawiya fondé le califat omeyyade",
        slug: "muawiya-calife",
        dateApprox: "661",
        eventType: "event",
        description:
          "Après la mort d'Ali et le retrait de son fils Hassan, Muawiya ibn Abi Sufyan, gouverneur de Syrie depuis le califat d'Omar, devient calife incontestable et etablit Damas, plutôt que Médine, comme capitale de l'empire musulman. Administrateur habile, il s'appuie sur les structures administratives byzantines déjà en place en Syrie et fait de son gouvernement une monarchie de fait, désignant de son vivant son fils Yazid comme successeur - une rupture avec le principe d'allegeance collective des califes rashidun qui installe durablement le principe hereditaire dans le califat.",
        source: TARIKH_TABARI,
      },
      {
        title: "Construction du Dome du Rocher",
        slug: "dome-du-rocher",
        dateApprox: "691",
        eventType: "event",
        description:
          "Le calife Abd al-Malik ibn Marwan fait construire le Dome du Rocher sur l'esplanade des Mosquees a Jerusalem, au-dessus du rocher associé dans la tradition islamique au voyage nocturne du Prophète ﷺ (Isra wal Mi'raj). Premier grand monument architectural de l'Islam a nous être parvenu, orne de mosaiques et d'inscriptions coraniques parmi les plus anciennes connues, l'édifice affirme également la place de Jerusalem dans l'Islam a une époque de rivalité politique et religieuse avec l'Empire byzantin chretien.",
        source: TARIKH_TABARI,
      },
      {
        title: "Conquête de l'Andalousie",
        slug: "conquete-andalousie",
        dateApprox: "711",
        eventType: "conquest",
        description:
          "Une armee omeyyade composee majoritairement de Berberes récemment convertis, menée par le général Tariq ibn Ziyad, traverse le detroit separant l'Afrique du Nord de la péninsule ibérique - qui prendra son nom (Jabal Tariq, Gibraltar) - et defait le roi wisigoth Roderic a la bataille du Guadalete. En quelques années, la quasi-totalité de la péninsule ibérique passe sous domination musulmane, à l'exception de poches montagneuses au nord qui formeront le point de depart de la Reconquista chretienne plusieurs siècles plus tard.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Bataille de Poitiers (Tours)",
        slug: "bataille-de-poitiers",
        dateApprox: "732",
        eventType: "battle",
        description:
          "Une expédition omeyyade menée depuis l'Andalousie par le gouverneur Abd al-Rahman al-Ghafiqi, remontant à travers l'Aquitaine, est arretee près de Poitiers par les forces franques de Charles Martel. La defaite met un coup d'arret a l'avancee musulmane en Europe occidentale au-dela des Pyrenees ; les incursions se poursuivent encore quelques décennies mais sans nouvelle tentative de conquête d'ampleur comparable, tandis que l'expansion omeyyade se poursuit surtout a l'est, vers l'Asie centrale et l'Indus.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Révolution abbasside",
        slug: "revolution-abbasside",
        dateApprox: "750",
        eventType: "event",
        description:
          "Une insurrection organisée depuis le Khorasan (nord-est de l'Iran actuel), menée par Abu Muslim al-Khurasani au nom de la famille abbasside - descendante d'un oncle du Prophète ﷺ, Al-Abbas - renverse la dynastie omeyyade en s'appuyant sur le mecontentement de nombreux mawali (musulmans non arabes traités en citoyens de second rang sous les Omeyyades) et de certains milieux proches des partisans d'Ali. La quasi-totalité des membres de la famille omeyyade est massacree ; un seul survivant notable, Abd al-Rahman Ier, s'enfuit vers l'Andalousie ou il fondera un émirat omeyyade independant, prolongeant la dynastie loin de Damas.",
        source: BIDAYA_IBN_KATHIR,
      },
    ],
  },
  {
    name: "Califat Abbasside",
    slug: "abbassides",
    startYear: 750,
    endYear: 1258,
    region: "Bagdad, Irak",
    description:
      "Deuxième grande dynastie califale de l'Islam, issue de la révolution qui renversa les Omeyyades en 750. Si son autorité politique effective se fragmente progressivement a partir du IXe-Xe siècle - avec l'émergence de dynasties regionales autonomes (Aghlabides, Fatimides, Bouyides, Seldjoukides...) exerçant le pouvoir reel tandis que le calife abbasside conserve un rôle largement symbolique et religieux - la période abbasside classique, centree sur Bagdad, correspond a l'âge d'or scientifique et culturel de la civilisation islamique, jusqu'à la destruction de la ville par les Mongols en 1258.",
    events: [
      {
        title: "Fondation de Bagdad",
        slug: "fondation-de-bagdad",
        dateApprox: "762",
        eventType: "event",
        description:
          "Le calife abbasside Al-Mansur, deuxième calife de la dynastie, choisit un site sur les rives du Tigre pour y fonder une nouvelle capitale, conçue selon un plan circulaire inedit et baptisee officiellement Madinat as-Salam (\"la Ville de la Paix\"), bien que le nom local de Bagdad s'imposera dans l'usage. Sa position sur les grandes routes commerciales reliant la Méditerranee a l'Asie en fait rapidement l'une des plus grandes villes du monde, et le nouveau centre politique, économique et intellectuel du monde musulman pour les cinq siècles suivants.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Âge d'or abbasside sous Harun al-Rashid et Al-Ma'mun",
        slug: "age-d-or-abbasside",
        dateApprox: "786-833",
        eventType: "event",
        description:
          "Sous les califats d'Harun al-Rashid puis de son fils Al-Ma'mun, Bagdad atteint l'apogee de sa prosperite et de son rayonnement intellectuel, immortalisee (de façon largement romancee) dans le recueil des Mille et Une Nuits. Le commerce prospere sur des routes reliant la Chine a l'Afrique de l'Est et l'Europe, tandis que la cour abbasside attire poetes, musiciens, medecins et savants de tout l'empire et au-delà. Cette période pose les bases institutionnelles - notamment la Maison de la Sagesse fondée ou developpee sous Al-Ma'mun - de l'essor scientifique qui caracterisera les siècles suivants.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Maison de la Sagesse (Bayt al-Hikma)",
        slug: "bayt-al-hikma",
        dateApprox: "~830",
        eventType: "event",
        description:
          "Sous le calife Al-Ma'mun, la Maison de la Sagesse a Bagdad devient un centre majeur de traduction et de recherche, ou des savants de toutes confessions (musulmans, chretiens syriaques, sabeens, juifs) traduisent en arabe les corpus scientifiques et philosophiques grecs (Aristote, Galien, Euclide, Ptolemee), persans et indiens. Cet effort de traduction, associé aux travaux originaux de savants comme Al-Khwarizmi (algebre), Al-Kindi ou plus tard Ibn al-Haytham (optique), pose les bases d'un essor scientifique qui influencera durablement, via des traductions ulterieures en latin, la renaissance intellectuelle europeenne du Moyen Âge.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Prise de Bagdad par les Mongols",
        slug: "prise-de-bagdad-mongols",
        dateApprox: "1258",
        eventType: "event",
        description:
          "Les forces mongoles menées par Hulagu Khan, petit-fils de Gengis Khan, assiegent puis prennent Bagdad après le refus du calife Al-Musta'sim de se soumettre. La ville est mise a sac, sa population largement massacree et ses bibliotheques - dont celle de la Maison de la Sagesse - detruites, un episode que de nombreux historiens ulterieurs decriront comme l'un des plus grands desastres culturels de l'histoire islamique. Le dernier calife abbasside est exécute, mettant fin au califat abbasside de Bagdad ; un califat abbasside symbolique, sans pouvoir politique reel, sera ensuite maintenu au Caire sous la protection des sultans mamelouks jusqu'a la conquête ottomane de 1517.",
        source: BIDAYA_IBN_KATHIR,
      },
    ],
  },
  {
    name: "Al-Andalus",
    slug: "al-andalus",
    startYear: 711,
    endYear: 1492,
    region: "Péninsule ibérique",
    description:
      "Présence musulmane dans la péninsule ibérique, de la conquête de 711 à la chute de Grenade en 1492. Al-Andalus traverse plusieurs phases politiques - émirat puis califat omeyyade independant de Cordoue, royaumes de taifas rivaux, dynasties berberes almoravide et almohade, puis émirat nasride de Grenade - tout en constituant durant plusieurs siècles l'un des foyers intellectuels majeurs du monde musulman, connu pour une relative coexistence entre musulmans, chretiens et juifs (convivencia) et pour son rôle de passerelle vers l'Europe pour les sciences et la philosophie grecques et arabes.",
    events: [
      {
        title: "Conquête de la péninsule ibérique",
        slug: "conquete-peninsule-iberique",
        dateApprox: "711",
        eventType: "conquest",
        description:
          "Debut de la conquête musulmane de la péninsule ibérique, alors sous domination du royaume wisigoth affaibli par des rivalites dynastiques internes. En quelques années, les armees omeyyades soumettent la quasi-totalité du territoire, à l'exception de zones montagneuses au nord (Asturies) ou se maintient une résistance chretienne qui deviendra, plusieurs siècles plus tard, le point de depart de la Reconquista.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Émirat omeyyade independant de Cordoue",
        slug: "emirat-omeyyade-cordoue",
        dateApprox: "756",
        eventType: "event",
        description:
          "Abd al-Rahman Ier, seul survivant notable du massacre de sa famille lors de la révolution abbasside, parvient après une longue fuite a travers l'Afrique du Nord a s'imposer a Cordoue et y fonde un émirat omeyyade independant du califat abbasside de Bagdad. Cette rupture politique fait d'Al-Andalus une entite autonome des le milieu du VIIIe siècle, prealable a l'apogee califale du Xe siècle.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Califat de Cordoue",
        slug: "califat-de-cordoue",
        dateApprox: "929",
        eventType: "event",
        description:
          "Abd al-Rahman III, déjà émir depuis plusieurs années, proclame le califat de Cordoue, affirmant ainsi une égalité de statut avec les califats abbasside de Bagdad et fatimide du Caire. Cette période, qui se prolonge sous son fils Al-Hakam II, marque l'apogee politique, économique et culturel d'Al-Andalus : Cordoue devient l'une des plus grandes villes d'Europe, dotee d'une immense bibliotheque et d'un rayonnement scientifique et littéraire qui attire savants et etudiants de tout le bassin mediterraneen.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Royaumes de taifas et dynasties berberes",
        slug: "royaumes-de-taifas",
        dateApprox: "1031-1212",
        eventType: "event",
        description:
          "Le califat de Cordoue se fragmente en de multiples petits royaumes rivaux (taifas), affaiblissant militairement Al-Andalus face a l'avancee des royaumes chretiens du nord. Deux dynasties berberes venues du Maghreb, les Almoravides puis les Almohades, interviennent successivement pour freiner cette avancee et unifient temporairement le territoire sous leur autorité, avant que la défaite almohade de Las Navas de Tolosa en 1212 n'ouvre la voie a une reconquête chretienne acceleree du XIIIe siècle.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Émirat nasride de Grenade",
        slug: "emirat-nasride-de-grenade",
        dateApprox: "1238-1492",
        eventType: "event",
        description:
          "Après la perte de la plupart des grandes villes andalouses (Cordoue en 1236, Seville en 1248) au profit des royaumes chretiens de Castille et d'Aragon, l'émirat nasride de Grenade, fonde par Muhammad ibn al-Ahmar, subsiste comme dernier État musulman de la péninsule pendant plus de deux siècles, souvent en versant tribut aux royaumes chretiens voisins. C'est durant cette période que sont construits les palais et jardins de l'Alhambra, l'un des monuments les plus emblematiques de l'architecture islamique.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Chute de Grenade",
        slug: "chute-de-grenade",
        dateApprox: "1492",
        eventType: "event",
        description:
          "Après un siège prolonge, l'émir Muhammad XII (Boabdil) rend la ville de Grenade, dernier bastion musulman de la péninsule ibérique, aux souverains chretiens Isabelle de Castille et Ferdinand d'Aragon (les Rois Catholiques), mettant fin a près de huit siècles de présence politique musulmane en Espagne. Les termes de la capitulation, qui garantissaient initialement la liberté religieuse des musulmans et des juifs, seront rapidement violes ; les décennies suivantes verront des conversions forcees, puis l'expulsion definitive des morisques (musulmans convertis) d'Espagne au debut du XVIIe siècle.",
        source: BIDAYA_IBN_KATHIR,
      },
    ],
  },
  {
    name: "Sultanat mamelouk",
    slug: "mamelouks",
    startYear: 1250,
    endYear: 1517,
    region: "Égypte et Syrie",
    description:
      "Régime militaire fondé par d'anciens esclaves-soldats (mamluks) d'origine turque et caucasienne, qui prennent le pouvoir en Égypte en 1250 après la mort du dernier sultan ayyoubide. Malgré un système de succession non hereditaire fonde sur le merite militaire plutôt que la filiation, le sultanat mamelouk s'impose comme la principale puissance du monde musulman oriental pendant plus de deux siècles et demi, jouant un rôle decisif dans l'arret de l'expansion mongole et dans l'expulsion definitive des derniers États croises du Levant, avant d'être conquis par les Ottomans en 1517.",
    events: [
      {
        title: "Bataille de Ayn Jalut",
        slug: "bataille-ayn-jalut",
        dateApprox: "1260",
        eventType: "battle",
        description:
          "Près de la source de Ayn Jalut, en Palestine, l'armee mamelouke commandee par le sultan Qutuz et le général Baybars inflige aux Mongols leur première défaite majeure, mettant un coup d'arret decisif a leur expansion vers l'Égypte après la destruction de Bagdad deux ans plus tôt. Cette victoire, obtenue notamment grâce a une bonne connaissance du terrain et a une utilisation efficace de la cavalerie légère, sauve l'Égypte et le Hijaz (avec les villes saintes de La Mecque et Médine) d'une invasion mongole et etablit durablement la reputation militaire du jeune sultanat mamelouk.",
        source: SULUK_AL_MAQRIZI,
      },
      {
        title: "Baybars et le califat abbasside symbolique du Caire",
        slug: "baybars-califat-caire",
        dateApprox: "1261",
        eventType: "event",
        description:
          "Peu après avoir assassine Qutuz pour s'emparer du pouvoir, le sultan Baybars accueille au Caire un survivant de la famille abbasside echappe au massacre de Bagdad et le proclame calife, restaurant ainsi une institution califale essentiellement symbolique, depourvue de pouvoir politique reel mais conservant une valeur de légitimation religieuse. Cette lignee de califes abbassides du Caire, sans autorité effective, se maintiendra sous la protection des sultans mamelouks jusqu'a la conquête ottomane de 1517.",
        source: SULUK_AL_MAQRIZI,
      },
      {
        title: "Chute d'Acre",
        slug: "chute-d-acre",
        dateApprox: "1291",
        eventType: "conquest",
        description:
          "Les forces mameloukes du sultan Al-Ashraf Khalil prennent Acre, dernier grand bastion des États croises fondes deux siècles plus tôt lors de la première croisade. La chute de la ville met fin a la présence politique et militaire organisée des croisés au Levant, les derniers points d'appui mineurs etant evacues dans les mois suivants.",
        source: SULUK_AL_MAQRIZI,
      },
      {
        title: "Conquête ottomane de l'Égypte",
        slug: "conquete-ottomane-egypte",
        dateApprox: "1517",
        eventType: "conquest",
        description:
          "Le sultan ottoman Selim Ier defait les forces mameloukes lors des batailles de Marj Dabiq (1516) en Syrie puis de Ridaniya (1517) en Égypte, mettant fin au sultanat mamelouk et integrant l'Égypte, la Syrie et le Hijaz a l'Empire ottoman. Le dernier calife abbasside symbolique du Caire est emmene a Istanbul, un épisode que la tradition ottomane ulterieure invoquera pour justifier le titre califal porte par les sultans ottomans.",
        source: BADAI_IBN_IYAS,
      },
    ],
  },
  {
    name: "Empire ottoman",
    slug: "ottomans",
    startYear: 1299,
    endYear: 1924,
    region: "Anatolie, Balkans, Levant, Afrique du Nord",
    description:
      "Fondé par le chef turkmene Osman Ier en Anatolie a la fin du XIIIe siècle, l'Empire ottoman devient en six siècles l'une des plus grandes et des plus durables puissances de l'histoire islamique, s'etendant a son apogee sur trois continents (Europe du Sud-Est, Afrique du Nord, Moyen-Orient). Ses sultans, qui reprennent a partir du XVIe siècle le titre de calife pour affirmer leur légitimité religieuse sur l'ensemble du monde sunnite, president a une administration sophistiquee et a un âge d'or culturel et architectural avant un long déclin relatif face aux puissances europeennes, jusqu'a l'abolition formelle du sultanat (1922) puis du califat (1924) par la jeune République turque.",
    events: [
      {
        title: "Fondation de l'émirat ottoman",
        slug: "fondation-emirat-ottoman",
        dateApprox: "~1299",
        eventType: "event",
        description:
          "Osman Ier, chef d'une principaute turkmene (beylik) frontaliere face a l'Empire byzantin en Anatolie occidentale, s'impose progressivement face aux autres beyliks turcs de la région et pose les bases de ce qui deviendra, sous ses successeurs, l'Empire ottoman. Ce debut modeste dans une zone de marche militaire (uc) face a Byzance forgera durablement l'identite guerriere et expansionniste de l'État naissant.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Prise de Constantinople",
        slug: "prise-de-constantinople",
        dateApprox: "1453",
        eventType: "conquest",
        description:
          "Après un siège de près de deux mois utilisant notamment une artillerie de siège d'une ampleur inedite pour l'époque, le sultan Mehmed II, âge d'a peine vingt-et-un ans, s'empare de Constantinople, mettant fin a l'Empire byzantin plus de mille ans après sa fondation. La ville, rebaptisee Istanbul dans l'usage courant, devient la nouvelle capitale ottomane ; la basilique Sainte-Sophie est convertie en mosquee, et la conquête, largement percue dans le monde musulman comme l'accomplissement d'une prophetie attribuee au Prophète ﷺ, confere a Mehmed II le titre de \"Fatih\" (le Conquerant).",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Apogee sous Suleiman le Magnifique",
        slug: "apogee-suleiman-magnifique",
        dateApprox: "1520-1566",
        eventType: "event",
        description:
          "Sous le règne de Suleiman Ier, appele \"le Magnifique\" en Europe et \"le Legislateur\" (Kanuni) dans la tradition ottomane pour sa vaste refonte du droit administratif et penal complementaire a la charia, l'empire atteint son apogee territoriale, militaire et culturelle, s'etendant jusqu'aux portes de Vienne (assiégée sans succès en 1529) et englobant la quasi-totalité du monde arabe. Cette période voit également un essor architectural majeur, notamment a travers les œuvres de l'architecte imperial Sinan.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Réformes du Tanzimat",
        slug: "reformes-tanzimat",
        dateApprox: "1839-1876",
        eventType: "event",
        description:
          "Face au déclin militaire et economique relatif de l'empire par rapport aux puissances europeennes, une série de réformes administratives, juridiques et militaires (Tanzimat, \"réorganisations\") est engagee, visant a moderniser l'État sur certains modèles europeens tout en preservant son caractere islamique : codification du droit, égalité juridique formelle entre sujets de toutes confessions, réforme de l'armee et de la fiscalite. Ces réformes, aux résultats contrastes, illustrent les tensions profondes entre modernisation et preservation de l'identite ottomane et islamique de l'empire face a la pression occidentale croissante.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Abolition du sultanat puis du califat",
        slug: "abolition-califat-ottoman",
        dateApprox: "1922-1924",
        eventType: "event",
        description:
          "Après la défaite ottomane lors de la Première Guerre mondiale et la guerre d'indépendance turque menée par Mustafa Kemal (Atatürk), la Grande Assemblee nationale turque abolit d'abord le sultanat en 1922 puis, en 1924, le califat lui-même, mettant fin a l'institution califale telle qu'elle avait perdure sous des formes diverses depuis la mort du Prophète ﷺ. Cette abolition, événement majeur et encore largement discute dans le monde musulman contemporain, marque la fin d'une continuite institutionnelle de plus de treize siècles et a directement inspire par la suite plusieurs mouvements appelant a une restauration du califat.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
    ],
  },
  {
    name: "Empire moghol",
    slug: "moghols",
    startYear: 1526,
    endYear: 1857,
    region: "Sous-continent indien",
    description:
      "Dynastie musulmane d'origine turco-mongole fondée par Babur, descendant de Tamerlan et de Gengis Khan, après sa victoire a Panipat en 1526. Les Moghols unifient sous leur autorité la majeure partie du sous-continent indien et president a l'une des civilisations les plus riches et les plus prosperes de l'époque moderne, marquee par une politique religieuse variable selon les souverains - de la tolérance relative d'Akbar aux politiques plus rigoristes d'Aurangzeb - avant un long déclin face a la montée en puissance de la Compagnie britannique des Indes orientales, jusqu'a la disparition formelle de la dynastie en 1857.",
    events: [
      {
        title: "Première bataille de Panipat",
        slug: "premiere-bataille-panipat",
        dateApprox: "1526",
        eventType: "battle",
        description:
          "Babur, prince timouride chasse d'Asie centrale par les Ouzbeks, envahit le nord de l'Inde et defait le sultan de Delhi Ibrahim Lodi a Panipat, malgre une infériorite numerique compensee par un usage novateur de l'artillerie a poudre. Cette victoire fonde l'Empire moghol, dont le nom (derive de \"Mongol\") reflète l'ascendance dynastique de Babur, bien que la culture de l'empire soit rapidement devenue largement indo-persane.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Règne d'Akbar et politique de tolérance religieuse",
        slug: "regne-akbar",
        dateApprox: "1556-1605",
        eventType: "event",
        description:
          "Petit-fils de Babur, Akbar consolide et etend considerablement l'empire tout en menant une politique de tolérance religieuse notable envers la vaste majorité hindoue de ses sujets, notamment par l'abolition de la taxe (jizya) sur les non-musulmans et l'intégration de nobles hindous rajpoutes dans l'administration et l'armee. Il institue également une cour de dialogue interreligieux et une doctrine syncretique personnelle (Din-i Ilahi) qui restera toutefois marginale et sans grande postérité, contrastant avec les politiques plus orthodoxes de certains de ses successeurs.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Construction du Taj Mahal",
        slug: "construction-taj-mahal",
        dateApprox: "1632-1653",
        eventType: "event",
        description:
          "L'empereur Shah Jahan fait construire a Agra le Taj Mahal, mausolee de marbre blanc en memoire de son épouse Mumtaz Mahal, décédée en couches. Chef-d'œuvre de l'architecture moghole melant influences persanes, ottomanes et indiennes, l'edifice devient l'un des monuments les plus célèbres au monde et un symbole du raffinement architectural atteint par l'empire a son apogee.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Déclin et fin de l'empire",
        slug: "declin-fin-empire-moghol",
        dateApprox: "1707-1857",
        eventType: "event",
        description:
          "Après la mort d'Aurangzeb en 1707, dont le règne long et marque par une expansion territoriale maximale mais aussi par des tensions religieuses et financieres accrues, l'empire entre dans un long déclin, fragmente par des revoltes regionales et l'affaiblissement progressif de l'autorité centrale. La Compagnie britannique des Indes orientales, initialement implantee comme puissance commerciale, prend un contrôle croissant du sous-continent ; après la grande révolte indienne de 1857, a laquelle le dernier empereur moghol Bahadur Shah II prete un soutien symbolique, les Britanniques abolissent formellement la dynastie et exilent le dernier souverain en Birmanie.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
    ],
  },
  {
    name: "Islam en Afrique de l'Ouest",
    slug: "afrique-de-l-ouest",
    startYear: 700,
    endYear: 1900,
    region: "Sahel et Afrique de l'Ouest",
    description:
      "L'Islam se diffuse en Afrique de l'Ouest des le VIIIe siècle par les routes commerciales transsahariennes reliant l'Afrique du Nord aux royaumes du Sahel, d'abord parmi les elites marchandes et politiques avant une islamisation plus large des populations sur plusieurs siècles. La région voit se succeder plusieurs grands empires et États islamiques - Ghana, Mali, Songhaï, puis le califat de Sokoto au XIXe siècle - qui developpent des centres intellectuels majeurs, au premier rang desquels Tombouctou, avant l'imposition de la colonisation europeenne a la fin du XIXe siècle.",
    events: [
      {
        title: "Diffusion de l'Islam par le commerce transsaharien",
        slug: "diffusion-islam-commerce-transsaharien",
        dateApprox: "VIIIe-XIe siècle",
        eventType: "event",
        description:
          "Les caravanes commerciales traversant le Sahara, echangeant notamment l'or et le sel entre l'Afrique du Nord et le Sahel, introduisent progressivement l'Islam aupres des elites marchandes et politiques de l'empire du Ghana puis des royaumes voisins. Cette islamisation initialement urbaine et commerciale s'etend graduellement, sur plusieurs siècles et sans conquête militaire massive, aux populations plus larges de la région, un processus largement porte par les réseaux marchands et les confreries soufies.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Pèlerinage de Mansa Musa",
        slug: "pelerinage-mansa-musa",
        dateApprox: "1324",
        eventType: "event",
        description:
          "Mansa Musa, souverain de l'empire du Mali alors a son apogee territoriale et economique grâce au contrôle des routes de l'or, effectue le pèlerinage a La Mecque accompagne d'une caravane d'une ampleur exceptionnelle, distribuant en chemin, notamment au Caire, des quantites d'or telles que certains chroniqueurs egyptiens rapportent une depreciation temporaire du metal sur les marches locaux. Ce voyage, largement documente par des sources externes, fait connaitre la richesse et la puissance de l'empire du Mali au monde mediterraneen et stimule les echanges intellectuels et commerciaux avec l'Afrique du Nord et le Moyen-Orient.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Tombouctou, centre intellectuel de l'empire songhaï",
        slug: "tombouctou-centre-intellectuel",
        dateApprox: "XVe-XVIe siècle",
        eventType: "event",
        description:
          "Sous l'empire songhaï, notamment durant le règne de l'askia Muhammad Ier, la ville de Tombouctou devient un centre intellectuel majeur du monde musulman, abritant plusieurs medersas dont celle rattachee a la mosquee de Sankore et d'importantes collections de manuscrits en arabe couvrant le droit, l'astronomie, la médecine et les sciences religieuses, en partie conservees jusqu'a aujourd'hui. Cette floraison intellectuelle illustre la profondeur de l'ancrage islamique atteint en Afrique de l'Ouest plusieurs siècles après son introduction.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Jihad et fondation du califat de Sokoto",
        slug: "califat-de-sokoto",
        dateApprox: "1804-1809",
        eventType: "event",
        description:
          "Usman dan Fodio, savant et reformateur peul, mène un mouvement de réforme religieuse puis un jihad contre les royaumes haoussa qu'il juge insuffisamment conformes a l'Islam, aboutissant a la fondation du califat de Sokoto dans le nord de l'actuel Nigeria, qui deviendra l'un des plus vastes États d'Afrique subsaharienne au XIXe siècle. Le califat, dote d'une administration structurée et d'un important rayonnement intellectuel, notamment a travers les ecrits d'Usman dan Fodio et de sa fille Nana Asma'u, perdurera jusqu'a la colonisation britannique au debut du XXe siècle.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
    ],
  },
  {
    name: "Islam en Asie du Sud-Est",
    slug: "asie-du-sud-est",
    startYear: 1200,
    endYear: 1600,
    region: "Insulinde (actuels Indonesie, Malaisie, Brunei)",
    description:
      "L'Islam se diffuse en Asie du Sud-Est insulaire principalement par les routes commerciales maritimes reliant l'Inde et le Moyen-Orient a l'archipel malais, a partir du XIIIe siècle, dans un processus largement pacifique porte par les marchands et les predicateurs soufis plutôt que par la conquête militaire. Cette islamisation progressive donne naissance a plusieurs sultanats prosperes - Samudra Pasai, Malacca, puis Aceh, Demak et Mataram a Java - qui font aujourd'hui de l'Indonesie le pays comptant la plus importante population musulmane au monde.",
    events: [
      {
        title: "Sultanat de Samudra Pasai",
        slug: "sultanat-samudra-pasai",
        dateApprox: "~1267",
        eventType: "event",
        description:
          "Sur la côte nord de Sumatra, le sultanat de Samudra Pasai s'impose comme le premier État islamique clairement atteste de l'archipel malais, beneficiant de sa position sur les routes commerciales maritimes reliant l'Inde a la Chine. Sa cour devient un centre de diffusion de l'Islam vers les régions voisines et un point d'appui pour les marchands et voyageurs musulmans traversant la région, dont le celèbre Ibn Battuta qui y fait escale au XIVe siècle.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Sultanat de Malacca",
        slug: "sultanat-de-malacca",
        dateApprox: "1400-1511",
        eventType: "event",
        description:
          "Fonde par Parameswara, un prince converti a l'Islam, le sultanat de Malacca devient au XVe siècle l'un des plus grands emporiums commerciaux d'Asie, controlant le detroit strategique reliant l'ocean Indien a la mer de Chine meridionale et servant de plaque tournante majeure pour la diffusion de l'Islam vers Java, Bornéo et les Philippines actuelles, avant sa conquête par les Portugais en 1511.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
      {
        title: "Islamisation de Java et tradition des Wali Songo",
        slug: "islamisation-java-wali-songo",
        dateApprox: "XVe-XVIe siècle",
        eventType: "event",
        description:
          "L'islamisation de l'ile de Java, cœur demographique de l'actuelle Indonesie, est traditionnellement associee a neuf figures missionnaires (Wali Songo, \"les neuf saints\") qui auraient combine prédication religieuse et adaptation aux formes culturelles et artistiques locales - notamment le théâtre d'ombres wayang - pour faciliter la conversion progressive des populations javanaises, jusque-la largement hindou-bouddhistes. Cette approche syncretique sur le plan culturel, tout en preservant l'orthodoxie religieuse de fond, caracterise durablement l'Islam de l'archipel indonesien.",
        source: CAMBRIDGE_HISTORY_ISLAM,
      },
    ],
  },
];

export async function seedHistory(db: Database): Promise<void> {
  const sourceCache = new Map<string, string>();

  async function getOrCreateSourceId(ref: SourceRef): Promise<string> {
    const cached = sourceCache.get(ref.title);
    if (cached) return cached;

    const [author] = await db
      .insert(authors)
      .values({ name: ref.authorName, era: ref.authorEra })
      .onConflictDoNothing()
      .returning();
    const authorRow = author ?? (await db.query.authors.findFirst({ where: eq(authors.name, ref.authorName) }));

    const [source] = await db
      .insert(sources)
      .values({ title: ref.title, type: "book", authorId: authorRow?.id, language: "ar" })
      .onConflictDoNothing()
      .returning();
    const sourceRow = source ?? (await db.query.sources.findFirst({ where: eq(sources.title, ref.title) }));

    if (!sourceRow) throw new Error(`Impossible de créer la source ${ref.title}`);
    sourceCache.set(ref.title, sourceRow.id);
    return sourceRow.id;
  }

  let periodCount = 0;
  let eventCount = 0;

  for (const periodSeed of PERIODS) {
    const [period] = await db
      .insert(historicalPeriods)
      .values({
        name: periodSeed.name,
        slug: periodSeed.slug,
        startYear: periodSeed.startYear,
        endYear: periodSeed.endYear,
        region: periodSeed.region,
        description: periodSeed.description,
      })
      .onConflictDoUpdate({
        target: historicalPeriods.slug,
        set: {
          name: periodSeed.name,
          startYear: periodSeed.startYear,
          endYear: periodSeed.endYear,
          region: periodSeed.region,
          description: periodSeed.description,
        },
      })
      .returning();
    periodCount++;

    for (const eventSeed of periodSeed.events) {
      const sourceId = await getOrCreateSourceId(eventSeed.source);

      const [event] = await db
        .insert(historicalEvents)
        .values({
          periodId: period.id,
          title: eventSeed.title,
          slug: eventSeed.slug,
          dateApprox: eventSeed.dateApprox,
          eventType: eventSeed.eventType,
          description: eventSeed.description,
        })
        .onConflictDoUpdate({
          target: historicalEvents.slug,
          set: {
            title: eventSeed.title,
            dateApprox: eventSeed.dateApprox,
            eventType: eventSeed.eventType,
            description: eventSeed.description,
          },
        })
        .returning();
      eventCount++;

      await db.insert(eventSources).values({ eventId: event.id, sourceId }).onConflictDoNothing();
    }
  }

  console.log(`Histoire: ${periodCount} périodes, ${eventCount} événements seedes.`);
}
