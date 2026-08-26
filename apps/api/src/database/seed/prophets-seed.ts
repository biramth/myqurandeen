import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, prophets, sources } from "../schema";

/**
 * Les prophètes reconnus par l'Islam, du point de vue islamique. Contenu
 * compilé a partir du Coran (source première, citee par sourate) et de
 * l'ouvrage classique "Qisas al-Anbiya" (Histoires des prophètes) d'Ibn
 * Kathir, référence standard sur ce sujet. Aucun recit invente - voir
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
      "Considère comme le premier être humain et le premier prophète en Islam. Le Coran relate sa création, son installation au paradis avec son epouse, l'épisode de l'arbre defendu et de la désobéissance sous l'influence d'Iblis (Satan), puis leur envoi sur terre après repentir et pardon divin. Il est présente comme le pere de l'humanite.",
    era: "Origines de l'humanite",
  },
  {
    name: "Idris",
    nameArabic: "إدريس",
    slug: "idris",
    peopleAddressed: null,
    quranicMentions: "Mentionne dans les sourates Maryam et Al-Anbiya.",
    description:
      "Prophète mentionne brievement dans le Coran, decrit comme veridique et élevé à un haut rang. La tradition islamique l'associe parfois a des figures anciennes connues pour leur sagesse, sans que les sources scripturaires n'en disent beaucoup plus.",
    era: "Période ancienne, avant Nuh selon la tradition",
  },
  {
    name: "Nuh (Noe)",
    nameArabic: "نوح",
    slug: "nuh",
    peopleAddressed: "Son peuple, qui pratiquait l'idolatrie",
    quranicMentions: "Sujet d'une sourate entière (Nuh) ; également évoque dans Al-A'raf, Hud et Al-Ankabut.",
    description:
      "Envoye à un peuple qui persiste dans l'idolatrie malgre des siècles d'appel à l'unicité de Dieu, Nuh construit une arche sur ordre divin pour sauver les croyants et des couples d'animaux avant un deluge destructeur. Son fils, refusant de le suivre, perit dans le deluge, épisode souvent cite pour illustrer que la parente ne suffit pas sans la foi.",
    era: "Période ancienne",
  },
  {
    name: "Hud",
    nameArabic: "هود",
    slug: "hud",
    peopleAddressed: "Le peuple de 'Ad",
    quranicMentions: "Sujet d'une sourate entière (Hud) ; également évoque dans Al-A'raf et Ash-Shu'ara.",
    description:
      "Envoye au peuple de 'Ad, connu pour sa puissance et ses constructions impressionnantes, Hud les appelle a abandonner l'idolatrie. Face à leur refus obstine, une tempete devastatrice s'abat sur eux tandis que Hud et les croyants sont epargnes.",
    era: "Période ancienne, après Nuh",
  },
  {
    name: "Salih",
    nameArabic: "صالح",
    slug: "salih",
    peopleAddressed: "Le peuple de Thamud",
    quranicMentions: "Évoque dans Al-A'raf, Hud, Ash-Shu'ara et Al-Qamar, entre autres.",
    description:
      "Envoye au peuple de Thamud, connu pour avoir taille des demeures dans la roche, Salih leur présente une chamelle comme signe divin et les met en garde de ne pas lui nuire. Le peuple tue neanmoins la chamelle, provoquant un châtiment qui les extermine, à l'exception de Salih et des croyants.",
    era: "Période ancienne, après 'Ad",
  },
  {
    name: "Ibrahim (Abraham)",
    nameArabic: "إبراهيم",
    slug: "ibrahim",
    peopleAddressed: "Son peuple babylonien, puis plus largement les generations suivantes",
    quranicMentions: "Très largement évoque, notamment dans Al-Baqara, Al-An'am, Ibrahim et As-Saffat.",
    description:
      "Figure centrale du monotheisme en Islam, Ibrahim brise les idoles de son peuple et confronte le roi tyrannique de son époque, echappant miraculeusement au bucher. Avec son fils Isma'il, il reconstruit la Kaaba à La Mecque. Sa disposition a sacrifier son fils sur ordre divin, remplace in extremis par un belier, est commemoree lors de l'Aid al-Adha. Il est considère comme l'ancetre spirituel commun aux traditions juive, chrétienne et musulmane.",
    era: "Environ IIe millenaire avant l'ere commune (chronologie traditionnelle)",
  },
  {
    name: "Lut (Loth)",
    nameArabic: "لوط",
    slug: "lut",
    peopleAddressed: "Le peuple de Sodome",
    quranicMentions: "Évoque dans Al-A'raf, Hud, Al-Hijr et Ash-Shu'ara, entre autres.",
    description:
      "Neveu d'Ibrahim selon la tradition, Lut est envoye au peuple de Sodome pour les avertir de leurs pratiques immorales. Face à leur refus persistant, la ville est detruite, tandis que Lut et sa famille sont sauves, à l'exception de son epouse.",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Isma'il (Ismael)",
    nameArabic: "إسماعيل",
    slug: "ismail",
    peopleAddressed: "Les habitants de La Mecque",
    quranicMentions: "Évoque dans Al-Baqara, As-Saffat, Maryam et Al-Anbiya.",
    description:
      "Fils aine d'Ibrahim, installe avec sa mère Hajar à La Mecque, ou jaillit selon la tradition la source de Zamzam. Il participe avec son pere à la reconstruction de la Kaaba et est traditionnellement considère comme l'ancetre des Arabes du Hijaz, dont est issu le Prophète Muhammad ﷺ.",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Ishaq (Isaac)",
    nameArabic: "إسحاق",
    slug: "ishaq",
    peopleAddressed: null,
    quranicMentions: "Évoque dans Al-Baqara, As-Saffat et Hud.",
    description:
      "Second fils d'Ibrahim, ne de son epouse Sarah, Ishaq est annonce par des anges venus visiter Ibrahim. Il est le pere de Ya'qub et, par sa lignee, l'ancetre traditionnel des Enfants d'Israel (Bani Isra'il).",
    era: "Contemporain d'Ibrahim",
  },
  {
    name: "Ya'qub (Jacob)",
    nameArabic: "يعقوب",
    slug: "yaqub",
    peopleAddressed: null,
    quranicMentions: "Évoque notamment dans la sourate Yusuf et dans Al-Baqara.",
    description:
      "Fils d'Ishaq et pere de Yusuf, Ya'qub, également appele Isra'il, est le patriarche dont descendent les douze tribus d'Israel. Le Coran relate sa profonde douleur après la disparition de son fils Yusuf et sa foi inebranlable en la misericorde divine.",
    era: "Descendant d'Ibrahim",
  },
  {
    name: "Yusuf (Joseph)",
    nameArabic: "يوسف",
    slug: "yusuf",
    peopleAddressed: "L'Égypte antique",
    quranicMentions: "Sujet d'une sourate entière (Yusuf), présentée comme \"le plus beau des recits\".",
    description:
      "Fils de Ya'qub, vendu comme esclave par ses frères jaloux puis emmene en Égypte, Yusuf resiste à la tentation, est injustement emprisonne, puis s'élevé grâce à sa capacite a interpréter les songes jusqu'à devenir un haut responsable charge des reserves du pays. Il finit par se reconcilier avec ses frères et retrouver son pere.",
    era: "Descendant d'Ibrahim, en Égypte",
  },
  {
    name: "Ayyub (Job)",
    nameArabic: "أيوب",
    slug: "ayyub",
    peopleAddressed: null,
    quranicMentions: "Évoque dans Al-Anbiya et Sad.",
    description:
      "Symbole coranique de la patience dans l'épreuve, Ayyub subit une longue maladie et la perte de ses biens sans jamais cesser d'invoquer Dieu avec confiance. Sa guerison et la restauration de ce qu'il avait perdu sont présentées comme une récompense de sa perseverance.",
    era: "Période ancienne",
  },
  {
    name: "Shu'ayb",
    nameArabic: "شعيب",
    slug: "shuayb",
    peopleAddressed: "Le peuple de Madyan",
    quranicMentions: "Évoque dans Al-A'raf, Hud et Ash-Shu'ara.",
    description:
      "Envoye au peuple de Madyan, Shu'ayb les appelle à l'unicité de Dieu et dénonce leurs pratiques commerciales malhonnetes, notamment la fraude sur les poids et mesures. Face au rejet de son message, un châtiment s'abat sur son peuple.",
    era: "Période ancienne",
  },
  {
    name: "Musa (Moïse)",
    nameArabic: "موسى",
    slug: "musa",
    peopleAddressed: "Pharaon et les Enfants d'Israel",
    quranicMentions: "Le prophète le plus frequemment mentionne dans le Coran, notamment dans Al-Baqara, Al-A'raf, Ta-Ha et Al-Qasas.",
    description:
      "Envoye a Pharaon pour liberer les Enfants d'Israel de l'oppression, Musa recoit la révélation au mont Sinai après avoir vu le buisson ardent. Son affrontement avec les magiciens de Pharaon, la traversee miraculeuse de la mer et la noyade de Pharaon, ainsi que la reception de la Torah, sont parmi les recits les plus developpes du Coran.",
    era: "Environ XIIIe siècle avant l'ere commune (chronologie traditionnelle)",
  },
  {
    name: "Harun (Aaron)",
    nameArabic: "هارون",
    slug: "harun",
    peopleAddressed: "Les Enfants d'Israel, aux cotes de Musa",
    quranicMentions: "Évoque notamment dans Ta-Ha, Al-A'raf et Maryam.",
    description:
      "Frère aine de Musa, designe par Dieu, à la demande de Musa, comme assistant et porte-parole en raison de son eloquence. Il l'accompagne dans sa mission face à Pharaon et dans la conduite des Enfants d'Israel.",
    era: "Contemporain de Musa",
  },
  {
    name: "Dhul-Kifl",
    nameArabic: "ذو الكفل",
    slug: "dhul-kifl",
    peopleAddressed: null,
    quranicMentions: "Mentionne brievement dans Al-Anbiya et Sad, parmi les hommes patients et vertueux.",
    description:
      "Figure mentionnee de manière très succincte dans le Coran, associee à la patience et à la droiture. Son identification précise fait l'objet de discussions parmi les commentateurs, certains l'associant a des figures bibliques, sans consensus definitif.",
    era: "Période incertaine",
  },
  {
    name: "Dawud (David)",
    nameArabic: "داود",
    slug: "dawud",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Évoque dans Al-Baqara, Sad, Saba et Al-Anbiya.",
    description:
      "Roi et prophète des Enfants d'Israel, Dawud recoit le Zabur (Psaumes) et est célèbre pour sa voix et ses louanges à Dieu. Le Coran rappelle sa victoire sur Goliath (Jalut) alors qu'il etait encore jeune, ainsi que le don de travailler le fer qui lui fut accorde.",
    era: "Environ Xe siècle avant l'ere commune (chronologie traditionnelle)",
  },
  {
    name: "Sulayman (Salomon)",
    nameArabic: "سليمان",
    slug: "sulayman",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Évoque notamment dans An-Naml, Sad et Al-Anbiya.",
    description:
      "Fils de Dawud, Sulayman herite d'un royaume étendu et recoit un pouvoir sur les vents, les djinns et la compréhension du langage des oiseaux. Le Coran relate notamment sa correspondance avec la reine de Saba (Bilqis) et sa conversion à l'Islam.",
    era: "Fils de Dawud",
  },
  {
    name: "Ilyas (Elie)",
    nameArabic: "إلياس",
    slug: "ilyas",
    peopleAddressed: "Son peuple, adorateur de l'idole Baal",
    quranicMentions: "Évoque dans As-Saffat et Al-An'am.",
    description:
      "Envoye à un peuple adorant l'idole Baal, Ilyas les appelle a revenir à l'adoration exclusive de Dieu. Le Coran le présente parmi les vertueux et les envoyes.",
    era: "Période des Enfants d'Israel",
  },
  {
    name: "Al-Yasa (Elisee)",
    nameArabic: "اليسع",
    slug: "al-yasa",
    peopleAddressed: null,
    quranicMentions: "Mentionne brievement dans Al-An'am et Sad.",
    description:
      "Mentionne très brievement dans le Coran parmi les hommes de bien favorises par Dieu, sans recit détaillé associe dans le texte coranique lui-même.",
    era: "Période des Enfants d'Israel",
  },
  {
    name: "Yunus (Jonas)",
    nameArabic: "يونس",
    slug: "yunus",
    peopleAddressed: "Le peuple de Ninive",
    quranicMentions: "Sujet d'une sourate entière (Yunus, bien que le recit principal soit dans As-Saffat et Al-Anbiya).",
    description:
      "Envoye au peuple de Ninive, Yunus quitte sa mission par decouragement avant l'ordre divin et se retrouve avale par un grand poisson après avoir été jete à la mer. Il implore le pardon divin depuis les tenebres et est sauve ; son peuple, quant à lui, finit par se repentir et echappe au châtiment - cas rare dans le Coran d'un peuple sauve après avoir cru.",
    era: "Période des Enfants d'Israel",
  },
  {
    name: "Zakariya (Zacharie)",
    nameArabic: "زكريا",
    slug: "zakariya",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Évoque dans Maryam et Al Imran.",
    description:
      "Gardien de Maryam (Marie) au Temple, Zakariya prie pour obtenir un enfant malgre son grand âge et la sterilite de son epouse. Sa prière est exaucee par la naissance de Yahya, annoncee par les anges.",
    era: "Contemporain de Maryam",
  },
  {
    name: "Yahya (Jean-Baptiste)",
    nameArabic: "يحيى",
    slug: "yahya",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Évoque dans Maryam et Al Imran.",
    description:
      "Fils de Zakariya, Yahya recoit la sagesse des sa jeunesse et est decrit par le Coran comme pieux, doux envers ses parents et etranger à l'orgueil. Il est traditionnellement associe a Jean le Baptiste.",
    era: "Contemporain d'Isa",
  },
  {
    name: "Isa (Jésus)",
    nameArabic: "عيسى",
    slug: "isa",
    peopleAddressed: "Les Enfants d'Israel",
    quranicMentions: "Très largement évoque, notamment dans Al Imran, Maryam et Al-Ma'ida.",
    description:
      "Ne miraculeusement de Maryam (Marie) sans intervention paternelle, Isa est considère en Islam comme un prophète et messager, porteur de l'Evangile (Injil), mais non comme divin ni fils de Dieu - une divergence théologique majeure avec le christianisme. Le Coran lui attribue des miracles par permission divine (guerisons, ressusciter les morts) et affirme qu'il n'a pas été tue ni crucifie mais élevé auprès de Dieu, sa fin terrestre exacte restant discutee parmi les commentateurs.",
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
