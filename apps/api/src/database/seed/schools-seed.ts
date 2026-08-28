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
    history: "Fondée à Médine par l'imam Malik ibn Anas, elle s'est particulièrement diffusee au Maghreb, en Afrique de l'Ouest et dans certaines régions du Golfe.",
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
    history: "Courant théologique (aqida) fondé par Abu al-Hasan al-Ash'ari, devenu l'une des écoles de théologie sunnite les plus repandues, notamment associée aux écoles shafi'ite et malikite.",
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
    history: "Courant théologique fondé par Abu Mansur al-Maturidi a Samarcande, historiquement associé à l'école juridique hanafite et répandu en Asie centrale et en Turquie.",
    principles: "Proche de l'ash'arisme sur de nombreux points, avec quelques divergences sur le rôle de la raison dans la connaissance du bien et du mal.",
    sourcesUsed: "Coran, Sunna, raisonnement rationnel (kalam).",
    era: "IVe siècle AH / Xe siècle",
  },
  {
    name: "Atharisme",
    slug: "atharisme",
    type: "theological",
    founderName: "Ahmad ibn Hanbal (figure de référence)",
    founderEra: "164-241 AH / 780-855",
    history: "Approche théologique privilegiant l'affirmation des textes (Coran et Sunna) sans recours à l'interprétation rationnelle systématique (kalam), historiquement associée à l'école hanbalite.",
    principles: "Affirme les textes relatifs aux attributs divins tels qu'ils sont rapportes, sans les interpréter allegoriquement ni chercher a en determiner la modalite (bila kayf).",
    sourcesUsed: "Coran, Sunna, compréhension attribuée aux premières generations (salaf).",
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
    divergenceExplanation: "La divergence provient de la diversité des hadiths rapportes sur ce point et de la manière dont chaque école a évalue leur authenticité et leur portée, ainsi que du poids accorde à la pratique observee dans chaque région (Médine pour les malikites, Kufa pour les hanafites, etc.).",
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
    divergenceExplanation: "Plusieurs hadiths authentiques decrivent des pratiques du Prophète ﷺ a des moments différents ; les écoles divergent sur la manière de les concilier ou de determiner lesquels refletent la pratique la plus établie.",
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
    divergenceExplanation: "La divergence tient à la question de savoir si la Basmala fait partie integrante du texte de la sourate Al-Fatiha, question sur laquelle les hadiths et les lectures coraniques rapportées varient.",
  },
  {
    title: "Ce qui annule les petites ablutions (wudu)",
    slug: "annulation-des-ablutions",
    category: "Purification (Tahara)",
    description: "Si le simple contact physique avec une personne du sexe opposé annule ou non l'état de pureté rituelle (wudu).",
    positions: [
      { schoolSlug: "malikite", text: "Le contact avec une intention ou un plaisir (mubashara bi-shahwa) annule le wudu ; un contact neutre et sans désir ne l'annule pas." },
      { schoolSlug: "hanafite", text: "Le simple contact de la peau n'annule pas le wudu, seule l'émission de fluide invalidant l'annule." },
      { schoolSlug: "shafiite", text: "Tout contact direct de peau a peau entre un homme et une femme non mahram annule le wudu, independamment de l'intention." },
      { schoolSlug: "hanbalite", text: "Le contact avec plaisir ou désir annule le wudu ; position proche de celle des malikites." },
    ],
    divergenceExplanation: "La divergence provient d'interprétations différentes du verset coranique évoquant le fait d'avoir \"touche les femmes\" (Coran 4:43 et 5:6) - certaines écoles y voient une allusion euphemique aux rapports intimes, d'autres un sens plus littéral incluant le simple contact.",
  },
  {
    title: "Sujud as-sahw (prosternation de l'oubli) : avant ou après le salam",
    slug: "sujud-as-sahw",
    category: "Prière (Salat)",
    description: "A quel moment de la prière effectuer les deux prosternations qui compensent un oubli (ajout, omission ou doute).",
    positions: [
      { schoolSlug: "malikite", text: "La prosternation se fait après le salam en cas d'ajout (ziyada) dans la prière, et avant le salam en cas d'omission (nuqsan)." },
      { schoolSlug: "hanafite", text: "La prosternation se fait toujours après le salam, quelle que soit la cause de l'oubli (ajout, omission ou doute)." },
      { schoolSlug: "shafiite", text: "La prosternation se fait toujours avant le salam, quelle que soit la cause de l'oubli." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des malikites : après le salam en cas d'ajout, avant le salam en cas d'omission." },
    ],
    divergenceExplanation: "Le Prophète ﷺ a été rapporté effectuant cette prosternation à des moments différents selon les hadiths (avant et après le salam) ; les écoles divergent sur la manière de concilier ces rapports, certaines optant pour une règle unique et d'autres pour une distinction selon la cause de l'oubli.",
  },
  {
    title: "Nombre minimal de participants requis pour la prière du vendredi (Jumu'a)",
    slug: "quorum-priere-vendredi",
    category: "Prière (Salat)",
    description: "Combien de personnes doivent être réunies, en plus de l'imam, pour que la prière du vendredi puisse valablement remplacer la prière de la mi-journée (dhuhr).",
    positions: [
      { schoolSlug: "malikite", text: "La position la plus connue de l'école exigé au moins douze hommes adultes en plus de l'imam, résidents du lieu où se tient la prière." },
      { schoolSlug: "hanafite", text: "Un nombre réduit suffit, généralement autour de trois personnes en plus de l'imam selon les rapporteurs de l'école les plus suivis." },
      { schoolSlug: "shafiite", text: "Quarante hommes adultes, libres et résidents permanents du lieu (mustawtinun) sont requis en plus de l'imam." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des shafi'ites : quarante hommes résidents permanents sont requis." },
    ],
    divergenceExplanation: "Chaque école s'appuie sur des rapports différents concernant les premières prières du vendredi organisées à l'époque du Prophète ﷺ et de ses Compagnons pour déterminer le seuil qu'elle retient comme condition de validité.",
  },
  {
    title: "Qunut dans la prière de l'aube (Fajr)",
    slug: "qunut-fajr",
    category: "Prière (Salat)",
    description: "Si une invocation (qunut) est récitée de façon régulière dans la deuxième unité de la prière du Fajr, en dehors de circonstances exceptionnelles.",
    positions: [
      { schoolSlug: "malikite", text: "Le qunut dans le Fajr est recommandé (mustahabb), récité silencieusement avant l'inclinaison (ruku') de la deuxième unité." },
      { schoolSlug: "hanafite", text: "Pas de qunut régulier dans le Fajr ; seul le qunun dans la prière du witr est retenu comme pratique établie." },
      { schoolSlug: "shafiite", text: "Le qunut dans le Fajr est une sunna confirmée (mu'akkada), récitée après l'inclinaison de la deuxième unité, généralement à voix haute par l'imam." },
      { schoolSlug: "hanbalite", text: "Pas de qunut régulier dans le Fajr, position proche de celle des hanafites, sauf en cas de calamité touchant la communauté (qunut an-nazila)." },
    ],
    divergenceExplanation: "La divergence tient à l'évaluation de l'authenticité et de la portée des hadiths rapportant que le Prophète ﷺ aurait récité un qunut au Fajr : certaines écoles y voient une pratique continue et établie, d'autres une réponse ponctuelle à des circonstances particulières, non reconduite en temps normal.",
  },
  {
    title: "La ventouse (hijama) annule-t-elle le jeûne ?",
    slug: "hijama-et-jeune",
    category: "Jeûne (Sawm)",
    description: "Si le fait de pratiquer ou de recevoir une ventouse thérapeutique (hijama) rompt le jeûne du Ramadan.",
    positions: [
      { schoolSlug: "malikite", text: "La ventouse n'annule pas le jeûne, sauf si elle provoqué une faiblesse importante poussant la personne à rompre volontairement pour une autre raison." },
      { schoolSlug: "hanafite", text: "La ventouse n'annule pas le jeûne." },
      { schoolSlug: "shafiite", text: "La ventouse n'annule pas le jeûne." },
      { schoolSlug: "hanbalite", text: "La ventouse annule le jeûne, aussi bien pour celui qui la pratique que pour celui qui la reçoit, conformément à un hadith explicite retenu par l'école sur ce point." },
    ],
    divergenceExplanation: "Le hadith \"le pratiquant et le receveur de la ventouse ont tous deux rompu leur jeûne\" est authentique et rapporté par plusieurs voies ; les écoles divergent sur son statut juridique définitif, certaines le considérant abrogé ou limité à un contexte précis (faiblesse induite), d'autres le retenant comme une règle applicable telle quelle.",
  },
  {
    title: "Le jeûne du voyageur",
    slug: "jeune-du-voyageur",
    category: "Jeûne (Sawm)",
    description: "Si un voyageur en état de rukhsa (concession légale) doit préférer jeûner ou rompre le jeûne durant son voyage.",
    positions: [
      { schoolSlug: "malikite", text: "Jeûner reste généralement préférable pour le voyageur, sauf en cas de réelle difficulté (mashaqqa)." },
      { schoolSlug: "hanafite", text: "Le jeûne reste valide et généralement préférable pendant le voyage si cela ne cause pas de difficulté notable ; rompre demeure une concession permise." },
      { schoolSlug: "shafiite", text: "Le voyageur peut choisir librement entre jeûner et rompre le jeûne, les deux étant permis sans préférence marquée, selon ce qui lui est le plus facile." },
      { schoolSlug: "hanbalite", text: "Rompre le jeûne pendant le voyage est généralement considéré préférable (afdal), en suivant l'exemple prophétique le plus mis en avant par l'école sur ce point." },
    ],
    divergenceExplanation: "Le Coran (2:184-185) mentionne explicitement la concession du voyage sans en préciser la préférence entre jeûner et rompre ; les écoles s'appuient sur des hadiths différents rapportant la pratique du Prophète ﷺ en voyage pour trancher cette préférence.",
  },
  {
    title: "Rattrapage (qada) des jours de jeûne manqués : ajout d'un fidya en cas de retard",
    slug: "qada-et-fidya",
    category: "Jeûne (Sawm)",
    description: "Si un rattrapage effectué après le Ramadan suivant, sans excuse valable, nécessite en plus un fidya (compensation alimentaire) pour chaque jour de retard.",
    positions: [
      { schoolSlug: "malikite", text: "Le rattrapage reste obligatoire ; un fidya s'ajoute pour chaque jour reporté sans excuse valable au-delà du Ramadan suivant." },
      { schoolSlug: "hanafite", text: "Le jour manqué doit être rattrapé (qada), sans obligation supplémentaire de fidya même en cas de retard au-delà du Ramadan suivant." },
      { schoolSlug: "shafiite", text: "Même position que les malikites : qada plus fidya en cas de retard injustifié au-delà du Ramadan suivant." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des malikites et shafi'ites concernant l'ajout du fidya en cas de retard injustifié." },
    ],
    divergenceExplanation: "La divergence porte sur l'interprétation d'un avis rapporté de plusieurs Compagnons recommandant un fidya en cas de retard injustifié : les trois écoles majoritaires le retiennent comme une règle contraignante, tandis que l'école hanafite ne le considère pas comme obligatoire.",
  },
  {
    title: "La zakat sur les bijoux en or et argent à usage personnel",
    slug: "zakat-sur-les-bijoux",
    category: "Zakat",
    description: "Si les bijoux en or ou en argent portés ou possédés pour un usage personnel licite sont soumis à la zakat, au même titre que l'or et l'argent thésaurisés.",
    positions: [
      { schoolSlug: "malikite", text: "Les bijoux à usage personnel licite ne sont généralement pas soumis à la zakat." },
      { schoolSlug: "hanafite", text: "La zakat est due sur les bijoux en or et argent même à usage personnel licite, dès lors que le nisab est atteint." },
      { schoolSlug: "shafiite", text: "Les bijoux à usage personnel licite, dans une mesure raisonnable, ne sont pas soumis à la zakat." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des malikites et shafi'ites : pas de zakat sur les bijoux à usage personnel licite." },
    ],
    divergenceExplanation: "La divergence tient à la portée donnée aux hadiths généraux sur la zakat de l'or et de l'argent : l'école hanafite les appliqué sans exception à toute quantité atteignant le nisab, tandis que les trois autres écoles y voient une exception implicite pour les bijoux destinés à un usage personnel licite, considérés comme un bien d'usage plutôt qu'un bien thésaurisé.",
  },
  {
    title: "Zakat al-fitr : nourriture ou équivalent monétaire",
    slug: "zakat-al-fitr-nature",
    category: "Zakat",
    description: "Si la zakat al-fitr, versée avant la prière de l'Aïd al-Fitr, doit obligatoirement être donnée en nourriture ou si sa valeur monétaire équivalente est également acceptée.",
    positions: [
      { schoolSlug: "malikite", text: "Le versement doit se faire exclusivement sous forme de nourriture (denrée de base locale), pas en valeur monétaire." },
      { schoolSlug: "hanafite", text: "Le versement en valeur monétaire équivalente est autorisé, en plus du versement en nourriture." },
      { schoolSlug: "shafiite", text: "Le versement doit se faire exclusivement sous forme de nourriture, position identique à celle des malikites." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des malikites et shafi'ites : nourriture uniquement, pas de valeur monétaire." },
    ],
    divergenceExplanation: "Les hadiths sur la zakat al-fitr précisent des quantités de denrées alimentaires (dattes, orge...) sans mentionner explicitement une équivalence monétaire : l'école hanafite y voit une indication de valeur transposable selon le contexte, tandis que les trois autres écoles s'en tiennent à la forme littérale rapportée.",
  },
  {
    title: "Le tayammum : quelles surfaces permettent l'ablution sèche",
    slug: "surfaces-valides-tayammum",
    category: "Purification (Tahara)",
    description: "Quelles surfaces peuvent être utilisées pour le tayammum (ablution sèche) en l'absence d'eau ou en cas d'impossibilité de l'utiliser.",
    positions: [
      { schoolSlug: "malikite", text: "Toute substance de nature terrestre (terre, sable, pierre, roche...) est valable pour le tayammum." },
      { schoolSlug: "hanafite", text: "Toute substance de nature terrestre est valable, position proche de celle des malikites." },
      { schoolSlug: "shafiite", text: "Seule la terre poussiéreuse (turab) contenant une poussière qui adhère à la peau est valable." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des shafi'ites : la terre poussiéreuse est requise." },
    ],
    divergenceExplanation: "La divergence porte sur le sens du terme coranique \"sa'idan tayyiban\" (Coran 4:43 et 5:6) : les écoles hanafite et malikite y voient une référence large à la surface de la terre en général, tandis que les écoles shafi'ite et hanbalite retiennent un sens plus restreint, limité à la terre poussiéreuse proprement dite.",
  },
  {
    title: "Pureté de l'eau en petite quantité touchée par une impureté",
    slug: "purete-eau-qullatayn",
    category: "Purification (Tahara)",
    description: "Si une petite quantité d'eau stagnante devient impure au simple contact d'une impureté (najasa), même sans changement visible de goût, couleur ou odeur.",
    positions: [
      { schoolSlug: "malikite", text: "L'eau ne devient impure que si un changement de goût, de couleur ou d'odeur est constaté, quelle que soit sa quantité." },
      { schoolSlug: "hanafite", text: "Le critère retenu est le changement des propriétés de l'eau (goût, couleur, odeur) plutôt qu'un seuil de quantité fixe, avec une attention particulière portée à l'eau courante." },
      { schoolSlug: "shafiite", text: "En dessous d'un seuil de quantité dit \"qullatayn\" (environ deux grandes jarres), l'eau devient impure au simple contact d'une impureté, même sans changement visible ; au-dessus de ce seuil, seul un changement de propriétés la rend impure." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des shafi'ites concernant le seuil du qullatayn." },
    ],
    divergenceExplanation: "Le concept de qullatayn s'appuie sur un hadith fixant un seuil de quantité ; les écoles shafi'ite et hanbalite le retiennent comme critère central, tandis que les écoles malikite et hanafite privilégient le critère du changement observable des propriétés de l'eau, indépendamment de la quantité.",
  },
  {
    title: "Éléments obligatoires du ghusl (grande ablution)",
    slug: "elements-obligatoires-ghusl",
    category: "Purification (Tahara)",
    description: "Quels gestes sont strictement obligatoires (fard) pour que le ghusl soit valide, au-delà du fait de faire couler l'eau sur tout le corps.",
    positions: [
      { schoolSlug: "malikite", text: "Faire couler l'eau sur tout le corps en frottant (dalk), le frottement étant considéré comme un élément obligatoire à part entière." },
      { schoolSlug: "hanafite", text: "Trois éléments sont obligatoires : rincer la bouche, rincer le nez, et faire couler l'eau sur tout le reste du corps." },
      { schoolSlug: "shafiite", text: "Seuls l'intention (niyya) et le passage de l'eau sur tout le corps sont obligatoires ; rincer la bouche et le nez est recommandé (sunna) mais pas obligatoire." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des shafi'ites : intention et passage de l'eau sur tout le corps suffisent, rincer bouche et nez restant recommandé." },
    ],
    divergenceExplanation: "La divergence porte sur le statut juridique du rinçage de la bouche et du nez lors du ghusl : l'école hanafite les inclut parmi les éléments obligatoires par analogie avec certains textes, tandis que les trois autres écoles les considèrent comme des compléments recommandés sans lesquels le ghusl reste néanmoins valide.",
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
