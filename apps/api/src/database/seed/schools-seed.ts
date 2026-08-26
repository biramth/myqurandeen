import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, fiqhDivergenceNotes, fiqhPositions, fiqhTopics, schools, sources } from "../schema";

/**
 * Écoles juridiques (fiqh) et courants théologiques, et comparateur de
 * positions. Aucune API ouverte n'existe pour ce domaine : ce contenu est
 * compilé a partir d'ouvrages de référence standards de fiqh compare,
 * notamment "Al-Fiqh ala al-Madhahib al-Arba'a" d'Abd al-Rahman al-Jaziri,
 * qui a précisément pour objet de présenter les positions des quatre
 * écoles sunnites cote a cote. Chaque position est attribuee à l'école
 * concernee sans jugement de valeur - voir CONTRIBUTING.md.
 */

const FIQH_REFERENCE = {
  title: "Al-Fiqh ala al-Madhahib al-Arba'a",
  authorName: "Abd al-Rahman al-Jaziri",
  authorEra: "1882-1941",
};

interface SchoolSeed {
  name: string;
  slug: string;
  type: "fiqh" | "theological";
  founderName: string;
  founderEra: string;
  history: string;
  principles: string;
  sourcesUsed: string;
  era: string;
}

const SCHOOLS: SchoolSeed[] = [
  {
    name: "École malikite",
    slug: "malikite",
    type: "fiqh",
    founderName: "Malik ibn Anas",
    founderEra: "93-179 AH / 711-795",
    history: "Fondée à Médine par l'imam Malik ibn Anas, elle s'est particulièrement diffusee au Maghreb, en Afrique de l'Ouest et dans certaines regions du Golfe.",
    principles: "Accorde une place importante à la pratique des habitants de Médine ('amal ahl al-Madina), considérée comme un témoignage vivant de la Sunna.",
    sourcesUsed: "Coran, Sunna, consensus (ijma'), pratique des Medinois, raisonnement analogique (qiyas), intérêt général (maslaha).",
    era: "IIe siècle AH / VIIIe siècle",
  },
  {
    name: "École hanafite",
    slug: "hanafite",
    type: "fiqh",
    founderName: "Abu Hanifa",
    founderEra: "80-150 AH / 699-767",
    history: "Fondée a Kufa (Irak) par l'imam Abu Hanifa an-Nu'man, c'est aujourd'hui l'école la plus répandue numériquement, notamment en Turquie, Asie centrale et sous-continent indien.",
    principles: "Recours frequent au raisonnement analogique (qiyas) et à la préférence juridique (istihsan) face à des situations non explicitement traitees.",
    sourcesUsed: "Coran, Sunna, consensus (ijma'), raisonnement analogique (qiyas), préférence juridique (istihsan), coutume ('urf).",
    era: "IIe siècle AH / VIIIe siècle",
  },
  {
    name: "École shafi'ite",
    slug: "shafiite",
    type: "fiqh",
    founderName: "Muhammad ibn Idris ash-Shafi'i",
    founderEra: "150-204 AH / 767-820",
    history: "Fondée par l'imam ash-Shafi'i, qui a systématisé les principes de l'usul al-fiqh (méthodologie juridique). Répandue notamment en Égypte, Asie du Sud-Est, Yemen et Afrique de l'Est.",
    principles: "Première systématisation rigoureuse de la hiérarchie des sources du droit islamique, exposee dans son ouvrage Ar-Risala.",
    sourcesUsed: "Coran, Sunna, consensus (ijma'), raisonnement analogique (qiyas), avec un cadre méthodologique très codifie.",
    era: "IIe-IIIe siècle AH / VIIIe-IXe siècle",
  },
  {
    name: "École hanbalite",
    slug: "hanbalite",
    type: "fiqh",
    founderName: "Ahmad ibn Hanbal",
    founderEra: "164-241 AH / 780-855",
    history: "Fondée par l'imam Ahmad ibn Hanbal, connu aussi pour son recueil de hadiths (Musnad). Predominante aujourd'hui en Arabie Saoudite et dans le Golfe.",
    principles: "Attache une importance particulière au hadith authentique et se montre généralement prudente vis-a-vis du raisonnement analogique lorsque un texte est disponible.",
    sourcesUsed: "Coran, Sunna (y compris hadiths faibles preferes à l'opinion personnelle dans certains cas), avis des Compagnons, raisonnement analogique en dernier recours.",
    era: "IIIe siècle AH / IXe siècle",
  },
  {
    name: "Ash'arisme",
    slug: "asharisme",
    type: "theological",
    founderName: "Abu al-Hasan al-Ash'ari",
    founderEra: "260-324 AH / 874-936",
    history: "Courant théologique (aqida) fonde par Abu al-Hasan al-Ash'ari, devenu l'une des écoles de théologie sunnite les plus repandues, notamment associee aux écoles shafi'ite et malikite.",
    principles: "Cherche une voie mediane entre le rationalisme mu'tazilite et le litteralisme, tout en utilisant des outils rationnels pour defendre les articles de foi.",
    sourcesUsed: "Coran, Sunna, raisonnement rationnel (kalam) au service de la defense des croyances.",
    era: "IVe siècle AH / Xe siècle",
  },
  {
    name: "Maturidisme",
    slug: "maturidisme",
    type: "theological",
    founderName: "Abu Mansur al-Maturidi",
    founderEra: "m. 333 AH / 944",
    history: "Courant théologique fonde par Abu Mansur al-Maturidi a Samarcande, historiquement associe à l'école juridique hanafite et répandu en Asie centrale et en Turquie.",
    principles: "Proche de l'ash'arisme sur de nombreux points, avec quelques divergences sur le role de la raison dans la connaissance du bien et du mal.",
    sourcesUsed: "Coran, Sunna, raisonnement rationnel (kalam).",
    era: "IVe siècle AH / Xe siècle",
  },
  {
    name: "Atharisme",
    slug: "atharisme",
    type: "theological",
    founderName: "Ahmad ibn Hanbal (figure de référence)",
    founderEra: "164-241 AH / 780-855",
    history: "Approche théologique privilegiant l'affirmation des textes (Coran et Sunna) sans recours à l'interprétation rationnelle systématique (kalam), historiquement associee à l'école hanbalite.",
    principles: "Affirme les textes relatifs aux attributs divins tels qu'ils sont rapportes, sans les interpréter allegoriquement ni chercher a en determiner la modalite (bila kayf).",
    sourcesUsed: "Coran, Sunna, compréhension attribuee aux premieres generations (salaf).",
    era: "IIIe siècle AH / IXe siècle et suivants",
  },
  {
    name: "Mu'tazilisme",
    slug: "mutazilisme",
    type: "theological",
    founderName: "Wasil ibn Ata (figure fondatrice traditionnelle)",
    founderEra: "80-131 AH / 699-748",
    history: "Courant théologique rationaliste apparu a Bassora, influent notamment sous le califat abbasside, aujourd'hui minoritaire mais historiquement déterminant dans le développement du kalam islamique.",
    principles: "Accorde une place centrale à la raison, notamment sur des questions comme la justice divine et le libre arbitre ; position minoritaire distincte du courant sunnite majoritaire sur plusieurs points de doctrine.",
    sourcesUsed: "Coran interprète à la lumiere du raisonnement rationnel (kalam).",
    era: "IIe siècle AH / VIIIe siècle",
  },
];

interface FiqhTopicSeed {
  title: string;
  slug: string;
  category: string;
  description: string;
  positions: { schoolSlug: string; text: string }[];
  divergenceExplanation: string;
}

const FIQH_TOPICS: FiqhTopicSeed[] = [
  {
    title: "Position des mains pendant la prière",
    slug: "position-des-mains-priere",
    category: "Prière (Salat)",
    description: "Ou et comment placer les mains durant la station debout (qiyam) de la prière.",
    positions: [
      { schoolSlug: "malikite", text: "Dans la position la plus connue de l'école, les mains sont laissees le long du corps (sadl) plutôt que croisees, bien que certains malikites rapportent aussi la position croisee." },
      { schoolSlug: "hanafite", text: "La main droite est placee sur la main gauche, sous le nombril." },
      { schoolSlug: "shafiite", text: "La main droite est placee sur la main gauche, sur la poitrine." },
      { schoolSlug: "hanbalite", text: "La main droite est placee sur la main gauche, généralement sous le nombril, position proche de celle des hanafites." },
    ],
    divergenceExplanation: "La divergence provient de la diversite des hadiths rapportes sur ce point et de la manière dont chaque école a évalue leur authenticité et leur portée, ainsi que du poids accorde à la pratique observee dans chaque region (Médine pour les malikites, Kufa pour les hanafites, etc.).",
  },
  {
    title: "Lever les mains (raf' al-yadayn) durant la prière",
    slug: "rafi-al-yadayn",
    category: "Prière (Salat)",
    description: "A quels moments de la prière il est recommande de lever les mains au niveau des epaules ou des oreilles.",
    positions: [
      { schoolSlug: "malikite", text: "Le lever des mains est généralement limite au takbir d'ouverture de la prière (takbirat al-ihram)." },
      { schoolSlug: "hanafite", text: "Le lever des mains est prescrit au takbir d'ouverture ; les positions varient ensuite selon les rapporteurs pour les inclinaisons." },
      { schoolSlug: "shafiite", text: "Le lever des mains est prescrit à l'ouverture, avant et après l'inclinaison (ruku')." },
      { schoolSlug: "hanbalite", text: "Le lever des mains est prescrit à l'ouverture, avant et après l'inclinaison (ruku'), position proche de celle des shafi'ites." },
    ],
    divergenceExplanation: "Plusieurs hadiths authentiques decrivent des pratiques du Prophète ﷺ a des moments differents ; les écoles divergent sur la manière de les concilier ou de determiner lesquels refletent la pratique la plus établie.",
  },
  {
    title: "Récitation de la Basmala a voix haute",
    slug: "basmala-a-voix-haute",
    category: "Prière (Salat)",
    description: "Si la formule \"Bismillah ar-Rahman ar-Rahim\" doit être récitée a voix haute ou basse avant la Fatiha dans les prières a voix haute.",
    positions: [
      { schoolSlug: "malikite", text: "La Basmala n'est pas récitée du tout au debut de la Fatiha dans la prière, position spécifique à cette école." },
      { schoolSlug: "hanafite", text: "La Basmala est récitée, mais toujours a voix basse, même dans les prières a voix haute." },
      { schoolSlug: "shafiite", text: "La Basmala est considérée comme un verset de la Fatiha et est récitée a voix haute dans les prières concernees." },
      { schoolSlug: "hanbalite", text: "La Basmala est récitée a voix basse, position proche de celle des hanafites." },
    ],
    divergenceExplanation: "La divergence tient à la question de savoir si la Basmala fait partie integrante du texte de la sourate Al-Fatiha, question sur laquelle les hadiths et les lectures coraniques rapportees varient.",
  },
  {
    title: "Ce qui annule les petites ablutions (wudu)",
    slug: "annulation-des-ablutions",
    category: "Purification (Tahara)",
    description: "Si le simple contact physique avec une personne du sexe oppose annule ou non l'état de purete rituelle (wudu).",
    positions: [
      { schoolSlug: "malikite", text: "Le contact avec une intention ou un plaisir (mubashara bi-shahwa) annule le wudu ; un contact neutre et sans desir ne l'annule pas." },
      { schoolSlug: "hanafite", text: "Le simple contact de la peau n'annule pas le wudu, seule l'emission de fluide invalidant l'annule." },
      { schoolSlug: "shafiite", text: "Tout contact direct de peau a peau entre un homme et une femme non mahram annule le wudu, independamment de l'intention." },
      { schoolSlug: "hanbalite", text: "Le contact avec plaisir ou desir annule le wudu ; position proche de celle des malikites." },
    ],
    divergenceExplanation: "La divergence provient d'interprétations differentes du verset coranique évoquant le fait d'avoir \"touche les femmes\" (Coran 4:43 et 5:6) - certaines écoles y voient une allusion euphemique aux rapports intimes, d'autres un sens plus littéral incluant le simple contact.",
  },
];

export async function seedSchools(db: Database): Promise<void> {
  const [refAuthor] = await db
    .insert(authors)
    .values({ name: FIQH_REFERENCE.authorName, era: FIQH_REFERENCE.authorEra })
    .onConflictDoNothing()
    .returning();
  const refAuthorRow = refAuthor ?? (await db.query.authors.findFirst({ where: eq(authors.name, FIQH_REFERENCE.authorName) }));

  const [refSource] = await db
    .insert(sources)
    .values({ title: FIQH_REFERENCE.title, type: "book", authorId: refAuthorRow?.id, language: "ar" })
    .onConflictDoNothing()
    .returning();
  const refSourceRow = refSource ?? (await db.query.sources.findFirst({ where: eq(sources.title, FIQH_REFERENCE.title) }));
  if (!refSourceRow) throw new Error("Impossible de créer la source de référence fiqh");

  const schoolIdBySlug = new Map<string, string>();
  for (const s of SCHOOLS) {
    // La figure fondatrice est enregistree comme `author` (référence croisee
    // future avec le module Savants), même si non liée ici via founderScholarId.
    await db.insert(authors).values({ name: s.founderName, era: s.founderEra }).onConflictDoNothing();

    const [school] = await db
      .insert(schools)
      .values({
        name: s.name,
        slug: s.slug,
        type: s.type,
        founderScholarId: null,
        history: s.history,
        principles: s.principles,
        sourcesUsed: s.sourcesUsed,
        era: s.era,
      })
      .onConflictDoUpdate({
        target: schools.slug,
        set: { name: s.name, history: s.history, principles: s.principles, sourcesUsed: s.sourcesUsed, era: s.era },
      })
      .returning();
    schoolIdBySlug.set(s.slug, school.id);
  }

  let topicCount = 0;
  let positionCount = 0;

  for (const topicSeed of FIQH_TOPICS) {
    const [topic] = await db
      .insert(fiqhTopics)
      .values({
        title: topicSeed.title,
        slug: topicSeed.slug,
        category: topicSeed.category,
        description: topicSeed.description,
      })
      .onConflictDoUpdate({
        target: fiqhTopics.slug,
        set: { title: topicSeed.title, category: topicSeed.category, description: topicSeed.description },
      })
      .returning();
    topicCount++;

    for (const position of topicSeed.positions) {
      const schoolId = schoolIdBySlug.get(position.schoolSlug);
      if (!schoolId) continue;
      await db
        .insert(fiqhPositions)
        .values({
          fiqhTopicId: topic.id,
          schoolId,
          positionText: position.text,
          sourceId: refSourceRow.id,
        })
        .onConflictDoUpdate({
          target: [fiqhPositions.fiqhTopicId, fiqhPositions.schoolId],
          set: { positionText: position.text },
        });
      positionCount++;
    }

    const existingNote = await db.query.fiqhDivergenceNotes.findFirst({
      where: eq(fiqhDivergenceNotes.fiqhTopicId, topic.id),
    });
    if (!existingNote) {
      await db
        .insert(fiqhDivergenceNotes)
        .values({ fiqhTopicId: topic.id, explanation: topicSeed.divergenceExplanation, sourceId: refSourceRow.id });
    }
  }

  console.log(`Écoles: ${SCHOOLS.length} écoles, ${topicCount} sujets, ${positionCount} positions seedes.`);
}
