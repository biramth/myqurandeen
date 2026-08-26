import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, eventSources, historicalEvents, historicalPeriods, sources } from "../schema";

/**
 * Chronologie de référence, compilee (pas importee d'une API - aucune
 * n'existe pour ce domaine) a partir d'ouvrages historiques classiques
 * largement reconnus. Dates et faits limites au consensus historiographique
 * établi ; toute date est approximative et suivie de sa source. Ne pas
 * étendre cette liste sans vérification croisee serieuse - voir
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
          "Muhammad ibn Abdillah nait à La Mecque au sein du clan des Banu Hashim, l'un des clans de la tribu de Quraych, qui à la garde de la Kaaba. Son pere, Abdullah, est mort avant sa naissance ; sa mère, Amina, mourra alors qu'il a environ six ans. L'année de sa naissance est traditionnellement appelee \"Année de l'Elephant\" (Am al-Fil), en référence à une expedition abyssine menee contre La Mecque avec des elephants de guerre, évoquée dans la sourate Al-Fil. Orphelin très jeune, il est confie à son grand-pere Abd al-Muttalib puis, après le décès de celui-ci, à son oncle Abu Talib, qui l'elevera et le protegera durant une grande partie de sa vie adulte.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Debut de la Révélation",
        slug: "debut-revelation",
        dateApprox: "610",
        eventType: "révélation",
        description:
          "Âge d'environ quarante ans, Muhammad ﷺ a pris l'habitude de se retirer periodiquement dans la grotte de Hira, sur le mont An-Nour pres de La Mecque, pour y mediter. C'est la que, selon la tradition, l'ange Gabriel (Jibril) lui apparait et lui transmet les premiers versets reveles, l'ordre \"Iqra\" (\"Lis\" ou \"Récite\"), correspondant au debut de la sourate Al-Alaq. Bouleverse par cette experience, il rentre auprès de son epouse Khadija, qui le rassure et le soutient ; ce moment marque, dans la tradition islamique, le debut de sa mission prophétique.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Predication publique à La Mecque",
        slug: "predication-publique",
        dateApprox: "~613",
        eventType: "event",
        description:
          "Après environ trois années de predication discrete auprès de proches (parmi les premiers convertis : Khadija, Ali, Abu Bakr et Zayd ibn Haritha), le Prophète ﷺ recoit, selon la tradition, l'ordre de proclamer publiquement son message. Cet appel à l'unicité de Dieu (tawhid) et à l'abandon du culte des idoles se heurte à l'opposition croissante de plusieurs chefs de Quraych, qui y voient une remise en cause de leur ordre social, religieux et economique, la Kaaba etant alors un centre polytheiste majeur de la péninsule. Cette période est marquee par le boycott, la moquerie et, pour certains des premiers musulmans issus de familles sans protection tribale forte, des persecutions physiques.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Émigration en Abyssinie",
        slug: "emigration-abyssinie",
        dateApprox: "615",
        eventType: "migration",
        description:
          "Face à l'intensification des persecutions contre les premiers musulmans les plus vulnerables, le Prophète ﷺ conseille à un groupe d'entre eux d'émigrer vers le royaume chretien d'Aksoum, en Abyssinie, dont le souverain (le Negus) est reconnu pour sa justice. Deux vagues d'émigration y ont lieu. Selon la tradition, une delegation de Quraych tente d'obtenir du Negus l'extradition des refugies, mais celui-ci, après avoir entendu leur présentation de l'Islam - notamment un passage de la sourate Maryam concernant Jésus et Marie - refuse de les livrer. Cet épisode est souvent cite comme un exemple ancien de relations pacifiques entre les premiers musulmans et une autorite chrétienne.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Année de la Tristesse",
        slug: "annee-de-la-tristesse",
        dateApprox: "619",
        eventType: "event",
        description:
          "En l'espace de quelques mois, le Prophète ﷺ perd deux de ses soutiens les plus proches. Khadija, sa première epouse, qui l'avait soutenu financierement et moralement depuis le debut de la révélation, décédé. Peu après, Abu Talib, son oncle qui l'avait protege des Quraych malgre son propre refus de se convertir, meurt également. Cette double perte, survenue alors que la protection tribale d'Abu Talib s'estompe, fragilise la position du Prophète ﷺ à La Mecque et précède une période de recherche de soutien aupres d'autres tribus, notamment lors d'un voyage a Ta'if qui se solde par un rejet hostile.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Voyage nocturne et Ascension (Isra wal Mi'raj)",
        slug: "isra-wal-miraj",
        dateApprox: "~620-621",
        eventType: "event",
        description:
          "Selon la tradition islamique, le Prophète ﷺ est transporte en une seule nuit de la Mosquee sacrée de La Mecque à la \"Mosquee la plus eloignee\" (Al-Masjid al-Aqsa), identifiee a Jerusalem (l'Isra), évoque au debut de la sourate Al-Isra. De la, il effectue une ascension à travers les cieux (le Mi'raj), au cours de laquelle les cinq prières quotidiennes sont instituees. Cet événement, survenu durant une période difficile de sa predication mecquoise, occupe une place théologique et spirituelle majeure dans l'Islam, notamment pour le lien qu'il etablit avec Jerusalem.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Serments d'Aqaba",
        slug: "serments-aqaba",
        dateApprox: "621-622",
        eventType: "treaty",
        description:
          "A l'occasion du pelerinage annuel, des habitants de Yathrib (future Médine), appartenant aux tribus arabes des Aws et des Khazraj, rencontrent le Prophète ﷺ au defile d'Aqaba, pres de La Mecque. Un premier engagement (622 selon certaines datations, ou l'année précédente) porte sur des principes moraux et religieux ; un second, l'année suivante, rassemble un groupe plus large qui s'engage a proteger le Prophète ﷺ comme l'un des leurs s'il vient s'installer à Médine. Ces accords ouvrent la voie à l'installation d'une communauté musulmane organisée à Médine et preparent directement l'Hegire.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Hegire vers Médine",
        slug: "hegire",
        dateApprox: "622",
        eventType: "migration",
        description:
          "Face à un projet d'assassinat fomente par des chefs de Quraych, le Prophète ﷺ quitte La Mecque avec Abu Bakr pour rejoindre Médine, laissant Ali dormir dans son lit pour couvrir son depart. Le voyage inclut une halte dans la grotte de Thawr, ou les deux hommes se cachent pendant que leurs poursuivants les recherchent. A leur arrivee a Yathrib, rebaptisee Médine (\"la Ville [du Prophète]\"), le Prophète ﷺ y organise la première communauté musulmane structurée, y compris ses relations avec les tribus juives de la ville via ce que la tradition appelle la \"Constitution de Médine\". Cette émigration (Hijra) marque le point de depart du calendrier hegirien.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Bataille de Badr",
        slug: "bataille-de-badr",
        dateApprox: "624 / 2 AH",
        eventType: "battle",
        description:
          "Alors qu'ils tentent d'intercepter une caravane marchande de Quraych revenant de Syrie, environ 300 musulmans de Médine se retrouvent face à une armee mecquoise nettement supérieure en nombre, venue defendre la caravane et affirmer son autorite. La bataille, qui se déroule pres du puits de Badr, se solde par une victoire musulmane inattendue, avec la mort de plusieurs chefs mecquois dont Abu Jahl. Première confrontation militaire majeure entre les deux camps, Badr est présentée dans le Coran (sourate Al-Anfal) comme un signe du soutien divin et occupe depuis une place symbolique centrale dans la memoire islamique.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille d'Uhud",
        slug: "bataille-d-uhud",
        dateApprox: "625 / 3 AH",
        eventType: "battle",
        description:
          "Un an après Badr, les Mecquois reviennent en force pour venger leur defaite et affrontent les musulmans pres du mont Uhud, non loin de Médine. Dans un premier temps favorable aux musulmans, l'issue de la bataille bascule lorsque un groupe d'archers postes sur une colline strategique quitte sa position pour participer au butin, permettant à la cavalerie mecquoise, menee par Khalid ibn al-Walid (alors encore non converti), de prendre les musulmans a revers. Le Prophète ﷺ est blesse et plusieurs compagnons, dont son oncle Hamza, sont tues. Uhud est généralement présentée comme une lecon sur la discipline et l'obéissance plutôt que comme une defaite decisive.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille du Fosse (Khandaq)",
        slug: "bataille-du-fosse",
        dateApprox: "627 / 5 AH",
        eventType: "battle",
        description:
          "Une coalition reunissant les Quraych et plusieurs tribus alliees assiege Médine avec une force consequente. Sur suggestion de Salman al-Farisi, compagnon d'origine perse, les musulmans creusent un large fosse defensif (khandaq) autour des zones vulnerables de la ville, une tactique alors inhabituelle dans la guerre arabe traditionnelle qui rend l'assaut de la cavalerie ennemie inefficace. Après plusieurs semaines de siege infructueux, aggravees par des dissensions internes à la coalition et des conditions climatiques defavorables, les assiegeants se retirent sans combat decisif. L'épisode se conclut par la reddition de la tribu juive des Banu Qurayza, accusee d'avoir comploté avec les assiegeants pendant le siege.",
        source: TARIKH_TABARI,
      },
      {
        title: "Traité de Hudaybiyya",
        slug: "traite-hudaybiyya",
        dateApprox: "628 / 6 AH",
        eventType: "treaty",
        description:
          "Parti avec environ 1400 compagnons pour effectuer la 'umra (petit pelerinage) et non pour combattre, le Prophète ﷺ est arrete par les Quraych a Hudaybiyya, aux abords de La Mecque, qui refusent de le laisser entrer dans la ville. Après des negociations, un traité de treve de dix ans est conclu : les musulmans acceptent de rebrousser chemin cette année-la mais obtiennent le droit d'effectuer le pelerinage l'année suivante, ainsi qu'une reconnaissance politique implicite de leur communauté par les Mecquois. Bien que percu par certains compagnons comme desavantageux sur le moment, ce traité est présente dans le Coran (sourate Al-Fath) comme une \"victoire manifeste\", ayant permis une période de paix relative durant laquelle l'Islam se diffuse largement parmi les tribus arabes.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Conquête de La Mecque",
        slug: "conquete-de-la-mecque",
        dateApprox: "630 / 8 AH",
        eventType: "conquest",
        description:
          "Après qu'une tribu alliee aux Mecquois attaque une tribu alliee aux musulmans, rompant ainsi la treve de Hudaybiyya, le Prophète ﷺ marche sur La Mecque à la tete d'une force importante. La ville se rend avec peu de resistance ; le Prophète ﷺ y entre en accordant une amnistie générale à la population, y compris a nombre de ses anciens persecuteurs, une clemence largement soulignee dans la tradition islamique. Il fait detruire les idoles entourant et à l'intérieur de la Kaaba, restituant le sanctuaire, selon la croyance islamique, à sa vocation originelle de lieu de culte du Dieu unique associee a Abraham et Ismael.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Pelerinage d'Adieu",
        slug: "pelerinage-d-adieu",
        dateApprox: "632 / 10 AH",
        eventType: "event",
        description:
          "Quelques mois avant sa mort, le Prophète ﷺ effectue son unique pelerinage complet à La Mecque depuis l'Hegire, accompagne d'un très grand nombre de musulmans. A cette occasion, il prononce le célèbre Sermon d'Adieu (Khutbat al-Wada'), dans lequel il rappelle des principes fondamentaux : l'égalité entre les croyants, l'interdiction de l'usure et de la vengeance tribale, les droits et devoirs reciproques entre epoux, et l'appel a transmettre son message aux generations futures. C'est durant ce pelerinage qu'est traditionnellement situee la révélation du verset coranique (5:3) évoquant l'achevement de la religion.",
        source: SIRA_IBN_HISHAM,
      },
      {
        title: "Deces du Prophète ﷺ",
        slug: "deces-du-prophete",
        dateApprox: "632 / 11 AH",
        eventType: "death",
        description:
          "Quelques mois après le pelerinage d'adieu, le Prophète ﷺ tombe malade et décédé à Médine, dans les appartements de son epouse Aisha, ou il est enterre. Sa mort plonge la jeune communauté musulmane dans un profond choc ; selon la tradition, Abu Bakr rassure les compagnons en rappelant que si Muhammad ﷺ est mort comme tout être humain, le message qu'il a transmis demeure. Sa disparition ouvre la question de sa succession à la tete de la communauté, resolue par la designation d'Abu Bakr comme premier calife, marquant le debut de la période rashidun.",
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
    description: "Période des quatre premiers califes ayant succède au Prophète ﷺ : Abu Bakr, Omar, Uthman et Ali.",
    events: [
      {
        title: "Abu Bakr devient calife",
        slug: "abu-bakr-calife",
        dateApprox: "632",
        eventType: "event",
        description: "Abu Bakr as-Siddiq est designe premier calife après le décès du Prophète ﷺ.",
        source: TARIKH_TABARI,
      },
      {
        title: "Guerres de Ridda",
        slug: "guerres-de-ridda",
        dateApprox: "632-633",
        eventType: "battle",
        description: "Campagnes menees par Abu Bakr pour retablir l'autorite de Médine sur des tribus arabes ayant fait secession après la mort du Prophète ﷺ.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille de Yarmouk",
        slug: "bataille-de-yarmouk",
        dateApprox: "636",
        eventType: "battle",
        description: "Victoire decisive des armees musulmanes sur l'Empire byzantin au Levant, ouvrant la voie à la conquête de la region.",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille de Qadisiyya",
        slug: "bataille-de-qadisiyya",
        dateApprox: "636",
        eventType: "battle",
        description: "Victoire musulmane majeure sur l'Empire sassanide, ouvrant la voie à la conquête de la Perse.",
        source: TARIKH_TABARI,
      },
      {
        title: "Compilation du Coran sous Uthman",
        slug: "compilation-coran-uthman",
        dateApprox: "~650",
        eventType: "event",
        description: "Sous le califat d'Uthman, une version unifiee et standardisee du texte coranique est établie et diffusee.",
        source: TARIKH_TABARI,
      },
      {
        title: "Assassinat d'Uthman",
        slug: "assassinat-uthman",
        dateApprox: "656",
        eventType: "event",
        description: "Le calife Uthman ibn Affan est assassine à Médine, provoquant une période de troubles internes (fitna).",
        source: TARIKH_TABARI,
      },
      {
        title: "Bataille de Siffin",
        slug: "bataille-de-siffin",
        dateApprox: "657",
        eventType: "battle",
        description: "Affrontement entre les forces du calife Ali et celles de Muawiya, gouverneur de Syrie, durant la première fitna.",
        source: TARIKH_TABARI,
      },
      {
        title: "Assassinat d'Ali",
        slug: "assassinat-ali",
        dateApprox: "661",
        eventType: "death",
        description: "Le calife Ali ibn Abi Talib est assassine a Kufa, marquant la fin de la période rashidun.",
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
    description: "Première dynastie califale héréditaire de l'Islam, fondée par Muawiya ibn Abi Sufyan, avec Damas pour capitale.",
    events: [
      {
        title: "Muawiya fonde le califat omeyyade",
        slug: "muawiya-calife",
        dateApprox: "661",
        eventType: "event",
        description: "Muawiya ibn Abi Sufyan devient calife et etablit Damas comme capitale, fondant la dynastie omeyyade.",
        source: TARIKH_TABARI,
      },
      {
        title: "Construction du Dome du Rocher",
        slug: "dome-du-rocher",
        dateApprox: "691",
        eventType: "event",
        description: "Le calife Abd al-Malik fait construire le Dome du Rocher a Jerusalem.",
        source: TARIKH_TABARI,
      },
      {
        title: "Conquête de l'Andalousie",
        slug: "conquete-andalousie",
        dateApprox: "711",
        eventType: "conquest",
        description: "Une armee omeyyade menee par Tariq ibn Ziyad traverse le detroit de Gibraltar et entame la conquête de la péninsule ibérique.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Révolution abbasside",
        slug: "revolution-abbasside",
        dateApprox: "750",
        eventType: "event",
        description: "Renversement de la dynastie omeyyade par les Abbassides, qui fondent un nouveau califat.",
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
    description: "Deuxième grande dynastie califale, connue pour l'essor scientifique et culturel de son âge d'or, jusqu'à la prise de Bagdad par les Mongols.",
    events: [
      {
        title: "Fondation de Bagdad",
        slug: "fondation-de-bagdad",
        dateApprox: "762",
        eventType: "event",
        description: "Le calife abbasside Al-Mansur fonde Bagdad, qui devient la capitale du califat.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Maison de la Sagesse (Bayt al-Hikma)",
        slug: "bayt-al-hikma",
        dateApprox: "~830",
        eventType: "event",
        description: "Sous le calife Al-Ma'mun, la Maison de la Sagesse a Bagdad devient un centre majeur de traduction et de recherche scientifique.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Prise de Bagdad par les Mongols",
        slug: "prise-de-bagdad-mongols",
        dateApprox: "1258",
        eventType: "event",
        description: "Les forces mongoles menees par Hulagu Khan prennent et detruisent Bagdad, mettant fin au califat abbasside classique.",
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
    description: "Presence musulmane dans la péninsule ibérique, de la conquête de 711 à la chute de Grenade en 1492.",
    events: [
      {
        title: "Conquête de la péninsule ibérique",
        slug: "conquete-peninsule-iberique",
        dateApprox: "711",
        eventType: "conquest",
        description: "Debut de la conquête musulmane de la péninsule ibérique, alors sous domination wisigothique.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Califat de Cordoue",
        slug: "califat-de-cordoue",
        dateApprox: "929",
        eventType: "event",
        description: "Abd al-Rahman III proclame le califat de Cordoue, marquant l'apogee politique et culturel d'Al-Andalus.",
        source: BIDAYA_IBN_KATHIR,
      },
      {
        title: "Chute de Grenade",
        slug: "chute-de-grenade",
        dateApprox: "1492",
        eventType: "event",
        description: "Prise de Grenade, dernier bastion musulman de la péninsule ibérique, par les Rois Catholiques, mettant fin à la presence politique musulmane en Espagne.",
        source: BIDAYA_IBN_KATHIR,
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
