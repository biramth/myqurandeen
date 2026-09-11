import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, fiqhDivergenceNotes, fiqhPositions, fiqhTopics, schools, sources } from "../schema";

/**
 * Écoles juridiques (fiqh) et courants théologiques, et comparateur de
 * positions. Aucune API ouverte n'existe pour ce domaine : ce contenu est
 * compilé à partir d'ouvrages de référence standards de fiqh comparé,
 * notamment "Al-Fiqh ala al-Madhahib al-Arba'a" d'Abd al-Rahman al-Jaziri,
 * qui a précisément pour objet de présenter les positions des quatre
 * écoles sunnites côte à côte. Chaque position est attribuée à l'école
 * concernée sans jugement de valeur - voir CONTRIBUTING.md.
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
    history:
      "Fondée à Médine par l'imam Malik ibn Anas, qui y enseigna toute sa vie dans la mosquée du Prophète ﷺ, l'école malikite s'est diffusée très tôt en Afrique du Nord et en Andalousie grâce aux étudiants venus étudier auprès de Malik puis retournés enseigner dans leurs régions d'origine. Elle est aujourd'hui l'école dominante au Maghreb (Maroc, Algérie, Tunisie, Libye), en Afrique de l'Ouest (Sénégal, Mali, Nigeria...) et coexiste avec l'école hanbalite dans certaines régions du Golfe, notamment au Koweït et aux Émirats.",
    principles:
      "Accorde une place structurellement importante à la pratique des habitants de Médine ('amal ahl al-Madina), considérée comme un témoignage vivant et ininterrompu de la Sunna transmise depuis le Prophète ﷺ - une source distinctive qui n'a pas d'équivalent dans les autres écoles. Recourt également largement au principe de l'intérêt général (maslaha mursala) pour statuer sur des questions non explicitement traitées par les textes, et à la pratique consistant à bloquer les moyens menant à un mal (sadd adh-dhara'i), même lorsque l'acte initial n'est pas interdit en lui-même.",
    sourcesUsed: "Coran, Sunna, consensus (ijma'), pratique des Medinois, raisonnement analogique (qiyas), intérêt général (maslaha).",
    era: "IIe siècle AH / VIIIe siècle",
  },
  {
    name: "École hanafite",
    slug: "hanafite",
    type: "fiqh",
    founderName: "Abu Hanifa",
    founderEra: "80-150 AH / 699-767",
    history:
      "Fondée à Kufa (Irak) par l'imam Abu Hanifa an-Nu'man et systématisée par ses élèves Abu Yusuf et Muhammad ash-Shaybani, l'école hanafite bénéficia très tôt d'un statut privilégié du fait de l'adhésion de nombreux juges et administrateurs de l'empire abbasside, ce qui favorisa sa diffusion rapide. C'est aujourd'hui l'école la plus répandue numériquement dans le monde musulman, dominante en Turquie, dans les Balkans, en Asie centrale, ainsi que dans le sous-continent indien (Pakistan, Inde, Bangladesh) et en Afghanistan.",
    principles:
      "Recours particulièrement développé au raisonnement analogique (qiyas) et à la préférence juridique (istihsan, qui permet de s'écarter d'une analogie stricte lorsqu'elle mène à un résultat jugé inéquitable), face à des situations non explicitement traitées par les textes. L'école accorde également un poids notable à la coutume locale ('urf) dans les domaines où aucun texte n'est disponible, ce qui a favorisé son adaptation à la grande diversité de contextes culturels rencontrés lors de son expansion vers l'Asie centrale et l'Inde.",
    sourcesUsed: "Coran, Sunna, consensus (ijma'), raisonnement analogique (qiyas), préférence juridique (istihsan), coutume ('urf).",
    era: "IIe siècle AH / VIIIe siècle",
  },
  {
    name: "École shafi'ite",
    slug: "shafiite",
    type: "fiqh",
    founderName: "Muhammad ibn Idris ash-Shafi'i",
    founderEra: "150-204 AH / 767-820",
    history:
      "Fondée par l'imam ash-Shafi'i, qui étudia successivement auprès de Malik à Médine puis des disciples d'Abu Hanifa en Irak avant de systématiser les principes de l'usul al-fiqh (méthodologie juridique) dans son ouvrage Ar-Risala, la première œuvre du genre. Il revisa une partie de sa propre doctrine après son installation en Égypte à la fin de sa vie. L'école s'est répandue notamment en Égypte, en Afrique de l'Est (Somalie, côté swahilie), en Asie du Sud-Est (Indonésie, Malaisie) et au Yemen.",
    principles:
      "Première systématisation rigoureuse et explicite de la hiérarchie des sources du droit islamique, exposée dans Ar-Risala : le Coran et la Sunna authentifiée priment, suivis du consensus (ijma') puis du raisonnement analogique (qiyas), avec des règles précises encadrant chaque étape du raisonnement juridique. Cette codification méthodologique a fortement influencé la manière dont les trois autres écoles sunnites ont elles-mêmes structuré et justifié leur propre approche par la suite.",
    sourcesUsed: "Coran, Sunna, consensus (ijma'), raisonnement analogique (qiyas), avec un cadre méthodologique très codifié.",
    era: "IIe-IIIe siècle AH / VIIIe-IXe siècle",
  },
  {
    name: "École hanbalite",
    slug: "hanbalite",
    type: "fiqh",
    founderName: "Ahmad ibn Hanbal",
    founderEra: "164-241 AH / 780-855",
    history:
      "Fondée par l'imam Ahmad ibn Hanbal, connu aussi pour son immense recueil de hadiths (le Musnad) et pour sa résistance à la pression du pouvoir abbasside durant la mihna, l'école hanbalite resta longtemps minoritaire face aux trois autres écoles, avant d'être revitalisée par des savants comme Ibn Taymiyyah et son élève Ibn Qayyim al-Jawziyya au XIVe siècle. Elle est aujourd'hui prédominante en Arabie Saoudite et dans une grande partie du Golfe, et constitue la base juridique de référence du courant salafi contemporain.",
    principles:
      "Attache une importance particulière au hadith authentique, y compris de portée limitée, et se montre généralement prudente vis-à-vis du raisonnement analogique systématique lorsqu'un texte, même faible selon d'autres critères, est disponible et qu'aucun texte plus fort ne le contredit. L'école privilégie également les avis rapportés des Compagnons du Prophète ﷺ lorsqu'aucun texte direct ne tranche une question, avant de recourir au raisonnement analogique proprement dit, considéré comme un dernier recours.",
    sourcesUsed: "Coran, Sunna (y compris hadiths faibles préférés à l'opinion personnelle dans certains cas), avis des Compagnons, raisonnement analogique en dernier recours.",
    era: "IIIe siècle AH / IXe siècle",
  },
  {
    name: "Ash'arisme",
    slug: "asharisme",
    type: "theological",
    founderName: "Abu al-Hasan al-Ash'ari",
    founderEra: "260-324 AH / 874-936",
    history:
      "Courant théologique (aqida) fondé par Abu al-Hasan al-Ash'ari, qui rompit publiquement avec le mu'tazilisme rationaliste dans lequel il avait été formé pour développer une voie intermédiaire, plus tard consolidée et diffusée par des savants majeurs comme Al-Baqillani et surtout Al-Ghazali. Devenu l'une des écoles de théologie sunnite les plus répandues historiquement, elle s'est particulièrement associée aux écoles juridiques shafi'ite et malikite, et demeure aujourd'hui largement enseignée dans les grandes institutions sunnites traditionnelles comme Al-Azhar au Caire.",
    principles:
      "Cherche une voie médiane entre le rationalisme systématique du mu'tazilisme, jugé excessif dans la subordination des textes à la raison, et le littéralisme strict qui refuse tout recours à l'interprétation, tout en utilisant des outils du raisonnement rationnel (kalam) pour défendre et argumenter les articles de foi islamiques face aux objections philosophiques. Sur les attributs divins évoqués dans des termes apparemment corporels (la \"main\" ou le \"visage\" de Dieu, par exemple), l'école privilégie généralement une interprétation allégorique (ta'wil) plutôt qu'une affirmation littérale sans spécification de la modalité.",
    sourcesUsed: "Coran, Sunna, raisonnement rationnel (kalam) au service de la défense des croyances.",
    era: "IVe siècle AH / Xe siècle",
  },
  {
    name: "Maturidisme",
    slug: "maturidisme",
    type: "theological",
    founderName: "Abu Mansur al-Maturidi",
    founderEra: "m. 333 AH / 944",
    history:
      "Courant théologique fondé par Abu Mansur al-Maturidi à Samarcande, développé indépendamment de l'ash'arisme mais à la même époque et dans un esprit méthodologique proche, historiquement associé à l'école juridique hanafite dont il partage souvent le contexte géographique. Répandu en Asie centrale, en Turquie et dans les Balkans, il constitue avec l'ash'arisme l'une des deux grandes écoles de théologie sunnite reconnues comme orthodoxes par la tradition classique.",
    principles:
      "Proche de l'ash'arisme sur la plupart des questions doctrinales fondamentales (unicité divine, attributs, prophétie, eschatologie), avec quelques divergences notables, notamment sur le rôle de la raison dans la connaissance du bien et du mal : les maturidites considèrent que la raison humaine peut, dans une certaine mesure, discerner par elle-même certaines obligations morales de base indépendamment de la révélation, alors que les ash'arites tendent à faire dépendre entièrement la notion de bien et de mal de ce que la révélation désigne comme tel.",
    sourcesUsed: "Coran, Sunna, raisonnement rationnel (kalam).",
    era: "IVe siècle AH / Xe siècle",
  },
  {
    name: "Atharisme",
    slug: "atharisme",
    type: "theological",
    founderName: "Ahmad ibn Hanbal (figure de référence)",
    founderEra: "164-241 AH / 780-855",
    history:
      "Approche théologique privilégiant l'affirmation des textes (Coran et Sunna) sans recours à l'interprétation rationnelle systématique (kalam), historiquement associée à l'école hanbalite et à des figures comme Ibn Taymiyyah et Ibn Qayyim al-Jawziyya qui l'ont ultérieurement systématisée et défendue face aux critiques ash'arites et mu'tazilites. Elle constitue aujourd'hui la base théologique du courant salafi contemporain et reste influente en Arabie Saoudite et dans certains milieux hanbalites du Golfe.",
    principles:
      "Affirme les textes relatifs aux attributs divins tels qu'ils sont rapportés dans le Coran et la Sunna (la \"main\", le \"visage\", l'\"établissement sur le Trône\"), sans les interpréter allégoriquement comme le font les ash'arites, mais sans chercher non plus à en déterminer la modalité exacte (bila kayf, \"sans [demander] comment\"), une position résumée par la formule attribuée à Malik ibn Anas selon laquelle \"l'établissement [sur le Trône] est connu, sa modalité est inconnue, y croire est obligatoire, et interroger à ce sujet est une innovation blâmable\".",
    sourcesUsed: "Coran, Sunna, compréhension attribuée aux premières générations (salaf).",
    era: "IIIe siècle AH / IXe siècle et suivants",
  },
  {
    name: "Mu'tazilisme",
    slug: "mutazilisme",
    type: "theological",
    founderName: "Wasil ibn Ata (figure fondatrice traditionnelle)",
    founderEra: "80-131 AH / 699-748",
    history:
      "Courant théologique rationaliste apparu à Bassora, traditionnellement rattaché à la rupture de Wasil ibn Ata avec son maître Al-Hasan al-Basri sur la question du statut du croyant ayant commis un péché grave. Le mu'tazilisme devint doctrine officielle du califat abbasside sous Al-Ma'mun et ses deux successeurs immédiats au IXe siècle, période durant laquelle une inquisition (mihna) fut imposée aux savants refusant d'adhérer à la thèse mu'tazilite du Coran créé - résistance à laquelle Ahmad ibn Hanbal doit une grande partie de sa notoriété. Le mouvement décline ensuite face à la contre-offensive ash'arite et hanbalite, et demeure aujourd'hui minoritaire, bien qu'historiquement déterminant dans le développement des outils et du vocabulaire du kalam islamique, y compris chez ses adversaires théologiques.",
    principles:
      "Accorde une place centrale à la raison, considérée capable de déterminer indépendamment certaines vérités morales et théologiques, notamment sur des questions comme la justice divine (Dieu ne peut, selon cette école, agir injustement par définition rationnelle de la justice) et le libre arbitre humain (l'être humain est l'auteur réel de ses actes, contrairement à la lecture plus déterministe dominante chez les ash'arites). Position minoritaire et distincte du courant sunnite majoritaire également sur la nature du Coran, considéré créé et non incréé, et sur le statut du croyant ayant commis un grand péché, placé dans une position intermédiaire entre croyant et mécréant.",
    sourcesUsed: "Coran interprété à la lumière du raisonnement rationnel (kalam).",
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
    description: "Où et comment placer les mains durant la station debout (qiyam) de la prière.",
    positions: [
      { schoolSlug: "malikite", text: "Dans la position la plus connue de l'école, les mains sont laissées le long du corps (sadl) plutôt que croisées, bien que certains malikites rapportent aussi la position croisée." },
      { schoolSlug: "hanafite", text: "La main droite est placée sur la main gauche, sous le nombril." },
      { schoolSlug: "shafiite", text: "La main droite est placée sur la main gauche, sur la poitrine." },
      { schoolSlug: "hanbalite", text: "La main droite est placée sur la main gauche, généralement sous le nombril, position proche de celle des hanafites." },
    ],
    divergenceExplanation: "La divergence provient de la diversité des hadiths rapportés sur ce point et de la manière dont chaque école a évalué leur authenticité et leur portée, ainsi que du poids accordé à la pratique observée dans chaque région (Médine pour les malikites, Kufa pour les hanafites, etc.).",
  },
  {
    title: "Lever les mains (raf' al-yadayn) durant la prière",
    slug: "rafi-al-yadayn",
    category: "Prière (Salat)",
    description: "À quels moments de la prière il est recommandé de lever les mains au niveau des épaules ou des oreilles.",
    positions: [
      { schoolSlug: "malikite", text: "Le lever des mains est généralement limité au takbir d'ouverture de la prière (takbirat al-ihram)." },
      { schoolSlug: "hanafite", text: "Le lever des mains est prescrit au takbir d'ouverture ; les positions varient ensuite selon les rapporteurs pour les inclinaisons." },
      { schoolSlug: "shafiite", text: "Le lever des mains est prescrit à l'ouverture, avant et après l'inclinaison (ruku')." },
      { schoolSlug: "hanbalite", text: "Le lever des mains est prescrit à l'ouverture, avant et après l'inclinaison (ruku'), position proche de celle des shafi'ites." },
    ],
    divergenceExplanation: "Plusieurs hadiths authentiques décrivent des pratiques du Prophète ﷺ à des moments différents ; les écoles divergent sur la manière de les concilier ou de déterminer lesquels reflètent la pratique la plus établie.",
  },
  {
    title: "Récitation de la Basmala à voix haute",
    slug: "basmala-a-voix-haute",
    category: "Prière (Salat)",
    description: "Si la formule \"Bismillah ar-Rahman ar-Rahim\" doit être récitée à voix haute ou basse avant la Fatiha dans les prières à voix haute.",
    positions: [
      { schoolSlug: "malikite", text: "La Basmala n'est pas récitée du tout au début de la Fatiha dans la prière, position spécifique à cette école." },
      { schoolSlug: "hanafite", text: "La Basmala est récitée, mais toujours à voix basse, même dans les prières à voix haute." },
      { schoolSlug: "shafiite", text: "La Basmala est considérée comme un verset de la Fatiha et est récitée à voix haute dans les prières concernées." },
      { schoolSlug: "hanbalite", text: "La Basmala est récitée à voix basse, position proche de celle des hanafites." },
    ],
    divergenceExplanation: "La divergence tient à la question de savoir si la Basmala fait partie intégrante du texte de la sourate Al-Fatiha, question sur laquelle les hadiths et les lectures coraniques rapportées varient.",
  },
  {
    title: "Ce qui annule les petites ablutions (wudu)",
    slug: "annulation-des-ablutions",
    category: "Purification (Tahara)",
    description: "Si le simple contact physique avec une personne du sexe opposé annule ou non l'état de pureté rituelle (wudu).",
    positions: [
      { schoolSlug: "malikite", text: "Le contact avec une intention ou un plaisir (mubashara bi-shahwa) annule le wudu ; un contact neutre et sans désir ne l'annule pas." },
      { schoolSlug: "hanafite", text: "Le simple contact de la peau n'annule pas le wudu, seule l'émission de fluide invalidant l'annule." },
      { schoolSlug: "shafiite", text: "Tout contact direct de peau à peau entre un homme et une femme non mahram annule le wudu, indépendamment de l'intention." },
      { schoolSlug: "hanbalite", text: "Le contact avec plaisir ou désir annule le wudu ; position proche de celle des malikites." },
    ],
    divergenceExplanation: "La divergence provient d'interprétations différentes du verset coranique évoquant le fait d'avoir \"touché les femmes\" (Coran 4:43 et 5:6) - certaines écoles y voient une allusion euphémique aux rapports intimes, d'autres un sens plus littéral incluant le simple contact.",
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
      { schoolSlug: "malikite", text: "La position la plus connue de l'école exige au moins douze hommes adultes en plus de l'imam, résidents du lieu où se tient la prière." },
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
      { schoolSlug: "malikite", text: "La ventouse n'annule pas le jeûne, sauf si elle provoque une faiblesse importante poussant la personne à rompre volontairement pour une autre raison." },
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
    divergenceExplanation: "La divergence tient à la portée donnée aux hadiths généraux sur la zakat de l'or et de l'argent : l'école hanafite les applique sans exception à toute quantité atteignant le nisab, tandis que les trois autres écoles y voient une exception implicite pour les bijoux destinés à un usage personnel licite, considérés comme un bien d'usage plutôt qu'un bien thésaurisé.",
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
  {
    title: "Le tuteur matrimonial (wali) est-il une condition de validité du mariage ?",
    slug: "wali-condition-validite-mariage",
    category: "Mariage (Nikah)",
    description: "Si une femme adulte et saine d'esprit peut valablement conclure elle-même son contrat de mariage, ou si la présence d'un tuteur matrimonial (wali, généralement le père ou un proche) est une condition de validité du contrat.",
    positions: [
      { schoolSlug: "malikite", text: "Le wali est une condition de validité du mariage pour toute femme, quel que soit son âge ou son statut ; un mariage conclu sans wali est nul." },
      { schoolSlug: "hanafite", text: "Une femme adulte et saine d'esprit peut conclure valablement son propre contrat de mariage sans wali, bien que sa présence reste fortement recommandée ; le wali dispose néanmoins d'un droit de contestation (khiyar) si le mariage lui est manifestement défavorable." },
      { schoolSlug: "shafiite", text: "Le wali est une condition de validité du mariage pour toute femme ; un contrat qu'elle conclurait elle-même, sans tuteur, est considéré nul quel que soit son âge." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des malikites et shafi'ites : le wali est une condition stricte de validité du contrat de mariage." },
    ],
    divergenceExplanation: "La divergence porte sur l'interprétation d'un hadith rapporté par Abu Dawud et At-Tirmidhi (\"il n'y a pas de mariage sans wali\") : les trois écoles majoritaires le retiennent comme une condition générale et absolue, tandis que l'école hanafite, s'appuyant sur d'autres textes et sur un raisonnement analogique avec la capacité juridique générale d'une adulte saine d'esprit dans ses autres transactions, limite cette exigence aux cas de mineures ou de personnes sous tutelle.",
  },
  {
    title: "Témoins ou publicité : que faut-il pour rendre le mariage licite ?",
    slug: "temoins-publicite-mariage",
    category: "Mariage (Nikah)",
    description: "Si la présence de deux témoins au moment de la conclusion du contrat de mariage est une condition stricte de validité, ou si la publicité de l'union (i'lan) suffit à en garantir la licéité.",
    positions: [
      { schoolSlug: "malikite", text: "La présence de témoins au moment du contrat n'est pas une condition stricte de validité ; ce qui est requis, c'est la publicité (i'lan) du mariage avant la consommation, pour le distinguer d'une union secrète." },
      { schoolSlug: "hanafite", text: "La présence d'au moins deux témoins (ou un homme et deux femmes) au moment de la conclusion du contrat est une condition de validité du mariage." },
      { schoolSlug: "shafiite", text: "Position identique à celle des hanafites : deux témoins masculins, musulmans et dignes de confiance sont une condition stricte de validité du contrat." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des hanafites et shafi'ites : deux témoins sont requis au moment du contrat pour sa validité." },
    ],
    divergenceExplanation: "La divergence tient à l'interprétation d'un hadith (\"pas de mariage sans wali et deux témoins justes\") : trois écoles y voient une condition formelle de validité du contrat lui-même, tandis que l'école malikite considère que l'objectif recherché par le texte - éviter les unions clandestines - est atteint par l'exigence de publicité, jugée plus fondamentale que la présence physique de témoins au moment précis du contrat.",
  },
  {
    title: "La vente-rachat (bay' al-'ina) est-elle licite ?",
    slug: "bay-al-ina",
    category: "Commerce et transactions (Mu'amalat)",
    description: "Si un vendeur peut licitement vendre un bien à crédit à un acheteur, puis lui racheter ce même bien immédiatement au comptant à un prix inférieur - un montage qui revient économiquement à un prêt d'argent portant intérêt (riba) déguisé en deux ventes.",
    positions: [
      { schoolSlug: "malikite", text: "Le bay' al-'ina est interdit par le principe de sadd adh-dhara'i (blocage des moyens menant à un mal) : même si chaque vente prise isolément est valide en la forme, l'intention et l'effet économique global - contourner l'interdiction du riba - la rendent illicite." },
      { schoolSlug: "hanafite", text: "Le montage est généralement désapprouvé (makruh) lorsque l'intention de contourner le riba est manifeste, bien que la validité formelle des deux contrats pris séparément soit reconnue." },
      { schoolSlug: "shafiite", text: "Le bay' al-'ina est licite tant que chacune des deux ventes remplit individuellement les conditions de validité d'une vente ; l'intention sous-jacente des parties n'a pas à être examinée par le droit." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des malikites : le montage est interdit en tant que moyen détourné d'atteindre un résultat interdit (riba), indépendamment de la validité formelle de chaque étape." },
    ],
    divergenceExplanation: "La divergence reflète un désaccord méthodologique plus large sur le principe de sadd adh-dhara'i (bloquer un moyen licite en apparence lorsqu'il sert un but illicite) : les écoles malikite et hanbalite l'appliquent largement aux transactions financières pour préserver l'esprit de l'interdiction du riba, tandis que l'école shafi'ite s'en tient à l'examen formel de chaque contrat pris isolément, sans présumer de l'intention des parties.",
  },
  {
    title: "Le riba al-fadl s'étend-il à toutes les denrées alimentaires ?",
    slug: "etendue-riba-al-fadl",
    category: "Commerce et transactions (Mu'amalat)",
    description: "Un hadith cite six biens précis (or, argent, blé, orge, dattes, sel) pour lesquels un échange inégal entre biens de même nature est interdit (riba al-fadl) ; la question est de savoir si cette règle se limite à ces six biens ou s'étend par analogie à d'autres denrées.",
    positions: [
      { schoolSlug: "malikite", text: "La règle s'étend par analogie à toute denrée alimentaire de base, conservable et servant normalement de nourriture principale, au-delà des six biens explicitement cités." },
      { schoolSlug: "hanafite", text: "La règle s'étend à tout bien mesuré par le poids ou le volume, l'école retenant le mode de mesure (plutôt que la nature alimentaire) comme cause ('illa) commune justifiant l'analogie." },
      { schoolSlug: "shafiite", text: "La règle s'étend à toute denrée pouvant se conserver et servir d'aliment de base ou d'assaisonnement, sur un raisonnement analogique proche de celui des malikites bien que fondé sur une 'illa légèrement différente." },
      { schoolSlug: "hanbalite", text: "Deux positions sont rapportées au sein de l'école : l'une proche de l'approche hanafite (mesure par poids ou volume), l'autre limitant strictement la règle aux six biens explicitement mentionnés par le hadith, sans extension analogique." },
    ],
    divergenceExplanation: "La divergence porte sur l'identification de la cause ('illa) précise justifiant l'interdiction pour ces six biens spécifiques, exercice classique de qiyas (raisonnement analogique) : selon la cause retenue - le caractère alimentaire, le mode de mesure, ou la stricte limitation aux textes - le périmètre des biens concernés par l'interdiction varie sensiblement, avec des implications directes sur la finance islamique contemporaine (échanges de devises, matières premières).",
  },
  {
    title: "La compensation (kaffara) pour rupture volontaire du jeûne",
    slug: "kaffara-rupture-jeune",
    category: "Jeûne (Sawm)",
    description: "Si la lourde compensation prévue en cas de rupture volontaire et sans excuse du jeûne du Ramadan (affranchir un esclave, à défaut jeûner deux mois consécutifs, à défaut nourrir soixante nécessiteux) s'applique uniquement au rapport intime, ou également à d'autres ruptures volontaires comme le fait de manger ou de boire délibérément.",
    positions: [
      { schoolSlug: "malikite", text: "La kaffara s'applique à toute rupture volontaire du jeûne sans excuse valable, que ce soit par un rapport intime, le fait de manger ou de boire délibérément." },
      { schoolSlug: "hanafite", text: "Position identique à celle des malikites : la kaffara s'applique largement à toute rupture volontaire et injustifiée du jeûne, pas seulement au rapport intime." },
      { schoolSlug: "shafiite", text: "La kaffara ne s'applique qu'au cas du rapport intime pendant la journée du Ramadan ; manger ou boire volontairement sans excuse nécessite uniquement un rattrapage (qada), sans compensation lourde supplémentaire." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des shafi'ites : seul le rapport intime entraîne la kaffara ; les autres ruptures volontaires du jeûne se rattrapent par un simple qada." },
    ],
    divergenceExplanation: "Le hadith fondateur de la kaffara, rapporté par Al-Bukhari et Muslim, concerne un homme ayant eu un rapport intime pendant le jeûne ; les écoles hanafite et malikite étendent cette règle par analogie à toute rupture volontaire jugée comparable dans sa gravité, tandis que les écoles shafi'ite et hanbalite s'en tiennent au cas explicitement traité par le texte, considérant le rapport intime comme une transgression d'une nature particulière justifiant seule une sanction aussi lourde.",
  },
  {
    title: "L'état de pureté rituelle est-il une condition de validité du tawaf ?",
    slug: "purete-condition-tawaf",
    category: "Hajj et 'Umra",
    description: "Si les circumambulations autour de la Kaaba (tawaf) doivent obligatoirement être accomplies en état de pureté rituelle (ayant fait le wudu), à l'image de la prière, ou si la pureté n'en est qu'une condition recommandée.",
    positions: [
      { schoolSlug: "malikite", text: "La pureté rituelle est une condition stricte de validité du tawaf, à l'image de la prière ; un tawaf accompli en état d'impureté mineure doit être recommencé." },
      { schoolSlug: "hanafite", text: "La pureté rituelle est obligatoire (wajib) mais pas une condition stricte de validité : un tawaf accompli sans elle reste valide, bien qu'un sacrifice compensatoire (dam) soit alors dû." },
      { schoolSlug: "shafiite", text: "Position identique à celle des malikites : la pureté rituelle est une condition de validité du tawaf, qui est directement assimilé à la prière sur ce point par un hadith rapporté par At-Tirmidhi." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des malikites et shafi'ites : la pureté est une condition de validité, non une simple recommandation." },
    ],
    divergenceExplanation: "La divergence porte sur la portée du hadith assimilant le tawaf à la prière en matière de pureté requise : trois écoles le prennent au sens strict d'une condition de validité, tandis que l'école hanafite, s'appuyant sur le fait que le tawaf, à la différence de la prière, comporte par ailleurs la possibilité de parler ou de marcher, y voit une obligation forte mais rattrapable par une compensation plutôt qu'une condition de validité absolue.",
  },
  {
    title: "Combien de tétées établissent la parenté de lait (radaa) ?",
    slug: "nombre-tetees-radaa",
    category: "Mariage (Nikah)",
    description: "L'allaitement d'un nourrisson par une femme autre que sa mère crée un lien de parenté de lait (radaa) rendant le mariage impossible entre certaines personnes ; la question est de savoir combien de tétées distinctes sont nécessaires pour établir ce lien.",
    positions: [
      { schoolSlug: "malikite", text: "Une seule tétée suffit à établir la parenté de lait, quelle que soit sa durée ou son importance." },
      { schoolSlug: "hanafite", text: "Position identique à celle des malikites : toute quantité de lait absorbée, même minime, établit la parenté de lait." },
      { schoolSlug: "shafiite", text: "Cinq tétées distinctes et bien établies (connues avec certitude) sont nécessaires pour établir la parenté de lait." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des shafi'ites : cinq tétées distinctes sont requises." },
    ],
    divergenceExplanation: "La divergence porte sur le statut d'un hadith rapporté par Aisha mentionnant un nombre précis de tétées (dix, puis cinq selon une version ultérieure abrogeant partiellement la première) : les écoles shafi'ite et hanbalite le retiennent comme fixant un seuil numérique contraignant, tandis que les écoles malikite et hanafite s'appuient sur des versets et hadiths plus généraux évoquant simplement \"l'allaitement\" sans seuil chiffré, qu'elles jugent prioritaires.",
  },
  {
    title: "Faut-il réciter la Fatiha derrière l'imam dans les prières à voix haute ?",
    slug: "recitation-fatiha-derriere-imam",
    category: "Prière (Salat)",
    description: "Lorsqu'un fidèle prie derrière un imam qui récite à voix haute, doit-il lui-même réciter la sourate Al-Fatiha en silence, ou la récitation de l'imam suffit-elle pour toute l'assemblée ?",
    positions: [
      { schoolSlug: "malikite", text: "Le fidèle écoute en silence la récitation de l'imam dans les prières à voix haute, sans réciter lui-même la Fatiha ; il la récite uniquement dans les prières à voix basse ou lorsque l'imam ne l'entend pas." },
      { schoolSlug: "hanafite", text: "La récitation de l'imam suffit pour l'ensemble de l'assemblée, y compris la Fatiha ; le fidèle qui prie derrière un imam ne récite rien lui-même, que la prière soit à voix haute ou basse." },
      { schoolSlug: "shafiite", text: "Le fidèle doit réciter lui-même la Fatiha en silence, même derrière un imam récitant à voix haute, sous peine d'invalider sa prière selon la position la plus stricte de l'école." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des malikites : le fidèle ne récite pas derrière un imam dont il entend distinctement la récitation à voix haute, mais la récite dans les prières silencieuses." },
    ],
    divergenceExplanation: "La divergence s'appuie sur deux ensembles de textes en tension apparente : des versets et hadiths invitant à écouter en silence la récitation de l'imam (sourate Al-A'raf, 7:204), et un hadith affirmant qu'\"il n'y a pas de prière pour qui ne récite pas la Fatiha\" (rapporté par Al-Bukhari) sans distinguer explicitement le cas du fidèle suivant un imam ; chaque école a privilégié l'un ou l'autre de ces textes, ou tenté de les concilier selon que la récitation de l'imam est audible ou non.",
  },
  {
    title: "À partir de quelle distance un voyage permet-il de raccourcir la prière ?",
    slug: "distance-minimale-qasr",
    category: "Prière (Salat)",
    description: "Le Coran permet à un voyageur de raccourcir (qasr) les prières de quatre unités à deux ; la question est de savoir à partir de quelle distance ou durée de trajet un déplacement est juridiquement considéré comme un \"voyage\" ouvrant droit à cette concession.",
    positions: [
      { schoolSlug: "malikite", text: "Une distance d'environ 80 km (quatre burud) est généralement retenue comme seuil ouvrant droit au raccourcissement." },
      { schoolSlug: "hanafite", text: "Un seuil plus élevé est retenu, correspondant traditionnellement à un trajet d'environ trois jours de marche (environ 100 à 120 km selon les estimations), la concession s'appliquant à partir de ce seuil." },
      { schoolSlug: "shafiite", text: "Une distance d'environ 80 à 90 km (deux marhala) est retenue comme seuil, proche de la position malikite." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des malikites et shafi'ites : environ 80 km constitue le seuil généralement retenu par l'école." },
    ],
    divergenceExplanation: "Le Coran (4:101) mentionne la concession du voyage sans en préciser la distance minimale ; les écoles ont chacune tenté d'estimer, à partir de la pratique rapportée des Compagnons et de mesures de distance de l'époque (burud, marhala, journées de marche), un seuil chiffré équivalent, ce qui explique les écarts observés entre leurs estimations converties en unités modernes.",
  },
  {
    title: "Peut-on regrouper deux prières à cause de la pluie ?",
    slug: "regroupement-prieres-pluie",
    category: "Prière (Salat)",
    description: "En dehors du voyage ou de la maladie, une pluie forte permet-elle de regrouper deux prières consécutives (par exemple le maghrib et le 'isha) à la mosquée, par souci de ne pas exposer les fidèles aux intempéries ?",
    positions: [
      { schoolSlug: "malikite", text: "Le regroupement pour cause de pluie est autorisé, en avançant la seconde prière (jam' taqdim), en particulier pour ceux qui se rendent à la mosquée à pied." },
      { schoolSlug: "hanafite", text: "Le regroupement pour cause de pluie n'est pas autorisé ; chaque prière doit être accomplie à son heure propre, en dehors des cas de voyage et de la concession spécifique d'Arafat et Muzdalifa durant le hajj." },
      { schoolSlug: "shafiite", text: "Le regroupement pour cause de pluie est autorisé, position proche de celle des malikites et hanbalites." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des malikites et shafi'ites : le regroupement est autorisé en cas de pluie génante." },
    ],
    divergenceExplanation: "Plusieurs hadiths rapportent que le Prophète ﷺ aurait regroupé des prières à Médine \"sans peur ni voyage\", que les commentateurs interprètent généralement comme visant les cas de pluie ou de difficulté comparable ; l'école hanafite, plus restrictive sur les causes autorisant le regroupement, interprète ces rapports différemment ou les considère limités à des circonstances exceptionnelles non généralisables à la pluie ordinaire.",
  },
  {
    title: "Peut-on toucher le Mushaf (exemplaire du Coran) sans avoir fait ses ablutions ?",
    slug: "toucher-mushaf-sans-wudu",
    category: "Purification (Tahara)",
    description: "Si une personne en état d'impureté mineure (sans wudu) peut licitement toucher directement le texte écrit d'un exemplaire du Coran (mushaf).",
    positions: [
      { schoolSlug: "malikite", text: "Il n'est pas permis de toucher le mushaf sans avoir fait le wudu, sauf pour l'apprentissage par un enfant n'ayant pas encore atteint l'âge de la puberté." },
      { schoolSlug: "hanafite", text: "Toucher directement le texte écrit sans wudu est déconseillé, mais porter ou transporter le mushaf à l'aide d'un étui, d'un tissu ou d'un sac est permis même sans purification." },
      { schoolSlug: "shafiite", text: "Il n'est pas permis de toucher le mushaf, même une seule page, sans avoir fait le wudu au préalable." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des malikites et shafi'ites : le wudu est requis pour toucher directement le mushaf." },
    ],
    divergenceExplanation: "La divergence porte sur l'interprétation du verset \"que seuls les purifiés touchent\" (sourate Al-Waqi'a, 56:79) : trois écoles y voient une prescription juridique directe concernant le mushaf terrestre, tandis que l'école hanafite considère que le verset décrit avant tout les anges touchant le Coran céleste préservé (al-lawh al-mahfuz), et fonde sa position sur des textes distincts, plus nuancés, concernant le mushaf terrestre.",
  },
  {
    title: "Peut-on revendre une marchandise avant d'en avoir pris possession ?",
    slug: "revente-avant-possession",
    category: "Commerce et transactions (Mu'amalat)",
    description: "Un acheteur ayant acquis une marchandise mais ne l'ayant pas encore physiquement reçue (qabd) peut-il la revendre à un tiers avant cette prise de possession effective ?",
    positions: [
      { schoolSlug: "malikite", text: "La revente avant possession est interdite pour les denrées alimentaires ; elle est généralement permise pour les autres types de biens." },
      { schoolSlug: "hanafite", text: "La revente avant possession est interdite pour tout type de bien mobilier, qu'il s'agisse de denrées alimentaires ou d'autres marchandises." },
      { schoolSlug: "shafiite", text: "Position identique à celle des hanafites : la revente est interdite avant la prise de possession effective, quelle que soit la nature du bien." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des hanafites et shafi'ites : aucune revente n'est permise avant la possession effective du bien." },
    ],
    divergenceExplanation: "Un hadith rapporté par Ibn Abbas interdit explicitement de revendre une denrée alimentaire achetée avant de l'avoir reçue ; trois écoles étendent cette règle par analogie à tout type de bien, considérant que le risque d'incertitude (gharar) et de spéculation qu'elle vise à prévenir concerne tout autant les autres marchandises, tandis que l'école malikite s'en tient au champ explicite du hadith, limité aux denrées alimentaires.",
  },
  {
    title: "La prière du Witr est-elle obligatoire ?",
    slug: "witr-obligatoire-ou-recommandee",
    category: "Prière (Salat)",
    description: "La prière du Witr, accomplie après la prière du 'Isha jusqu'à l'aube, a-t-elle un statut juridique obligatoire (wajib) ou seulement fortement recommandé (sunna mu'akkada) ?",
    positions: [
      { schoolSlug: "malikite", text: "Le Witr est une sunna fortement recommandée, sans atteindre le statut d'obligation stricte." },
      { schoolSlug: "hanafite", text: "Le Witr a le statut d'obligation (wajib), un degré intermédiaire propre à l'école hanafite entre le fard (obligation absolue) et la sunna, dont l'abandon habituel est fautif sans pour autant être équivalent à l'abandon d'une prière obligatoire." },
      { schoolSlug: "shafiite", text: "Le Witr est une sunna fortement recommandée, position identique à celle des malikites." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des malikites et shafi'ites : sunna fortement recommandée, non obligatoire." },
    ],
    divergenceExplanation: "La divergence tient en partie à une catégorie juridique propre à l'école hanafite, le wajib, intermédiaire entre l'obligation absolue (fard) et la simple recommandation (sunna), que les trois autres écoles ne reconnaissent pas comme catégorie distincte - ce qui explique pourquoi une même série de hadiths encourageant fortement le Witr est classée différemment selon le cadre catégoriel propre à chaque école.",
  },
  {
    title: "Nombre de takbirs supplémentaires à la prière de l'Aïd",
    slug: "takbirs-supplementaires-priere-aid",
    category: "Prière (Salat)",
    description: "Combien de takbirs (Allahu akbar) supplémentaires, en plus du takbir d'ouverture, sont récités dans chacune des deux unités de la prière de l'Aïd.",
    positions: [
      { schoolSlug: "malikite", text: "Six takbirs supplémentaires dans la première unité (après le takbir d'ouverture), cinq dans la seconde (avant la récitation)." },
      { schoolSlug: "hanafite", text: "Trois takbirs supplémentaires dans la première unité, trois dans la seconde (après la récitation, avant l'inclinaison)." },
      { schoolSlug: "shafiite", text: "Sept takbirs supplémentaires dans la première unité, cinq dans la seconde." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des shafi'ites : sept takbirs dans la première unité, cinq dans la seconde." },
    ],
    divergenceExplanation: "Plusieurs hadiths rapportent des décomptes différents observés dans la pratique des premières générations ; chaque école a retenu le rapport qu'elle juge le mieux établi, sans qu'aucun décompte ne soit considéré invalidant pour la prière si un fidèle suit une autre tradition.",
  },
  {
    title: "Qunut dans la prière du Witr",
    slug: "qunut-witr",
    category: "Prière (Salat)",
    description: "Si une invocation (qunut) est récitée de façon régulière dans la prière du Witr, et à quelle période de l'année.",
    positions: [
      { schoolSlug: "malikite", text: "Pas de qunut régulier dans le Witr en dehors de circonstances exceptionnelles (calamité touchant la communauté)." },
      { schoolSlug: "hanafite", text: "Le qunut est récité dans le Witr toute l'année, avant l'inclinaison de la dernière unité." },
      { schoolSlug: "shafiite", text: "Le qunut n'est récité dans le Witr que durant la seconde moitié du mois de Ramadan, après l'inclinaison de la dernière unité." },
      { schoolSlug: "hanbalite", text: "Le qunut est récité dans le Witr toute l'année, position proche de celle des hanafites." },
    ],
    divergenceExplanation: "La divergence tient à l'évaluation de hadiths rapportant la pratique du qunut à des périodes différentes : l'école hanafite et l'école hanbalite y voient une pratique continue tout au long de l'année, tandis que l'école shafi'ite la limite à la seconde moitié du Ramadan d'après un rapport spécifique à cette période, et l'école malikite la réserve à des circonstances exceptionnelles seulement.",
  },
  {
    title: "Regrouper deux prières en voyage, en dehors de la pluie",
    slug: "regroupement-prieres-voyage",
    category: "Prière (Salat)",
    description: "Si le simple fait d'être en état de voyage (safar), sans autre difficulté particulière, permet de regrouper deux prières consécutives (dhuhr-asr ou maghrib-isha).",
    positions: [
      { schoolSlug: "malikite", text: "Le regroupement est permis en voyage, en particulier pour celui qui continue de se déplacer au moment de la prière." },
      { schoolSlug: "hanafite", text: "Le regroupement n'est pas permis en dehors des concessions spécifiques d'Arafat et Muzdalifa durant le hajj ; chaque prière est accomplie à son heure propre, y compris en voyage." },
      { schoolSlug: "shafiite", text: "Le regroupement est permis en voyage licite d'une distance suffisante pour raccourcir la prière (qasr)." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des malikites et shafi'ites : le regroupement est permis en voyage." },
    ],
    divergenceExplanation: "Le Prophète ﷺ est rapporté avoir regroupé des prières en voyage à plusieurs occasions ; l'école hanafite limite strictement cette concession aux deux cas explicitement liés au rituel du hajj (Arafat et Muzdalifa), considérant les autres rapports comme visant un simple rapprochement des heures de prière plutôt qu'un regroupement véritable, tandis que les trois autres écoles y voient une concession générale applicable à tout voyage.",
  },
  {
    title: "Montant minimal du mahr (dot)",
    slug: "montant-minimal-mahr",
    category: "Mariage (Nikah)",
    description: "Si le contrat de mariage doit prévoir un mahr (dot due par l'époux à l'épouse) d'un montant minimal fixé, ou si toute valeur, même modeste, suffit.",
    positions: [
      { schoolSlug: "malikite", text: "Un montant minimal est fixé, équivalent à environ un quart de dinar d'or ou trois dirhams d'argent." },
      { schoolSlug: "hanafite", text: "Un montant minimal est fixé, équivalent à dix dirhams d'argent." },
      { schoolSlug: "shafiite", text: "Aucun montant minimal n'est fixé : tout bien ayant une valeur, même modeste, peut constituer un mahr valide." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des shafi'ites : aucun montant minimal n'est requis." },
    ],
    divergenceExplanation: "La divergence porte sur l'interprétation de récits rapportant des mariages conclus par le Prophète ﷺ et ses Compagnons pour un mahr très modeste (un anneau de fer, l'enseignement de versets du Coran) : les écoles shafi'ite et hanbalite y voient la preuve qu'aucun seuil minimal n'existe, tandis que les écoles malikite et hanafite fixent chacune un seuil chiffré à partir d'autres rapports, sans empêcher qu'un mahr plus élevé soit convenu entre les parties.",
  },
  {
    title: "Le saignement (hors menstruel) annule-t-il le wudu ?",
    slug: "saignement-annule-wudu",
    category: "Purification (Tahara)",
    description: "Si le sang qui s'écoule d'une blessure ou d'un saignement de nez, en dehors des menstrues et lochies, annule l'état de pureté rituelle (wudu).",
    positions: [
      { schoolSlug: "malikite", text: "Le saignement n'annule pas le wudu, quelle que soit sa quantité." },
      { schoolSlug: "hanafite", text: "Le saignement qui s'écoule au-delà du site de la blessure annule le wudu ; un saignement contenu qui ne dépasse pas ce site ne l'annule pas." },
      { schoolSlug: "shafiite", text: "Le saignement n'annule pas le wudu, seule une sortie par les deux voies naturelles (avant et arrière) l'annule." },
      { schoolSlug: "hanbalite", text: "Un saignement abondant annule le wudu selon l'un des deux avis rapportés dans l'école, position proche de celle des hanafites ; un saignement limité ne l'annule pas." },
    ],
    divergenceExplanation: "La divergence tient à la portée donnée à l'analogie entre le sang et les autres impuretés sortant du corps : l'école hanafite et, dans une moindre mesure, l'école hanbalite considèrent que tout écoulement notable de sang relève de la même catégorie que ce qui sort des deux voies naturelles, tandis que les écoles malikite et shafi'ite limitent strictement les causes d'annulation du wudu aux sorties par ces deux voies, telles que rapportées dans les hadiths sur le sujet.",
  },
  {
    title: "La zakat sur les récoltes et fruits de la terre",
    slug: "zakat-recoltes-et-fruits",
    category: "Zakat",
    description: "Si la zakat agricole ('ushr) est due sur toute production de la terre, ou seulement sur certaines denrées de base, et si un seuil minimal (nisab) s'applique.",
    positions: [
      { schoolSlug: "malikite", text: "La zakat est due uniquement sur les denrées conservables servant normalement de nourriture de base (céréales, dattes...), à partir d'un seuil (nisab) d'environ cinq wasq." },
      { schoolSlug: "hanafite", text: "La zakat ('ushr) est due sur toute production agricole de la terre, sans seuil minimal (nisab), y compris les légumes et fruits non conservables." },
      { schoolSlug: "shafiite", text: "Position proche de celle des malikites : seules les denrées conservables et nourrissantes de base sont concernées, à partir du seuil de cinq wasq." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des malikites et shafi'ites, avec une liste de denrées concernées un peu plus large mais toujours limitée aux produits conservables, à partir du même seuil de cinq wasq." },
    ],
    divergenceExplanation: "La divergence porte sur la portée du verset coranique \"et acquittez-en le droit dû, le jour de la récolte\" (Coran 6:141) : l'école hanafite le lit comme une prescription générale s'appliquant à toute production de la terre, tandis que les trois autres écoles la restreignent, à partir de hadiths précisant un seuil et une liste de denrées, aux produits alimentaires de base pouvant être conservés.",
  },
  {
    title: "Le tawaf al-wada' (tawaf d'adieu) est-il obligatoire pour tous les pèlerins ?",
    slug: "tawaf-al-wada-obligatoire",
    category: "Hajj et 'Umra",
    description: "Si le tawaf effectué juste avant de quitter Mecque à l'issue du hajj (tawaf al-wada') est obligatoire pour tout pèlerin, ou si les résidents de Mecque en sont dispensés.",
    positions: [
      { schoolSlug: "malikite", text: "Le tawaf al-wada' est obligatoire pour les pèlerins venus de l'extérieur, mais les résidents de Mecque en sont dispensés." },
      { schoolSlug: "hanafite", text: "Le tawaf al-wada' est obligatoire (wajib) pour tout pèlerin quittant Mecque après le hajj, résident compris." },
      { schoolSlug: "shafiite", text: "Position identique à celle des hanafites : obligatoire pour tous, y compris les résidents de Mecque." },
      { schoolSlug: "hanbalite", text: "Position identique à celle des hanafites et shafi'ites : obligatoire pour tout pèlerin quittant Mecque." },
    ],
    divergenceExplanation: "La divergence porte sur la portée d'un hadith enjoignant que \"le dernier des rites de quiconque soit un tawaf autour de la Maison\", rapporté par Ibn Abbas qui précise lui-même que les résidents de Mecque en étaient exemptés : les écoles hanafite, shafi'ite et hanbalite retiennent surtout l'injonction générale du hadith, tandis que l'école malikite retient également la précision de son rapporteur concernant les résidents de Mecque.",
  },
  {
    title: "La zakat sur le bétail (chameaux, bovins, ovins)",
    slug: "zakat-sur-le-betail",
    category: "Zakat",
    description: "Si la zakat sur les troupeaux (chameaux, bovins, ovins/caprins) obéit à des seuils et taux spécifiques distincts de la zakat monétaire, et comment les écoles évaluent ces seuils.",
    positions: [
      { schoolSlug: "malikite", text: "Les seuils et taux détaillés dans la lettre de zakat attribuée à Abu Bakr sont retenus tels quels (par exemple cinq chameaux pour un mouton dû), avec une attention particulière portée à la condition que le bétail paisse librement (sa'ima) plutôt que d'être nourri à l'étable." },
      { schoolSlug: "hanafite", text: "Les mêmes seuils issus de la lettre d'Abu Bakr sont retenus, avec une possibilité plus large de s'acquitter en valeur monétaire équivalente plutôt qu'en tête de bétail, cohérente avec la position générale de l'école sur la zakat al-fitr." },
      { schoolSlug: "shafiite", text: "Les seuils de la lettre d'Abu Bakr sont appliqués strictement en nature (tête de bétail), sans équivalence monétaire acceptée, et la condition de pâturage libre (sa'ima) est retenue de façon stricte." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des malikites et shafi'ites : seuils détaillés du hadith appliqués en nature, avec la même condition de pâturage libre." },
    ],
    divergenceExplanation: "Les seuils précis (nombre de têtes déclenchant chaque palier de zakat) sont rapportés de façon largement concordante dans plusieurs versions de la lettre de zakat d'Abu Bakr transmises par les recueils de hadith ; la divergence porte surtout sur la possibilité de s'acquitter en valeur monétaire équivalente plutôt qu'en nature, l'école hanafite se distinguant par une plus grande souplesse sur ce point, cohérente avec sa position générale sur la zakat al-fitr.",
  },
  {
    title: "La zakat sur le miel",
    slug: "zakat-sur-le-miel",
    category: "Zakat",
    description: "Si la production de miel est soumise à la zakat agricole ('ushr), et selon quel seuil.",
    positions: [
      { schoolSlug: "malikite", text: "Le miel n'est généralement pas soumis à la zakat, ne relevant ni des denrées de base ni du bétail." },
      { schoolSlug: "hanafite", text: "Le miel est soumis à la zakat au taux d'un dixième, sans seuil minimal, cohérent avec la position générale de l'école sur la zakat des productions de la terre." },
      { schoolSlug: "shafiite", text: "Position la plus connue de l'école : le miel n'est pas soumis à la zakat, faute de texte suffisamment probant selon cette école." },
      { schoolSlug: "hanbalite", text: "Le miel est soumis à la zakat au taux d'un dixième, à partir d'un seuil déterminé, position proche de celle des hanafites sur le principe bien que le seuil diffère." },
    ],
    divergenceExplanation: "La divergence porte sur la fiabilité et la portée des hadiths spécifiques au miel, jugés faibles par les écoles malikite et shafi'ite mais suffisants par les écoles hanafite et hanbalite pour étendre à cette production le principe déjà retenu pour les récoltes de la terre.",
  },
  {
    title: "La zakat est-elle due sur une créance (dette qu'on doit recouvrer) ?",
    slug: "zakat-sur-les-creances",
    category: "Zakat",
    description: "Si une somme prêtée à un tiers, et non encore recouvrée, entre dans le calcul de la zakat due par le créancier.",
    positions: [
      { schoolSlug: "malikite", text: "La zakat est due sur une créance certaine de recouvrement, mais son versement peut être différé jusqu'à la récupération effective de la somme, sans obligation de zakat rétroactive sur les années passées." },
      { schoolSlug: "hanafite", text: "La créance est soumise à la zakat, mais son versement effectif n'est dû qu'après recouvrement, avec une distinction entre créances fortes (dettes commerciales reconnues) et créances faibles selon leur probabilité de recouvrement." },
      { schoolSlug: "shafiite", text: "La créance certaine est traitée comme un bien possédé à part entière : la zakat est due chaque année écoulée, y compris rétroactivement une fois la somme recouvrée." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des shafi'ites : la créance certaine reste soumise à la zakat année après année, avec règlement rétroactif au moment du recouvrement." },
    ],
    divergenceExplanation: "La divergence porte sur le statut d'un bien dont la possession est certaine en droit mais non disponible en pratique : les écoles malikite et hanafite tempèrent l'exigibilité immédiate de la zakat par l'indisponibilité réelle de la somme, tandis que les écoles shafi'ite et hanbalite privilégient le principe de possession légale continue, indépendamment de la disponibilité effective.",
  },
  {
    title: "Le vomissement volontaire rompt-il le jeûne ?",
    slug: "vomissement-volontaire-et-jeune",
    category: "Jeûne (Sawm)",
    description: "Si provoquer volontairement le vomissement pendant le jeûne du Ramadan invalide celui-ci, à la différence d'un vomissement involontaire.",
    positions: [
      { schoolSlug: "malikite", text: "Le vomissement volontaire annule le jeûne et nécessite un rattrapage (qada) ; le vomissement involontaire ne l'annule pas." },
      { schoolSlug: "hanafite", text: "Position identique : seul le vomissement provoqué délibérément annule le jeûne, le vomissement involontaire n'ayant aucune incidence." },
      { schoolSlug: "shafiite", text: "Même distinction entre vomissement volontaire (annulant le jeûne) et involontaire (sans effet), position largement partagée par les quatre écoles sur ce point précis." },
      { schoolSlug: "hanbalite", text: "Position identique aux trois autres écoles : seul le vomissement volontairement provoqué rompt le jeûne." },
    ],
    divergenceExplanation: "Ce point fait l'objet d'un large consensus entre les quatre écoles, toutes s'appuyant sur un hadith rapporté par Abu Dawud et At-Tirmidhi distinguant explicitement le vomissement subi (sans rattrapage requis) du vomissement volontairement provoqué (nécessitant un qada) ; il est inclus ici pour sa pertinence pratique fréquente durant le Ramadan plutôt que pour une divergence marquée entre écoles.",
  },
  {
    title: "Manger ou boire par oubli pendant le jeûne",
    slug: "manger-boire-par-oubli-jeune",
    category: "Jeûne (Sawm)",
    description: "Si le fait de manger ou de boire par pur oubli, sans intention de rompre le jeûne, invalide celui-ci.",
    positions: [
      { schoolSlug: "malikite", text: "Le jeûne reste valide en cas d'oubli avéré ; la personne doit simplement cesser dès qu'elle se rend compte de son erreur, sans rattrapage nécessaire." },
      { schoolSlug: "hanafite", text: "Position identique : manger ou boire par oubli n'invalide pas le jeûne, considéré comme une nourriture offerte par Dieu Lui-même selon les termes d'un hadith rapporté par Bukhari et Muslim." },
      { schoolSlug: "shafiite", text: "Même position : l'oubli n'annule pas le jeûne, qu'il s'agisse d'un jeûne obligatoire ou surérogatoire." },
      { schoolSlug: "hanbalite", text: "Position identique aux trois autres écoles, fondée sur le même hadith explicite sur ce point." },
    ],
    divergenceExplanation: "Les quatre écoles s'accordent largement sur ce point précis à partir d'un hadith explicite rapporté par Bukhari et Muslim (\"quiconque oublie et mange ou boit alors qu'il jeûne, qu'il complète son jeûne, car c'est Allah qui l'a nourri et abreuvé\") ; il est inclus pour sa pertinence pratique plutôt que pour une réelle divergence entre écoles.",
  },
  {
    title: "Qui doit s'acquitter de la zakat al-fitr des enfants à charge ?",
    slug: "zakat-al-fitr-enfants-a-charge",
    category: "Zakat",
    description: "Si la zakat al-fitr due pour un enfant mineur incombe au père, à l'enfant lui-même s'il possède des biens propres, ou à un autre responsable.",
    positions: [
      { schoolSlug: "malikite", text: "La zakat al-fitr des enfants à charge incombe au père, ou à défaut à celui qui assure leur entretien (nafaqa), indépendamment des biens propres éventuels de l'enfant." },
      { schoolSlug: "hanafite", text: "La zakat al-fitr est due par celui qui a la charge financière du foyer ; si l'enfant possède des biens propres suffisants, elle peut être prélevée sur ces biens plutôt que sur ceux du père." },
      { schoolSlug: "shafiite", text: "La zakat al-fitr incombe au père responsable de l'entretien, sauf si l'enfant dispose de biens propres suffisants, auquel cas elle est prélevée sur son propre patrimoine." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des shafi'ites et hanafites : la charge revient en priorité aux biens propres de l'enfant s'il en possède, sinon à celui qui assure sa nafaqa." },
    ],
    divergenceExplanation: "La divergence porte sur le lien entre l'obligation de la zakat al-fitr et l'obligation générale d'entretien (nafaqa) : l'école malikite rattache strictement la zakat al-fitr à la charge d'entretien elle-même, tandis que les trois autres écoles font primer, lorsqu'ils existent, les biens propres de l'enfant sur ceux du responsable de son entretien.",
  },
  {
    title: "Manger la viande d'un animal égorgé par un non-musulman des Gens du Livre",
    slug: "viande-egorgee-par-ahl-al-kitab",
    category: "Alimentation (Hilal wa Haram)",
    description: "Si la viande d'un animal licite, égorgé selon les règles rituelles par un chrétien ou un juif (Ahl al-Kitab), est licite à la consommation pour un musulman.",
    positions: [
      { schoolSlug: "malikite", text: "La viande est licite si l'animal a été égorgé selon les règles rituelles reconnues, indépendamment de la mention explicite du nom de Dieu par l'égorgeur." },
      { schoolSlug: "hanafite", text: "La viande est licite à condition que l'égorgeur des Gens du Livre n'ait pas explicitement invoqué un autre nom que celui de Dieu au moment de l'abattage." },
      { schoolSlug: "shafiite", text: "Position proche de celle des malikites : la viande est licite dès lors que la méthode d'abattage rituel est respectée, sur la base du verset coranique autorisant explicitement la nourriture des Gens du Livre (sourate Al-Ma'ida, 5:5)." },
      { schoolSlug: "hanbalite", text: "Position identique aux hanafites : licéité conditionnée à l'absence d'invocation explicite d'un autre nom que celui de Dieu lors de l'abattage." },
    ],
    divergenceExplanation: "Le Coran (sourate Al-Ma'ida, 5:5) autorise explicitement la nourriture des Gens du Livre ; la divergence porte sur les conditions précises de cette licéité, certaines écoles insistant davantage sur le respect strict de la méthode d'abattage rituel, d'autres sur l'absence de invocation d'un nom autre que celui de Dieu par l'égorgeur.",
  },
  {
    title: "Manger de la viande de cheval",
    slug: "viande-de-cheval",
    category: "Alimentation (Hilal wa Haram)",
    description: "Si la consommation de viande de cheval est licite en islam, malgré son usage principal comme monture de guerre à l'époque du Prophète ﷺ.",
    positions: [
      { schoolSlug: "malikite", text: "La consommation de viande de cheval est déconseillée (makruh) sans être formellement interdite, en raison de son rôle privilégié comme monture, notamment pour le jihad." },
      { schoolSlug: "hanafite", text: "Position proche de celle des malikites : la viande de cheval est généralement considérée comme déconseillée plutôt que strictement interdite selon les rapporteurs les plus suivis de l'école." },
      { schoolSlug: "shafiite", text: "La viande de cheval est licite, sur la base d'un hadith explicite rapporté par Jabir (Bukhari et Muslim) mentionnant que le Prophète ﷺ en autorisa la consommation lors de la bataille de Khaybar." },
      { schoolSlug: "hanbalite", text: "Position identique aux shafi'ites : la viande de cheval est licite, en s'appuyant sur le même hadith explicite." },
    ],
    divergenceExplanation: "La divergence tient à l'articulation entre un hadith explicite autorisant la consommation (retenu par les shafi'ites et hanbalites) et d'autres rapports plus généraux déconseillant de consommer les animaux servant de monture, que les écoles hanafite et malikite ont privilégiés par prudence sans aller jusqu'à une interdiction formelle.",
  },
  {
    title: "Consommer des animaux aquatiques autres que le poisson",
    slug: "animaux-aquatiques-hors-poisson",
    category: "Alimentation (Hilal wa Haram)",
    description: "Si les crustacés, mollusques et autres animaux marins non assimilables au poisson sont licites à la consommation sans égorgement rituel.",
    positions: [
      { schoolSlug: "malikite", text: "Tout animal vivant exclusivement dans l'eau est licite, y compris crustacés et mollusques, sans besoin d'égorgement rituel." },
      { schoolSlug: "hanafite", text: "Seul le poisson au sens strict est licite sans égorgement ; les autres animaux aquatiques (crustacés, mollusques) sont généralement considérés comme déconseillés ou interdits par l'école." },
      { schoolSlug: "shafiite", text: "Position proche de celle des malikites : l'ensemble des animaux marins est licite, sur la base du verset coranique autorisant \"le gibier de la mer\" (sourate Al-Ma'ida, 5:96)." },
      { schoolSlug: "hanbalite", text: "Position identique aux malikites et shafi'ites : tout animal aquatique est licite sans distinction, ne nécessitant aucun égorgement rituel." },
    ],
    divergenceExplanation: "La divergence porte sur la portée du terme coranique \"gibier de la mer\" (sayd al-bahr) : trois écoles le lisent comme englobant tout animal exclusivement aquatique, tandis que l'école hanafite le restreint plus strictement au poisson au sens usuel du terme, par analogie avec les règles d'abattage rituel applicables aux animaux terrestres.",
  },
  {
    title: "La chasse au moyen d'un chien dressé : faut-il prononcer la Basmala ?",
    slug: "chasse-au-chien-et-basmala",
    category: "Alimentation (Hilal wa Haram)",
    description: "Si prononcer le nom de Dieu (Basmala) au moment de lâcher un chien dressé pour la chasse est une condition de licéité du gibier tué.",
    positions: [
      { schoolSlug: "malikite", text: "La mention du nom de Dieu au moment de lâcher l'animal de chasse est fortement recommandée mais son omission par oubli n'invalide pas la licéité du gibier." },
      { schoolSlug: "hanafite", text: "La mention du nom de Dieu est une condition de validité ; son omission volontaire rend le gibier illicite, l'oubli restant toléré." },
      { schoolSlug: "shafiite", text: "La mention du nom de Dieu est recommandée (sunna) mais non une condition stricte de licéité du gibier tué par l'animal dressé." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des hanafites : la mention du nom de Dieu est une condition de validité, sous réserve de l'oubli qui reste excusé." },
    ],
    divergenceExplanation: "La divergence porte sur l'interprétation du verset coranique (sourate Al-Ma'ida, 5:4) mentionnant \"invoquez sur cela le nom d'Allah\" au sujet du gibier pris par un animal dressé : certaines écoles y voient une condition stricte de licéité, d'autres une recommandation dont l'omission n'affecte pas la validité du gibier.",
  },
  {
    title: "L'expiation (kaffara) du serment rompu",
    slug: "kaffara-serment-rompu",
    category: "Serments et vœux (Ayman)",
    description: "Quelle compensation est due lorsqu'une personne rompt délibérément un serment prêté au nom de Dieu.",
    positions: [
      { schoolSlug: "malikite", text: "L'expiation consiste, au choix, à nourrir ou habiller dix nécessiteux, ou affranchir un esclave ; à défaut, jeûner trois jours, non nécessairement consécutifs." },
      { schoolSlug: "hanafite", text: "Position identique concernant les options principales, avec une préférence pour la nourriture des nécessiteux plutôt que l'habillement lorsque les deux sont également accessibles." },
      { schoolSlug: "shafiite", text: "Mêmes options que les malikites (nourrir, habiller ou affranchir, à défaut jeûner trois jours), avec une exigence de jeûne consécutif selon l'avis le plus suivi de l'école." },
      { schoolSlug: "hanbalite", text: "Position identique aux trois autres écoles sur les options principales de compensation, fondées sur le même verset coranique." },
    ],
    divergenceExplanation: "Les quatre écoles s'accordent largement sur les options de compensation directement énoncées par le Coran (sourate Al-Ma'ida, 5:89), la divergence portant surtout sur des points secondaires comme le caractère consécutif ou non du jeûne de substitution lorsque les autres options ne sont pas accessibles.",
  },
  {
    title: "Le délai avant lequel le mari peut reprendre son épouse après un talaq révocable",
    slug: "delai-reprise-apres-talaq-revocable",
    category: "Mariage (Nikah)",
    description: "Durant combien de temps, après un talaq de type révocable (raj'i), le mari peut-il reprendre son épouse sans nouveau contrat de mariage.",
    positions: [
      { schoolSlug: "malikite", text: "Le mari peut reprendre son épouse à tout moment durant la période de idda (délai de viduité), par une simple déclaration ou la reprise de la vie conjugale, sans nouveau contrat ni nouveau mahr." },
      { schoolSlug: "hanafite", text: "Position identique : la reprise reste possible tant que la idda n'est pas achevée, sans formalité contractuelle nouvelle." },
      { schoolSlug: "shafiite", text: "Même principe : le mari conserve le droit de reprendre son épouse jusqu'à l'expiration de la idda, un talaq révocable ne rompant pas immédiatement le lien conjugal." },
      { schoolSlug: "hanbalite", text: "Position identique aux trois autres écoles sur ce principe, largement consensuel, fondé sur le verset coranique de la sourate Al-Baqara (2:228)." },
    ],
    divergenceExplanation: "Ce principe fait l'objet d'un large consensus entre les quatre écoles, directement fondé sur le Coran (sourate Al-Baqara, 2:228) : un talaq révocable (raj'i, généralement le premier ou le second) laisse au mari la possibilité de reprendre son épouse durant toute la période de idda sans nouveau contrat, à la différence d'un talaq définitif (ba'in).",
  },
  {
    title: "Peut-on accomplir le hajj à la place d'une personne décédée ou durablement incapable ?",
    slug: "hajj-badal-pour-autrui",
    category: "Hajj et 'Umra",
    description: "Si une personne peut accomplir le hajj obligatoire au nom d'un proche décédé sans avoir pu l'accomplir, ou durablement incapable de voyager.",
    positions: [
      { schoolSlug: "malikite", text: "Le hajj par procuration (hajj badal) n'est généralement pas admis pour remplacer l'obligation elle-même, sauf disposition testamentaire spécifique finançant un tel hajj après le décès." },
      { schoolSlug: "hanafite", text: "Le hajj badal est admis pour une personne décédée n'ayant pu accomplir son hajj obligatoire, ou durablement incapable (maladie chronique, grand âge), sur la base d'un hadith explicite rapporté par Bukhari." },
      { schoolSlug: "shafiite", text: "Position identique aux hanafites : le hajj badal est admis dans les mêmes circonstances, fondé sur le même hadith autorisant une femme à accomplir le hajj au nom de son père incapable de voyager." },
      { schoolSlug: "hanbalite", text: "Position identique aux hanafites et shafi'ites : le hajj badal est admis pour le défunt n'ayant pu s'acquitter de son obligation, ou pour l'incapacité durable." },
    ],
    divergenceExplanation: "La divergence porte sur la portée donnée à un hadith rapporté par Bukhari où le Prophète ﷺ autorise une femme à accomplir le hajj pour son père incapable de voyager : trois écoles en tirent un principe général admettant le hajj badal, tandis que l'école malikite adopte une lecture plus restrictive, limitant cette possibilité à des circonstances testamentaires précises.",
  },
  {
    title: "La prière de Duha (matin) : nombre de rak'at minimal et recommandé",
    slug: "nombre-rakat-priere-duha",
    category: "Prière (Salat)",
    description: "Combien d'unités (rak'at) accomplir pour la prière surérogatoire de Duha, effectuée en matinée après le lever du soleil.",
    positions: [
      { schoolSlug: "malikite", text: "Un minimum de deux unités est retenu, sans maximum fixé précisément, la pratique la plus courante allant jusqu'à huit." },
      { schoolSlug: "hanafite", text: "Un minimum de deux unités est recommandé, avec une pratique habituelle de quatre, sans maximum strictement défini." },
      { schoolSlug: "shafiite", text: "Un minimum de deux unités, avec un maximum recommandé de huit unités, position s'appuyant sur plusieurs rapports concernant la pratique du Prophète ﷺ." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des shafi'ites : deux unités au minimum, la pratique du Prophète ﷺ rapportée allant généralement jusqu'à huit." },
    ],
    divergenceExplanation: "Les hadiths rapportant la pratique du Prophète ﷺ concernant la prière de Duha varient sur le nombre exact d'unités accomplies selon les occasions, ce qui explique l'absence d'un nombre unique fixe retenu par l'ensemble des écoles, chacune s'accordant néanmoins sur un minimum de deux unités.",
  },
  {
    title: "Sujud at-Tilawa (prosternation de récitation) : obligatoire ou recommandée ?",
    slug: "sujud-at-tilawa-statut",
    category: "Prière (Salat)",
    description: "Si la prosternation accomplie à la lecture ou à l'écoute de certains versets coraniques spécifiques est une obligation ou une simple recommandation.",
    positions: [
      { schoolSlug: "malikite", text: "Le sujud at-tilawa est une sunna fortement recommandée, sans atteindre le statut d'obligation stricte." },
      { schoolSlug: "hanafite", text: "Le sujud at-tilawa a le statut d'obligation (wajib), catégorie intermédiaire propre à l'école entre le fard et la sunna." },
      { schoolSlug: "shafiite", text: "Position identique aux malikites : sunna recommandée, non obligatoire." },
      { schoolSlug: "hanbalite", text: "Position identique aux malikites et shafi'ites : sunna recommandée, non obligatoire." },
    ],
    divergenceExplanation: "La divergence reprend, sur ce point précis, la même logique déjà observée au sujet du Witr : l'école hanafite range le sujud at-tilawa dans sa catégorie intermédiaire du wajib, tandis que les trois autres écoles le classent comme une sunna recommandée sans caractère obligatoire strict.",
  },
  {
    title: "Le contact avec un chien rend-il l'eau ou un objet impur ?",
    slug: "contact-chien-et-purete",
    category: "Purification (Tahara)",
    description: "Si le chien est considéré comme un animal intrinsèquement impur (najis), et quelles conséquences cela a sur la purification d'un récipient ou d'un vêtement à son contact.",
    positions: [
      { schoolSlug: "malikite", text: "Le chien, comme l'ensemble des animaux vivants, est considéré comme pur (tahir) ; seul un récipient dans lequel il a bu doit être lavé, par précaution sanitaire plutôt que pour une impureté rituelle." },
      { schoolSlug: "hanafite", text: "La salive du chien est impure, mais son pelage sec au contact n'annule pas la pureté d'un vêtement ; un récipient souillé par sa salive doit être lavé plusieurs fois." },
      { schoolSlug: "shafiite", text: "La salive du chien est une impureté majeure (najasa mughallaza) : un récipient souillé doit être lavé sept fois, dont une avec de la terre, conformément à un hadith explicite rapporté par Muslim." },
      { schoolSlug: "hanbalite", text: "Position identique aux shafi'ites : impureté majeure nécessitant sept lavages dont un avec de la terre, sur la base du même hadith." },
    ],
    divergenceExplanation: "La divergence porte sur la portée du hadith de Muslim prescrivant sept lavages dont un avec de la terre pour un récipient où un chien a bu : les écoles shafi'ite et hanbalite y voient la preuve d'une impureté intrinsèque et majeure de l'animal, tandis que l'école malikite y voit une prescription d'hygiène sans impureté rituelle sous-jacente, et l'école hanafite adopte une position intermédiaire limitée à la salive.",
  },
  {
    title: "La vente à crédit avec un prix supérieur au prix comptant (bay' mu'ajjal)",
    slug: "bay-mu-ajjal-majoration-credit",
    category: "Commerce et transactions (Mu'amalat)",
    description: "Si un vendeur peut licitement proposer un prix plus élevé pour un paiement différé (à crédit) que pour un paiement immédiat au comptant, sans que cela constitue un riba déguisé.",
    positions: [
      { schoolSlug: "malikite", text: "La majoration de prix pour un paiement différé est licite, à condition que le prix soit fixé et convenu de manière définitive au moment du contrat, sans possibilité de le faire varier ensuite selon le retard effectif de paiement." },
      { schoolSlug: "hanafite", text: "Position identique : la vente à crédit avec un prix supérieur au comptant est licite dès lors que le prix différé est fixé une fois pour toutes lors de la conclusion du contrat." },
      { schoolSlug: "shafiite", text: "Même position que les malikites et hanafites : la majoration est licite si elle résulte d'un prix de vente fixé d'emblée, la transaction restant fondamentalement une vente (bay') et non un prêt portant intérêt." },
      { schoolSlug: "hanbalite", text: "Position identique aux trois autres écoles sur le principe, à la condition stricte qu'un seul prix soit fixé dès le contrat, sans possibilité de renégociation ultérieure liée au délai." },
    ],
    divergenceExplanation: "Les quatre écoles s'accordent sur le principe general, distinguant cette majoration du riba tant qu'elle résulte d'un prix de vente unique fixé au moment du contrat (le temps étant reconnu comme ayant une valeur licite dans une vente), à la différence d'un prêt d'argent majoré dans le temps, qui relèverait du riba an-nasi'a strictement interdit ; ce point est inclus pour sa pertinence directe dans le débat contemporain sur la finance islamique plutôt que pour une réelle divergence entre écoles.",
  },
  {
    title: "Le mariage contracté durant l'état d'ihram est-il valide ?",
    slug: "mariage-durant-ihram",
    category: "Hajj et 'Umra",
    description: "Si un pèlerin en état de sacralisation (ihram) peut valablement conclure un contrat de mariage, pour lui-même ou en tant que tuteur d'un tiers.",
    positions: [
      { schoolSlug: "malikite", text: "Le mariage contracté durant l'ihram est nul, sur la base d'un hadith de Muslim rapportant l'interdiction faite au pèlerin sacralisé de se marier ou de marier autrui." },
      { schoolSlug: "hanafite", text: "Le mariage contracté durant l'ihram est valide ; l'état d'ihram interdit la consommation du mariage mais non la conclusion du contrat lui-même." },
      { schoolSlug: "shafiite", text: "Position identique aux malikites : le mariage est nul durant l'ihram, conformément au même hadith explicite." },
      { schoolSlug: "hanbalite", text: "Position identique aux malikites et shafi'ites : nullité du mariage contracté pendant l'état de sacralisation." },
    ],
    divergenceExplanation: "La divergence porte sur l'interprétation d'un hadith rapporté par Muslim (\"le pèlerin sacralisé ne doit ni se marier, ni marier autrui\") : trois écoles le prennent au sens direct d'une interdiction touchant le contrat lui-même, tandis que l'école hanafite, s'appuyant sur un autre rapport où le Prophète ﷺ se maria lui-même en état d'ihram selon Ibn Abbas, restreint la portée de l'interdiction à la seule consommation du mariage.",
  },
  {
    title: "Le voile est-il une condition de validité de la prière pour la femme ?",
    slug: "voile-condition-validite-priere-femme",
    category: "Prière (Salat)",
    description: "Si le fait de couvrir la chevelure et le corps selon les règles de la pudeur (awra) est une condition stricte de validité de la prière pour une femme, ou une simple obligation distincte.",
    positions: [
      { schoolSlug: "malikite", text: "Couvrir l'awra est une condition de validité de la prière ; une prière accomplie tête découverte sans excuse doit être recommencée." },
      { schoolSlug: "hanafite", text: "Position identique : couvrir l'awra, y compris la chevelure pour la femme, conditionne la validité de la prière." },
      { schoolSlug: "shafiite", text: "Même position : la couverture de l'awra est une condition de validité stricte, la prière étant nulle si une partie de l'awra reste visible sans excuse (oubli exclu)." },
      { schoolSlug: "hanbalite", text: "Position identique aux trois autres écoles : condition de validité de la prière, distincte de l'obligation plus générale de la pudeur en dehors de la prière." },
    ],
    divergenceExplanation: "Ce point fait l'objet d'un large consensus entre les quatre écoles sur le principe que la couverture de l'awra conditionne la validité de la prière elle-même (indépendamment de l'obligation vestimentaire plus large hors contexte rituel, voir awra) ; les nuances entre écoles portent surtout sur l'étendue exacte de l'awra féminine concernée, déjà abordée dans le concept dédié.",
  },
  {
    title: "Le sang restant dans la viande après un égorgement rituel est-il pur ?",
    slug: "sang-residuel-viande-egorgee",
    category: "Alimentation (Hilal wa Haram)",
    description: "Si le sang qui demeure dans les vaisseaux et les tissus de la viande après un égorgement rituel valide reste pur et sans incidence sur la licéité de la consommation.",
    positions: [
      { schoolSlug: "malikite", text: "Le sang résiduel imprégnant la chair après un égorgement valide est considéré pur, seul le sang qui s'écoule au moment de l'égorgement étant visé par l'interdiction coranique." },
      { schoolSlug: "hanafite", text: "Position identique : le sang qui reste naturellement dans les tissus de la viande après l'écoulement principal n'est pas concerné par l'interdit coranique du sang répandu." },
      { schoolSlug: "shafiite", text: "Même position que les malikites et hanafites, fondée sur l'impossibilité pratique d'éliminer totalement ce sang résiduel et sur la formulation coranique visant spécifiquement le \"sang répandu\" (sourate Al-An'am, 6:145)." },
      { schoolSlug: "hanbalite", text: "Position identique aux trois autres écoles sur ce point, largement consensuel." },
    ],
    divergenceExplanation: "Les quatre écoles s'accordent sur ce point à partir de la formulation précise du verset coranique interdisant \"le sang répandu\" (sourate Al-An'am, 6:145), interprétée comme visant le sang qui s'écoule activement au moment de l'égorgement plutôt que celui qui reste naturellement imprégné dans les tissus ; inclus pour sa pertinence pratique quotidienne plutôt que pour une divergence entre écoles.",
  },
  {
    title: "La zakat est-elle due sur les biens d'un enfant mineur ?",
    slug: "zakat-sur-biens-du-mineur",
    category: "Zakat",
    description: "Si le patrimoine (or, argent, biens commerciaux) appartenant à un enfant mineur ou une personne sous tutelle est soumis à la zakat, à verser par son tuteur.",
    positions: [
      { schoolSlug: "malikite", text: "La zakat est due sur les biens du mineur atteignant le nisab, à verser par son tuteur légal sur son patrimoine." },
      { schoolSlug: "hanafite", text: "La zakat n'est pas due sur l'or, l'argent ou les biens commerciaux d'un mineur, faute de capacité juridique et d'obligation religieuse personnelle ; seule la zakat agricole ('ushr) reste due sur ses terres." },
      { schoolSlug: "shafiite", text: "Position identique aux malikites : la zakat est due sur l'ensemble du patrimoine du mineur atteignant le nisab, versée par son tuteur." },
      { schoolSlug: "hanbalite", text: "Position identique aux malikites et shafi'ites : la zakat s'applique au patrimoine du mineur comme à celui d'un adulte." },
    ],
    divergenceExplanation: "La divergence porte sur le lien entre la zakat et la notion d'obligation religieuse personnelle (taklif), qui suppose normalement la capacité juridique de l'adulte : l'école hanafite en tire que la zakat, acte d'adoration à part entière, ne peut être exigée d'un mineur dépourvu de cette capacité, tandis que les trois autres écoles y voient avant tout un droit attaché au bien lui-même, indépendant du statut juridique de son propriétaire.",
  },
  {
    title: "Peut-on avancer le versement de la zakat avant l'échéance du hawl ?",
    slug: "avancer-versement-zakat-avant-hawl",
    category: "Zakat",
    description: "Si la zakat peut être versée par anticipation, avant l'écoulement complet de l'année lunaire (hawl) qui la rend normalement exigible.",
    positions: [
      { schoolSlug: "malikite", text: "Le versement anticipé de la zakat n'est généralement pas admis, hormis un délai très court avant l'échéance effective du hawl." },
      { schoolSlug: "hanafite", text: "Le versement anticipé est admis, y compris plusieurs années à l'avance, à condition que le nisab soit déjà atteint au moment du versement." },
      { schoolSlug: "shafiite", text: "Le versement anticipé est admis pour une seule année à l'avance, une fois le nisab atteint, mais pas au-delà." },
      { schoolSlug: "hanbalite", text: "Position proche de celle des shafi'ites et hanafites : le versement anticipé est admis dès que le nisab est atteint, avant l'échéance du hawl." },
    ],
    divergenceExplanation: "La divergence porte sur la nature de la condition du hawl : les écoles qui admettent l'anticipation y voient une simple facilité de calcul n'empêchant pas un acte de générosité anticipé, tandis que l'école malikite considère le hawl comme une condition constitutive de l'exigibilité elle-même, rendant un versement trop anticipé assimilable à une simple aumône volontaire plutôt qu'à un acquittement effectif de la zakat.",
  },
  {
    title: "Durée de l'essuyage sur les chaussettes en cuir (mash 'ala al-khuffayn)",
    slug: "duree-mash-al-khuffayn",
    category: "Purification (Tahara)",
    description: "Combien de temps un résident et un voyageur peuvent-ils se contenter d'essuyer leurs chaussettes en cuir (khuff) plutôt que de laver les pieds, lors du wudu.",
    positions: [
      { schoolSlug: "malikite", text: "Aucune limite de durée n'est fixée : l'essuyage reste valide tant que le khuff n'est pas retiré, position la plus connue de l'école sur ce point." },
      { schoolSlug: "hanafite", text: "Un jour et une nuit pour le résident, trois jours et trois nuits pour le voyageur, décomptés depuis le premier essuyage suivant l'enfilage en état de purification." },
      { schoolSlug: "shafiite", text: "Position identique aux hanafites : un jour et une nuit pour le résident, trois jours et trois nuits pour le voyageur." },
      { schoolSlug: "hanbalite", text: "Position identique aux hanafites et shafi'ites concernant ces mêmes durées." },
    ],
    divergenceExplanation: "Trois écoles retiennent les durées précises rapportées dans un hadith de Muslim (un jour pour le résident, trois pour le voyageur), tandis que l'école malikite, s'appuyant sur d'autres rapports ne mentionnant aucune limite explicite, autorise l'essuyage sans limite de durée tant que le khuff reste porté.",
  },
  {
    title: "La prière de l'Aïd est-elle obligatoire ?",
    slug: "priere-aid-obligatoire",
    category: "Prière (Salat)",
    description: "Si la prière collective des deux fêtes annuelles (Aïd al-Fitr et Aïd al-Adha) a un statut juridique obligatoire, ou seulement recommandé.",
    positions: [
      { schoolSlug: "malikite", text: "La prière de l'Aïd est une sunna fortement recommandée (mu'akkada), sans atteindre le statut d'obligation stricte." },
      { schoolSlug: "hanafite", text: "La prière de l'Aïd a le statut d'obligation (wajib) pour chaque individu remplissant les conditions de la prière du vendredi, catégorie intermédiaire propre à l'école." },
      { schoolSlug: "shafiite", text: "Position identique aux malikites : sunna fortement recommandée, non obligatoire à titre individuel." },
      { schoolSlug: "hanbalite", text: "La prière de l'Aïd est une obligation collective (fard kifaya) : son accomplissement par un nombre suffisant de la communauté dispense les autres, position distincte des trois autres écoles." },
    ],
    divergenceExplanation: "Les quatre écoles divergent sur le degré exact d'obligation de cette prière, chacune s'appuyant sur une lecture différente de la constance avec laquelle le Prophète ﷺ et les premiers califes l'ont maintenue : l'école hanafite y voit une obligation individuelle de sa catégorie intermédiaire du wajib, l'école hanbalite une obligation collective, et les écoles malikite et shafi'ite une sunna fortement recommandée sans caractère obligatoire.",
  },
  {
    title: "Le rire pendant la prière annule-t-il aussi le wudu ?",
    slug: "rire-priere-annule-wudu",
    category: "Purification (Tahara)",
    description: "Si un rire franc et audible (qahqaha) survenu pendant la prière invalide uniquement la prière, ou également l'état de purification (wudu) lui-même.",
    positions: [
      { schoolSlug: "malikite", text: "Le rire pendant la prière invalide uniquement la prière elle-même, sans effet sur le wudu, qui reste valide pour une prière ultérieure." },
      { schoolSlug: "hanafite", text: "Le rire franc et audible pendant une prière comportant inclinaison et prosternation invalide à la fois la prière et le wudu lui-même, position spécifique et bien connue de l'école." },
      { schoolSlug: "shafiite", text: "Position identique aux malikites : seule la prière est invalidée, le wudu demeurant valide." },
      { schoolSlug: "hanbalite", text: "Position identique aux malikites et shafi'ites : le rire n'affecte que la prière, pas l'état de purification." },
    ],
    divergenceExplanation: "L'école hanafite s'appuie sur un rapport particulier reliant le rire pendant la prière à l'annulation du wudu lui-même, une position que les trois autres écoles ne retiennent pas, considérant que seuls les événements habituellement reconnus comme annulant le wudu (sorties naturelles, sommeil profond, contact...) peuvent l'invalider, à l'exclusion du rire qui reste une faute propre à la prière.",
  },
  {
    title: "Les conditions stipulées par l'épouse dans le contrat de mariage sont-elles contraignantes ?",
    slug: "conditions-stipulees-contrat-mariage",
    category: "Mariage (Nikah)",
    description: "Si une condition posée par l'épouse lors du contrat de mariage (par exemple ne pas être prise comme coépouse, ou pouvoir continuer ses études) engage juridiquement le mari.",
    positions: [
      { schoolSlug: "malikite", text: "Certaines conditions sont contraignantes, notamment celle de ne pas prendre de coépouse, dont la violation ouvre à l'épouse un droit à la séparation, mais pas l'ensemble des conditions possibles." },
      { schoolSlug: "hanafite", text: "Les conditions contraires à l'objet même du mariage ou à l'ordre public ne sont pas contraignantes ; le contrat reste valide mais la condition elle-même est réputée nulle et sans effet." },
      { schoolSlug: "shafiite", text: "Position proche des hanafites : la plupart des conditions stipulées sont considérées non contraignantes, le mariage restant valide sans que le mari soit lié par elles." },
      { schoolSlug: "hanbalite", text: "Toute condition licite stipulée dans le contrat est contraignante pour le mari ; sa violation ouvre à l'épouse le droit de demander la dissolution du mariage, position la plus favorable à la validité de ces clauses." },
    ],
    divergenceExplanation: "La divergence s'appuie sur des rapports concurrents, notamment un hadith rapporté par Al-Bukhari (\"les conditions que vous êtes le plus en droit de respecter sont celles par lesquelles vous avez rendu licite l'union intime\") : l'école hanbalite lui donne une portée large et contraignante, tandis que les écoles hanafite et shafi'ite restreignent fortement la validité de telles clauses, jugées contraires à la nature même du contrat de mariage tel qu'elles le conçoivent ; l'école malikite adopte une position intermédiaire limitée à certaines conditions bien identifiées.",
  },
  {
    title: "Peut-on répéter la 'Umra plusieurs fois durant un même séjour à Mecque ?",
    slug: "repeter-umra-meme-sejour",
    category: "Hajj et 'Umra",
    description: "Si un pèlerin déjà présent à Mecque peut sortir vers un lieu de sacralisation proche (comme At-Tan'im) pour accomplir une nouvelle 'umra durant le même séjour.",
    positions: [
      { schoolSlug: "malikite", text: "Répéter la 'umra durant un même séjour est déconseillé (makruh), l'école privilégiant une 'umra unique par voyage plutôt que leur multiplication artificielle." },
      { schoolSlug: "hanafite", text: "Répéter la 'umra est permis sans réserve particulière durant un même séjour, à condition de se sacraliser de nouveau depuis un lieu situé hors du territoire sacré (hill)." },
      { schoolSlug: "shafiite", text: "Position identique aux hanafites : la répétition de la 'umra est permise, chaque 'umra distincte comportant son propre mérite religieux." },
      { schoolSlug: "hanbalite", text: "Position identique aux hanafites et shafi'ites : aucune restriction particulière à la répétition de la 'umra durant le même séjour." },
    ],
    divergenceExplanation: "La divergence tient à l'appréciation de la pratique privilégiée par le Prophète ﷺ et ses Compagnons : l'école malikite, s'appuyant sur le fait que le Prophète ﷺ lui-même n'accomplit qu'une seule 'umra par séjour, y voit la pratique la plus méritoire et déconseille la répétition, tandis que les trois autres écoles, s'appuyant sur l'autorisation accordée par le Prophète ﷺ à Aisha de répéter la 'umra lors du pèlerinage d'adieu, n'y voient aucune restriction de principe.",
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
    // La figure fondatrice est enregistrée comme `author` (référence croisée
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
