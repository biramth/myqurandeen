import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, fiqhDivergenceNotes, fiqhPositions, fiqhTopics, schools, sources } from "../schema";

/**
 * Écoles juridiques (fiqh) et courants théologiques, et comparateur de
 * positions. Aucune API ouverte n'existe pour ce domaine : ce contenu est
 * compilé a partir d'ouvrages de référence standards de fiqh compare,
 * notamment "Al-Fiqh ala al-Madhahib al-Arba'a" d'Abd al-Rahman al-Jaziri,
 * qui a précisément pour objet de présenter les positions des quatre
 * écoles sunnites côte à côte. Chaque position est attribuée à l'école
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
    sourcesUsed: "Coran, Sunna, raisonnement rationnel (kalam) au service de la defense des croyances.",
    era: "IVe siècle AH / Xe siècle",
  },
  {
    name: "Maturidisme",
    slug: "maturidisme",
    type: "theological",
    founderName: "Abu Mansur al-Maturidi",
    founderEra: "m. 333 AH / 944",
    history:
      "Courant théologique fondé par Abu Mansur al-Maturidi a Samarcande, developpe indépendamment de l'ash'arisme mais a la même époque et dans un esprit méthodologique proche, historiquement associé a l'école juridique hanafite dont il partage souvent le contexte geographique. Répandu en Asie centrale, en Turquie et dans les Balkans, il constitue avec l'ash'arisme l'une des deux grandes écoles de théologie sunnite reconnues comme orthodoxes par la tradition classique.",
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
      "Courant théologique rationaliste apparu a Bassora, traditionnellement rattache a la rupture de Wasil ibn Ata avec son maitre Al-Hasan al-Basri sur la question du statut du croyant ayant commis un peche grave. Le mu'tazilisme devint doctrine officielle du califat abbasside sous Al-Ma'mun et ses deux successeurs immediats au IXe siècle, période durant laquelle une inquisition (mihna) fut imposee aux savants refusant d'adherer a la thèse mu'tazilite du Coran créé - résistance a laquelle Ahmad ibn Hanbal doit une grande partie de sa notoriete. Le mouvement decline ensuite face a la contre-offensive ash'arite et hanbalite, et demeure aujourd'hui minoritaire, bien qu'historiquement déterminant dans le développement des outils et du vocabulaire du kalam islamique, y compris chez ses adversaires théologiques.",
    principles:
      "Accorde une place centrale à la raison, considérée capable de déterminer indépendamment certaines vérités morales et théologiques, notamment sur des questions comme la justice divine (Dieu ne peut, selon cette école, agir injustement par définition rationnelle de la justice) et le libre arbitre humain (l'être humain est l'auteur réel de ses actes, contrairement à la lecture plus déterministe dominante chez les ash'arites). Position minoritaire et distincte du courant sunnite majoritaire également sur la nature du Coran, considéré créé et non incréé, et sur le statut du croyant ayant commis un grand péché, placé dans une position intermédiaire entre croyant et mécréant.",
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
      { schoolSlug: "malikite", text: "Dans la position la plus connue de l'école, les mains sont laissées le long du corps (sadl) plutôt que croisées, bien que certains malikites rapportent aussi la position croisée." },
      { schoolSlug: "hanafite", text: "La main droite est placée sur la main gauche, sous le nombril." },
      { schoolSlug: "shafiite", text: "La main droite est placée sur la main gauche, sur la poitrine." },
      { schoolSlug: "hanbalite", text: "La main droite est placée sur la main gauche, généralement sous le nombril, position proche de celle des hanafites." },
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
      { schoolSlug: "shafiite", text: "Tout contact direct de peau à peau entre un homme et une femme non mahram annule le wudu, indépendamment de l'intention." },
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
    description: "Un hadith cité six biens précis (or, argent, blé, orge, dattes, sel) pour lesquels un échange inégal entre biens de même nature est interdit (riba al-fadl) ; la question est de savoir si cette règle se limite à ces six biens ou s'étend par analogie à d'autres denrées.",
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
      { schoolSlug: "malikite", text: "La pureté rituelle est une condition stricte de validité du tawaf, à l'image de la prière ; un tawaf accompli en état d'impureture mineure doit être recommencé." },
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
