import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import {
  learningLessons,
  learningPaths,
  learningQuizOptions,
  learningQuizQuestions,
} from "../schema";

/**
 * Quiz d'auto-évaluation, non bloquants, rédigés directement à partir du
 * contenu déjà vérifié des leçons (jamais générés). Deux formats : un
 * mini-quiz par leçon (2 questions) et un quiz final récapitulatif par
 * parcours (6 questions), tous deux purement indicatifs.
 */

interface QuestionSeed {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const LESSON_QUIZZES: Record<string, Record<number, QuestionSeed[]>> = {
  introduction: {
    1: [
      {
        question: "Que signifie le mot \"Islam\" ?",
        options: [
          "Soumission à Dieu, partageant la racine du mot paix",
          "Guerre sainte",
          "Communauté des croyants",
          "Livre sacré",
        ],
        correctIndex: 0,
        explanation: "\"Islam\" vient de la racine s-l-m, qui exprimé la soumission et partage sa racine avec le mot \"paix\" (salam).",
      },
      {
        question: "Quel est le concept central du message islamique selon cette leçon ?",
        options: ["Le tawhid, l'unicité de Dieu", "Le jeûne du Ramadan", "Le pèlerinage à La Mecque", "La zakat"],
        correctIndex: 0,
        explanation: "Le tawhid, l'unicité absolue de Dieu, est présenté comme le fondement de toute la pratique islamique.",
      },
    ],
    2: [
      {
        question: "D'après le hadith de Jibril, combien de niveaux structurent la religion ?",
        options: ["Deux", "Trois", "Quatre", "Cinq"],
        correctIndex: 1,
        explanation: "Le hadith de Jibril distingue trois niveaux : islam (pratique), iman (croyance), ihsan (excellence spirituelle).",
      },
      {
        question: "Comment l'ihsan est-il défini dans le hadith de Jibril ?",
        options: ["Adorer Dieu comme si on Le voyait", "Prier cinq fois par jour", "Croire aux anges", "Jeûner le Ramadan"],
        correctIndex: 0,
        explanation: "L'ihsan est défini comme le fait d'adorer Dieu comme si on Le voyait, et à défaut, de savoir que Lui nous voit.",
      },
    ],
    3: [
      {
        question: "Combien de sourates comprend le Coran ?",
        options: ["99", "100", "114", "120"],
        correctIndex: 2,
        explanation: "Le Coran comprend 114 sourates de longueur très variable.",
      },
      {
        question: "Comment les sourates sont-elles classées dans le mushaf ?",
        options: [
          "Par ordre chronologique de révélation",
          "Globalement de la plus longue à la plus courte",
          "Par ordre alphabétique",
          "Par thème",
        ],
        correctIndex: 1,
        explanation: "Les sourates sont classées dans le mushaf non par ordre chronologique mais globalement de la plus longue à la plus courte.",
      },
    ],
    4: [
      {
        question: "Combien de versets comprend Al-Fatiha ?",
        options: ["Trois", "Quatre", "Sept", "Dix"],
        correctIndex: 2,
        explanation: "Al-Fatiha comprend sept versets, récités dans chaque rak'a de la prière.",
      },
      {
        question: "Quelle est l'unique demande explicite formulée dans Al-Fatiha ?",
        options: [
          "Le pardon des péchés",
          "Être guidé sur le droit chemin",
          "La prospérité matérielle",
          "La victoire sur les ennemis",
        ],
        correctIndex: 1,
        explanation: "La sourate se conclut par une demande de guidance sur le \"droit chemin\", celui des gens comblés par Dieu.",
      },
    ],
    5: [
      {
        question: "Que comprend la shahada ?",
        options: [
          "Un seul témoignage sur Dieu",
          "Deux témoignages : l'unicité de Dieu et la prophétie de Muhammad ﷺ",
          "Cinq articles de foi",
          "Six articles de foi",
        ],
        correctIndex: 1,
        explanation: "La shahada condense deux témoignages : le tawhid et la reconnaissance de la prophétie de Muhammad ﷺ.",
      },
      {
        question: "Où la shahada est-elle également répétée quotidiennement ?",
        options: [
          "Uniquement lors de la conversion",
          "Dans l'appel à la prière et la prière elle-même",
          "Uniquement pendant le Ramadan",
          "Uniquement lors du hajj",
        ],
        correctIndex: 1,
        explanation: "La shahada est répétée quotidiennement dans l'adhan et au sein de la prière.",
      },
    ],
    6: [
      {
        question: "Quel surnom Muhammad ﷺ portait-il avant sa mission prophétique ?",
        options: [
          "Al-Amin (le digne de confiance)",
          "Al-Fatih (le conquérant)",
          "As-Sadiq, un titre reçu après la révélation",
          "Al-Karim (le généreux)",
        ],
        correctIndex: 0,
        explanation: "Muhammad ﷺ était surnommé \"Al-Amin\" bien avant sa mission prophétique, en raison de sa véracité reconnue.",
      },
      {
        question: "Quel épisode illustré cette réputation d'intégrité ?",
        options: [
          "La bataille de Badr",
          "Le choix du juge pour la Pierre Noire lors de la reconstruction de la Kaaba",
          "Le pèlerinage d'adieu",
          "La révélation à Hira",
        ],
        correctIndex: 1,
        explanation: "Les tribus de La Mecque s'en remirent au jugement du premier homme entrant dans l'enceinte, qui fut Muhammad, déjà réputé pour son intégrité.",
      },
    ],
    7: [
      {
        question: "Combien de fois la salah est-elle priée chaque jour ?",
        options: ["Trois fois", "Quatre fois", "Cinq fois", "Sept fois"],
        correctIndex: 2,
        explanation: "La salah est priée cinq fois par jour : fajr, dhuhr, asr, maghrib, isha.",
      },
      {
        question: "Quelle condition rituelle est nécessaire avant la prière ?",
        options: ["Le jeûne", "Le wudu (petites ablutions)", "L'aumône", "Le pèlerinage"],
        correctIndex: 1,
        explanation: "La validité de la salah est conditionnée par un état de pureté rituelle obtenu par le wudu.",
      },
    ],
    8: [
      {
        question: "Où le Prophète ﷺ reçoit-il la première révélation ?",
        options: ["Dans la grotte de Hira", "À Médine", "Sur le mont Arafat", "À Ta'if"],
        correctIndex: 0,
        explanation: "Il reçoit dans la grotte de Hira la première révélation coranique, vers l'âge de quarante ans.",
      },
      {
        question: "Quelle est la durée approximative de la période mecquoise ?",
        options: ["610-622", "622-632", "570-610", "630-632"],
        correctIndex: 0,
        explanation: "La période mecquoise s'étend de 610 (début de la révélation) à 622 (Hégire).",
      },
    ],
    9: [
      {
        question: "Que signifie \"As-Samad\", attribut divin mentionné dans Al-Ikhlas ?",
        options: [
          "Celui qui pardonne",
          "Celui dont tous dépendent, sans qu'Il ne dépende de personne",
          "Celui qui punit",
          "Celui qui crée le mal",
        ],
        correctIndex: 1,
        explanation: "As-Samad désigne Celui dont tous dépendent, sans qu'Il ne dépende de personne.",
      },
      {
        question: "Que rapporte un hadith d'Al-Bukhari à propos d'Al-Ikhlas ?",
        options: [
          "Elle équivaut au tiers du Coran",
          "Elle est la plus longue sourate",
          "Elle a été révélée à Médine",
          "Elle contient dix versets",
        ],
        correctIndex: 0,
        explanation: "Un hadith rapporte qu'Al-Ikhlas \"équivaut au tiers du Coran\" en raison de sa concentration sur le tawhid.",
      },
    ],
    10: [
      {
        question: "Quel est le taux le plus connu de la zakat sur l'épargne monétaire ?",
        options: ["1 %", "2,5 %", "5 %", "10 %"],
        correctIndex: 1,
        explanation: "Le taux le plus connu, applicable à l'épargne monétaire, est de 2,5 %.",
      },
      {
        question: "Combien de catégories de bénéficiaires le Coran précise-t-il pour la zakat ?",
        options: ["Cinq", "Six", "Huit", "Dix"],
        correctIndex: 2,
        explanation: "Le Coran (9:60) précise huit catégories de bénéficiaires possibles.",
      },
    ],
    11: [
      {
        question: "Que s'est-il passé lorsque le Prophète ﷺ s'est rendu à Ta'if ?",
        options: [
          "Il y fut accueilli avec honneur",
          "Il y fut rejeté, insulté et lapidé",
          "Il y fonda la première mosquée",
          "Il y reçut la première révélation",
        ],
        correctIndex: 1,
        explanation: "À Ta'if, le Prophète ﷺ fut rejeté, insulté et lapidé par les habitants.",
      },
      {
        question: "Qu'a fait le Prophète ﷺ face à la proposition de détruire Ta'if ?",
        options: [
          "Il a accepté immédiatement",
          "Il a refusé, espérant que la descendance des habitants croirait un jour",
          "Il a demandé un délai de réflexion",
          "Il a laissé les anges décider",
        ],
        correctIndex: 1,
        explanation: "Il refusa la destruction de la ville, exprimant l'espoir que sa descendance adorerait un jour Dieu seul.",
      },
    ],
    12: [
      {
        question: "Durant quel mois le sawm est-il obligatoire ?",
        options: ["Muharram", "Ramadan", "Dhul-Hijja", "Chawwal"],
        correctIndex: 1,
        explanation: "Le sawm est obligatoire durant le mois de Ramadan, neuvième mois du calendrier lunaire islamique.",
      },
      {
        question: "Quel objectif le Coran associé-t-il au jeûne (sourate 2:183) ?",
        options: ["La richesse matérielle", "La taqwa (conscience de Dieu)", "La force physique", "La sagesse politique"],
        correctIndex: 1,
        explanation: "Le Coran présente le jeûne comme un moyen d'accéder à la taqwa, la conscience de Dieu.",
      },
    ],
    13: [
      {
        question: "Que marqué l'Hégire (622) ?",
        options: [
          "Le début du calendrier islamique",
          "La fin de la mission prophétique",
          "La révélation du dernier verset",
          "La conquête de La Mecque",
        ],
        correctIndex: 0,
        explanation: "L'Hégire (622) marqué le point de départ du calendrier islamique.",
      },
      {
        question: "Quel traité de trêve est signé en 628 ?",
        options: ["Le traité de Hudaybiyya", "Le traité de Médine", "Le pacte de Ta'if", "L'accord d'Aqaba"],
        correctIndex: 0,
        explanation: "Le traité de trêve de Hudaybiyya est signé en 628, avant la conquête pacifique de La Mecque en 630.",
      },
    ],
    14: [
      {
        question: "Combien de versets comprend Al-Asr ?",
        options: ["Trois", "Cinq", "Sept", "Dix"],
        correctIndex: 0,
        explanation: "Al-Asr est l'une des plus courtes sourates du Coran, avec seulement trois versets.",
      },
      {
        question: "Quels sont les quatre éléments qui permettent d'échapper à la \"perte\" selon Al-Asr ?",
        options: [
          "La richesse, la santé, la famille, la paix",
          "La foi, les bonnes actions, le rappel de la vérité, le rappel de la patience",
          "La prière, le jeûne, l'aumône, le pèlerinage",
          "La sagesse, la force, le courage, la loyauté",
        ],
        correctIndex: 1,
        explanation: "Al-Asr identifié quatre conditions : la foi (iman), les bonnes actions, le rappel mutuel de la vérité et de la patience.",
      },
    ],
    15: [
      {
        question: "À quel épisode les rites du hajj sont-ils traditionnellement rattachés ?",
        options: ["L'Hégire", "L'histoire d'Ibrahim, Hajar et Isma'il", "La bataille de Badr", "Le pèlerinage d'adieu"],
        correctIndex: 1,
        explanation: "Les rites du hajj sont traditionnellement rattachés à l'histoire d'Ibrahim, de son épouse Hajar et de leur fils Isma'il.",
      },
      {
        question: "Quelle est la différence entre le hajj et la 'umra ?",
        options: [
          "Il n'y a aucune différence",
          "La 'umra est un pèlerinage mineur réalisable toute l'année",
          "La 'umra est obligatoire, le hajj est facultatif",
          "Le hajj se fait uniquement à Médine",
        ],
        correctIndex: 1,
        explanation: "La 'umra est un pèlerinage mineur, réalisable à tout moment de l'année, sans les stations propres au hajj.",
      },
    ],
    16: [
      {
        question: "Comment le Coran (21:107) décrit-il la mission du Prophète ﷺ ?",
        options: ["Un juge sévère", "Une miséricorde pour l'univers", "Un conquérant", "Un législateur uniquement"],
        correctIndex: 1,
        explanation: "Le Coran décrit la mission du Prophète ﷺ comme \"une miséricorde pour l'univers\" (rahmatan lil-alamin).",
      },
      {
        question: "Que rapportent plusieurs hadiths à propos des animaux ?",
        options: [
          "Ils n'ont aucune importance morale",
          "Des mises en garde explicites contre leur maltraitance",
          "Ils doivent être évités par les croyants",
          "Ils ne peuvent pas être approchés",
        ],
        correctIndex: 1,
        explanation: "Plusieurs hadiths mettent explicitement en garde contre la maltraitance animale.",
      },
    ],
    17: [
      {
        question: "Lequel de ces éléments ne fait PAS partie des six piliers de la foi ?",
        options: ["Les anges", "Le Jour dernier", "Le hajj", "Le décret divin (qadar)"],
        correctIndex: 2,
        explanation: "Le hajj est un pilier de la pratique (islam), pas un article de la croyance (iman).",
      },
      {
        question: "Que reconnaît la croyance au qadar ?",
        options: [
          "Que Dieu ignore l'avenir",
          "Que Dieu connaît et a décrété ce qui adviendra, sans annuler la responsabilité humaine",
          "Que l'être humain n'a aucun libre arbitre",
          "Que le destin est fixé par les anges",
        ],
        correctIndex: 1,
        explanation: "Le qadar reconnaît que Dieu connaît et a décrété ce qui adviendra, sans annuler la responsabilité réelle de l'être humain.",
      },
    ],
    18: [
      {
        question: "Que comprend un hadith en principe ?",
        options: [
          "Uniquement un contenu (matn)",
          "Une chaîne de transmetteurs (isnad) et un contenu (matn)",
          "Uniquement une chaîne de transmission",
          "Un verset coranique commenté",
        ],
        correctIndex: 1,
        explanation: "Un hadith comprend en principe une chaîne de transmetteurs (isnad) et un contenu (matn).",
      },
      {
        question: "Combien de recueils sont traditionnellement considérés comme canoniques chez les sunnites ?",
        options: ["Quatre", "Cinq", "Six", "Huit"],
        correctIndex: 2,
        explanation: "Six recueils forment les Kutub as-Sittah : Bukhari, Muslim, Abu Dawud, At-Tirmidhi, An-Nasa'i et Ibn Majah.",
      },
    ],
  },
  "pratique-de-la-priere": {
    1: [
      {
        question: "Laquelle de ces conditions doit être réunie avant de commencer la prière ?",
        options: [
          "Être orienté vers La Mecque (qibla)",
          "Avoir mémorisé tout le Coran",
          "Être dans une mosquée",
          "Avoir jeûné le jour même",
        ],
        correctIndex: 0,
        explanation: "L'orientation vers la qibla fait partie des conditions de validité de la prière, avec la pureté rituelle, le temps entré, l'awra couverte et l'intention.",
      },
      {
        question: "Par quelle formule commence la prière ?",
        options: ["\"As-salamu alaykum\"", "\"Allahu akbar\" (takbirat al-ihram)", "\"Bismillah\"", "\"Alhamdulillah\""],
        correctIndex: 1,
        explanation: "La prière commence par le takbir d'ouverture, \"Allahu akbar\" (takbirat al-ihram).",
      },
    ],
    2: [
      {
        question: "Dans quel ordre se déroule le wudu ?",
        options: [
          "Pieds, mains, visage, tête",
          "Mains, bouche/nez, visage, avant-bras, tête/oreilles, pieds",
          "Visage, pieds, mains, tête",
          "Tête, visage, mains, pieds",
        ],
        correctIndex: 1,
        explanation: "Le wudu suit un ordre précis : mains, bouche et nez, visage, avant-bras, passage sur la tête et les oreilles, puis pieds.",
      },
      {
        question: "Lequel de ces gestes du wudu est reconnu comme obligatoire par toutes les écoles ?",
        options: ["Le rinçage du nez", "Le rinçage de la bouche", "Laver le visage", "Répéter chaque geste trois fois"],
        correctIndex: 2,
        explanation: "Laver le visage, les avant-bras et les pieds, et passer la main sur une partie de la tête, sont reconnus comme obligatoires par l'ensemble des écoles.",
      },
    ],
    3: [
      {
        question: "Quelle est la séquence de base d'une rak'a ?",
        options: [
          "Station debout, inclinaison, deux prosternations",
          "Deux prosternations puis station debout",
          "Inclinaison seule répétée",
          "Position assise puis inclinaison",
        ],
        correctIndex: 0,
        explanation: "Chaque rak'a suit la séquence : station debout (qiyam), inclinaison (ruku'), puis deux prosternations (sujud).",
      },
      {
        question: "À quel moment de la rak'a le fidèle est-il considéré le plus proche de Dieu ?",
        options: ["La station debout", "L'inclinaison", "La prosternation", "Le taslim"],
        correctIndex: 2,
        explanation: "La prosternation est considérée comme le moment de plus grande proximité avec Dieu, propice aux invocations personnelles.",
      },
    ],
    4: [
      {
        question: "Quelle sourate est récitée à chaque rak'a de chaque prière ?",
        options: ["Al-Ikhlas", "Al-Fatiha", "Al-Baqara", "Ya-Sin"],
        correctIndex: 1,
        explanation: "La Fatiha est récitée à chaque rak'a et considérée comme un pilier de la prière.",
      },
      {
        question: "Que dit-on généralement lors de la prosternation ?",
        options: [
          "\"Subhana rabbiya al-a'la\" (Gloire à mon Seigneur le Très Haut)",
          "\"Allahu akbar\" uniquement",
          "Le tashahhud complet",
          "Rien, le silence est requis",
        ],
        correctIndex: 0,
        explanation: "\"Subhana rabbiya al-a'la\" est la formule de glorification récitée durant la prosternation.",
      },
    ],
    5: [
      {
        question: "Que récite-t-on en position assise, notamment à la fin de la prière ?",
        options: ["La Fatiha", "Le tashahhud", "Ayat al-Kursi", "Le takbir seul"],
        correctIndex: 1,
        explanation: "Le tashahhud, qui inclut l'attestation de foi, est récité en position assise, après deux rak'at puis à la fin de la prière.",
      },
      {
        question: "Comment se conclut la prière ?",
        options: [
          "Par une prosternation supplémentaire",
          "Par le taslim, en tournant la tête à droite puis à gauche",
          "En restant assis en silence",
          "Par la récitation de la Fatiha",
        ],
        correctIndex: 1,
        explanation: "La prière se conclut par le taslim : tourner la tête vers la droite puis vers la gauche en saluant.",
      },
    ],
    6: [
      {
        question: "Combien de prières obligatoires rythment la journée ?",
        options: ["Trois", "Quatre", "Cinq", "Sept"],
        correctIndex: 2,
        explanation: "Cinq prières obligatoires : fajr, dhuhr, asr, maghrib et isha.",
      },
      {
        question: "Quelle prière remplacé exceptionnellement le dhuhr le vendredi ?",
        options: ["Le fajr", "La jumu'a (prière du vendredi)", "L'isha", "Le maghrib"],
        correctIndex: 1,
        explanation: "La prière du vendredi (jumu'a) remplacé le dhuhr ce jour-là, dans des conditions collectives précises.",
      },
    ],
    7: [
      {
        question: "Quel verset est largement rapporté comme récité après chaque prière obligatoire ?",
        options: ["Al-Ikhlas", "Ayat al-Kursi (2:255)", "Al-Fatiha", "An-Nas"],
        correctIndex: 1,
        explanation: "La récitation d'Ayat al-Kursi après chaque prière obligatoire est une pratique largement rapportée.",
      },
      {
        question: "Que désigne le terme \"dhikr\" ?",
        options: [
          "Le jeûne du Ramadan",
          "Le rappel ou la mention de Dieu, sous toutes ses formes",
          "Le pèlerinage",
          "L'aumône obligatoire",
        ],
        correctIndex: 1,
        explanation: "Le dhikr désigne toute mention ou tout rappel de Dieu, par la parole, la récitation ou la pensée.",
      },
    ],
    8: [
      {
        question: "Que dit-on traditionnellement avant de manger ?",
        options: ["\"Alhamdulillah\"", "\"Bismillah\"", "\"Subhanallah\"", "\"Allahu akbar\""],
        correctIndex: 1,
        explanation: "\"Bismillah\" (Au nom de Dieu) est dit avant de manger ; \"Alhamdulillah\" (Louange à Dieu) après.",
      },
      {
        question: "Quel est le statut juridique des invocations du quotidien (repas, sommeil, voyage...) ?",
        options: ["Obligatoires (fard)", "Recommandées (sunna)", "Interdites en dehors du Ramadan", "Réservées aux savants"],
        correctIndex: 1,
        explanation: "Ces invocations relèvent de la sunna, la pratique recommandée du Prophète ﷺ, sans être obligatoires.",
      },
    ],
  },
  "jeune-et-aumone": {
    1: [
      {
        question: "Quel est le quatrième pilier de l'Islam ?",
        options: ["La zakat", "Le sawm (jeûne du Ramadan)", "Le hajj", "La shahada"],
        correctIndex: 1,
        explanation: "Le sawm, le jeûne du mois de Ramadan, est le quatrième des cinq piliers de l'Islam.",
      },
      {
        question: "Que fait-on durant les heures de jeûne ?",
        options: [
          "On s'abstient de nourriture, boisson et rapports intimes",
          "On prie uniquement",
          "On jeûne seulement la nuit",
          "On s'abstient uniquement de viande",
        ],
        correctIndex: 0,
        explanation: "Le jeûne consiste à s'abstenir de nourriture, de boisson et de rapports intimes de l'aube au coucher du soleil.",
      },
    ],
    2: [
      {
        question: "Manger par oubli durant le jeûne rompt-il celui-ci ?",
        options: ["Oui, systématiquement", "Non, selon la majorité des écoles", "Seulement le vendredi", "Seulement pour les voyageurs"],
        correctIndex: 1,
        explanation: "Un oubli n'annule pas le jeûne selon la majorité des écoles, considéré comme une provision accordée par Dieu.",
      },
      {
        question: "Quelle école considère que la ventouse (hijama) annule le jeûne ?",
        options: ["Hanafite", "Malikite", "Shafi'ite", "Hanbalite"],
        correctIndex: 3,
        explanation: "L'école hanbalite retient que la ventouse annule le jeûne, à la différence des trois autres écoles.",
      },
    ],
    3: [
      {
        question: "Avant quelle échéance un jour de jeûne manqué doit-il être rattrapé ?",
        options: ["Avant la fin de la semaine", "Avant le Ramadan suivant", "Avant un mois", "Il n'y a pas de délai"],
        correctIndex: 1,
        explanation: "Le rattrapage (qada) doit être effectué avant l'arrivée du Ramadan suivant.",
      },
      {
        question: "Que se passe-t-il en cas de retard injustifié du rattrapage selon trois des quatre écoles ?",
        options: [
          "Rien de plus n'est requis",
          "Un fidya s'ajoute au qada",
          "Le jeûne devient invalide définitivement",
          "Il faut jeûner deux mois consécutifs",
        ],
        correctIndex: 1,
        explanation: "Malikites, shafi'ites et hanbalites ajoutent un fidya en cas de retard injustifié au-delà du Ramadan suivant ; les hanafites non.",
      },
    ],
    4: [
      {
        question: "Quel est le troisième pilier de l'Islam ?",
        options: ["La zakat", "Le sawm", "Le hajj", "La salah"],
        correctIndex: 0,
        explanation: "La zakat, l'aumône obligatoire, est le troisième des cinq piliers de l'Islam.",
      },
      {
        question: "Quel taux est généralement retenu pour la zakat sur l'or et l'argent ?",
        options: ["1 %", "2,5 %", "5 %", "10 %"],
        correctIndex: 1,
        explanation: "Le taux généralement retenu pour la zakat sur l'or et l'argent est de 2,5 % de la valeur au-delà du nisab.",
      },
    ],
    5: [
      {
        question: "Quand la zakat al-fitr doit-elle être versée ?",
        options: [
          "Avant la prière de l'Aïd al-Fitr",
          "N'importe quand dans l'année",
          "Uniquement le premier jour du Ramadan",
          "Après la prière de l'Aïd",
        ],
        correctIndex: 0,
        explanation: "La zakat al-fitr doit être versée avant la prière de l'Aïd al-Fitr, pour permettre aux nécessiteux de célébrer la fête.",
      },
      {
        question: "Quelle école autorise le versement de la zakat al-fitr en valeur monétaire ?",
        options: ["Hanafite", "Malikite", "Shafi'ite", "Hanbalite"],
        correctIndex: 0,
        explanation: "L'école hanafite autorise le versement en valeur monétaire équivalente ; les trois autres exigent un versement en nature.",
      },
    ],
    6: [
      {
        question: "En quoi la sadaqah diffère-t-elle de la zakat ?",
        options: [
          "Elle est volontaire, sans montant ni fréquence fixés",
          "Elle est plus importante que la zakat",
          "Elle remplacé la zakat",
          "Elle n'existe que pendant le Ramadan",
        ],
        correctIndex: 0,
        explanation: "La sadaqah est une aumône volontaire, sans montant ni fréquence fixés, contrairement à la zakat qui est une obligation calculée.",
      },
      {
        question: "Selon la tradition prophétique, qu'est-ce qui peut aussi constituer une sadaqah ?",
        options: ["Uniquement un don d'argent", "Un sourire ou une parole bienveillante", "Uniquement la nourriture", "Rien d'autre que l'or"],
        correctIndex: 1,
        explanation: "Un hadith rapporte qu'un sourire, une parole bienveillante ou le fait d'écarter un obstacle du chemin constituent une forme de sadaqah.",
      },
    ],
  },
  intermediaire: {
    1: [
      {
        question: "Quelle approche du tafsir explique le Coran par le Coran, la Sunna et les propos des Compagnons ?",
        options: ["Le tafsir bi'r-ra'y", "Le tafsir bi'l-ma'thur", "Le tafsir linguistique", "Le tafsir moderne"],
        correctIndex: 1,
        explanation: "Le tafsir bi'l-ma'thur (\"par la transmission\") explique le Coran par le Coran, la Sunna et les propos des Compagnons.",
      },
      {
        question: "Les grands tafsirs classiques combinent-ils généralement les deux approches ?",
        options: [
          "Non, elles sont strictement incompatibles",
          "Oui, la plupart des grands tafsirs combinent les deux",
          "Seuls les tafsirs modernes le font",
          "Cela dépend uniquement de la langue",
        ],
        correctIndex: 1,
        explanation: "La plupart des grands tafsirs combinent transmission et raisonnement, en s'appuyant d'abord sur la transmission disponible.",
      },
    ],
    2: [
      {
        question: "Combien de versets comprend Al-Baqara, la plus longue sourate du Coran ?",
        options: ["114", "200", "286", "300"],
        correctIndex: 2,
        explanation: "Al-Baqara comprend 286 versets, ce qui en fait la plus longue sourate du Coran.",
      },
      {
        question: "Quelle catégorie est introduite dès les premiers versets d'Al-Baqara (2:6-20) ?",
        options: ["Les prophètes", "Les hypocrites (munafiqun)", "Les anges", "Les savants"],
        correctIndex: 1,
        explanation: "Les versets 6 à 20 introduisent la catégorie des hypocrites (munafiqun).",
      },
    ],
    3: [
      {
        question: "Qui a fondé l'école hanafite ?",
        options: ["Malik ibn Anas", "Abu Hanifa", "Ash-Shafi'i", "Ahmad ibn Hanbal"],
        correctIndex: 1,
        explanation: "L'école hanafite a été fondée par l'imam Abu Hanifa à Kufa.",
      },
      {
        question: "Quel outil méthodologique l'école hanafite utilisé-t-elle fréquemment ?",
        options: [
          "L'istihsan (préférence juridique)",
          "La pratique des habitants de Médine uniquement",
          "Le rejet total du qiyas",
          "L'interdiction de tout raisonnement",
        ],
        correctIndex: 0,
        explanation: "L'école hanafite se caractérise par un usage fréquent du qiyas et de l'istihsan.",
      },
    ],
    4: [
      {
        question: "Que dit la sourate Al-Ma'ida (5:8) sur la haine envers un peuple ?",
        options: [
          "Elle justifie l'injustice envers ce peuple",
          "Elle ne doit jamais conduire à l'injustice envers lui",
          "Elle doit être ignorée par les juges",
          "Elle n'est pas mentionnée dans le Coran",
        ],
        correctIndex: 1,
        explanation: "Le Coran (5:8) enjoint de ne pas laisser la haine envers un peuple empêcher d'être équitable envers lui.",
      },
      {
        question: "Comment l'adl est-elle présentée dans cette leçon ?",
        options: [
          "Une vertu abstraite sans application concrète",
          "Une discipline concrète, exigeante face à un adversaire",
          "Une règle réservée aux juges uniquement",
          "Une notion secondaire du fiqh",
        ],
        correctIndex: 1,
        explanation: "L'adl est présentée comme une discipline concrète à maintenir précisément quand l'intérêt personnel pousserait à y déroger.",
      },
    ],
    5: [
      {
        question: "Quel tafsir classique est particulièrement estimé pour son usage systématique du Coran et de la Sunna ?",
        options: ["At-Tafsir al-Muyassar", "Le tafsir d'Ibn Kathir", "Al-Mukhtasar fi at-Tafsir", "Aucun de ces tafsirs"],
        correctIndex: 1,
        explanation: "Le tafsir d'Ibn Kathir est particulièrement estimé pour son usage systématique du Coran et de la Sunna.",
      },
      {
        question: "Que caractérise les tafsirs modernes comme Al-Muyassar ?",
        options: [
          "Une extrême longueur",
          "Leur concision et leur traduction en plusieurs langues",
          "L'absence de référence au Coran",
          "Leur réserve aux seuls spécialistes",
        ],
        correctIndex: 1,
        explanation: "Des tafsirs modernes et concis comme Al-Muyassar sont traduits en plusieurs langues, facilitant l'étude comparée.",
      },
    ],
    6: [
      {
        question: "Quel est l'ouvrage majeur de l'imam Malik ibn Anas ?",
        options: ["Ar-Risala", "Le Muwatta", "Le Musnad", "As-Sahih"],
        correctIndex: 1,
        explanation: "Le Muwatta est l'ouvrage majeur de l'imam Malik, l'un des plus anciens recueils de hadiths et de droit.",
      },
      {
        question: "À quelle pratique l'école malikite accorde-t-elle une importance particulière ?",
        options: [
          "La pratique vivante des habitants de Médine",
          "La coutume ottomane",
          "Les écrits persans",
          "La jurisprudence égyptienne moderne",
        ],
        correctIndex: 0,
        explanation: "L'école malikite accorde une importance particulière à la pratique vivante des habitants de Médine ('amal ahl al-Madina).",
      },
    ],
    7: [
      {
        question: "Quelle est la différence entre charia et fiqh selon cette leçon ?",
        options: [
          "Il n'y a aucune différence",
          "Le fiqh est l'élaboration humaine et faillible des principes de la charia",
          "La charia est humaine, le fiqh est divin",
          "Le fiqh précède toujours la charia",
        ],
        correctIndex: 1,
        explanation: "Le fiqh est l'élaboration humaine, faillible, des principes divins considérés immuables (charia).",
      },
      {
        question: "Quels sont les deux grands domaines couverts par le fiqh ?",
        options: [
          "La théologie et l'histoire",
          "Le culte (ibadat) et les relations sociales (mu'amalat)",
          "La politique et l'économie uniquement",
          "Le Coran et le hadith",
        ],
        correctIndex: 1,
        explanation: "Le fiqh couvre le culte (ibadat) et les relations sociales (mu'amalat).",
      },
    ],
    8: [
      {
        question: "Quel ouvrage d'Ash-Shafi'i a systématisé la méthodologie juridique islamique ?",
        options: ["Ar-Risala", "Le Muwatta", "Le Musnad", "Sahih al-Bukhari"],
        correctIndex: 0,
        explanation: "Ash-Shafi'i, avec Ar-Risala, a proposé la première systématisation rigoureuse de l'usul al-fiqh.",
      },
      {
        question: "Quelle hiérarchie des sources l'approche shafi'ite appliqué-t-elle ?",
        options: [
          "Coutume, puis Coran",
          "Coran, Sunna, consensus (ijma'), puis qiyas",
          "Uniquement le Coran",
          "Qiyas en premier, puis Coran",
        ],
        correctIndex: 1,
        explanation: "L'approche shafi'ite appliqué une hiérarchisation stricte : Coran, Sunna, ijma', puis qiyas.",
      },
    ],
    9: [
      {
        question: "Que compare le verset 12 d'Al-Hujurat à la médisance (ghiba) ?",
        options: ["Voler un bien d'autrui", "Manger la chair de son frère mort", "Mentir à un étranger", "Briser une promesse"],
        correctIndex: 1,
        explanation: "Le verset 12 compare la médisance au fait de \"manger la chair de son frère mort\".",
      },
      {
        question: "Selon le verset 13, quel est le seul critère de supériorité auprès de Dieu ?",
        options: ["La richesse", "L'origine ethnique", "La piété (taqwa)", "Le statut social"],
        correctIndex: 2,
        explanation: "Le verset 13 affirme que seule la piété (taqwa) distingue les êtres humains auprès de Dieu, non l'origine ou le statut.",
      },
    ],
    10: [
      {
        question: "Pour quel épisode historique l'imam Ahmad ibn Hanbal est-il célèbre, outre le Musnad ?",
        options: [
          "La conquête de l'Andalousie",
          "L'épisode de la mihna sur la nature du Coran",
          "La rédaction du Muwatta",
          "La fondation de Bagdad",
        ],
        correctIndex: 1,
        explanation: "Ahmad ibn Hanbal a résisté, au prix d'emprisonnements, à la pression du pouvoir abbasside durant la mihna.",
      },
      {
        question: "À quel courant théologique l'école hanbalite est-elle historiquement associée ?",
        options: ["Le mu'tazilisme", "L'atharisme", "Le maturidisme", "Le chiisme"],
        correctIndex: 1,
        explanation: "L'école hanbalite est historiquement associée au courant théologique atharite.",
      },
    ],
    11: [
      {
        question: "Comment le hadith rapporté par Muslim définit-il le kibr ?",
        options: [
          "Le rejet de la vérité et le mépris des gens",
          "La richesse excessive",
          "Le refus de prier",
          "L'absence de savoir",
        ],
        correctIndex: 0,
        explanation: "Muslim rapporte que le kibr est \"le rejet de la vérité et le mépris des gens\".",
      },
      {
        question: "Quel comportement du Prophète ﷺ illustré le tawadu' selon cette leçon ?",
        options: [
          "Il exigeait une place réservée parmi ses compagnons",
          "Il réparait lui-même ses vêtements et trayait ses chèvres",
          "Il refusait de parler aux étrangers",
          "Il vivait dans un palais séparé",
        ],
        correctIndex: 1,
        explanation: "Le Prophète ﷺ refusait tout traitement d'exception : il réparait ses vêtements et trayait ses chèvres lui-même.",
      },
    ],
    12: [
      {
        question: "Quels sont les quatre califes du califat rashidun ?",
        options: ["Les Omeyyades", "Abu Bakr, Omar, Uthman et Ali", "Les Abbassides", "Les Fatimides"],
        correctIndex: 1,
        explanation: "Le califat rashidun regroupe les quatre califes bien-guidés : Abu Bakr, Omar, Uthman et Ali.",
      },
      {
        question: "Quelle était la capitale du califat abbasside ?",
        options: ["Damas", "Bagdad", "Le Caire", "Cordoue"],
        correctIndex: 1,
        explanation: "Le califat abbasside (750-1258) avait Bagdad pour capitale.",
      },
    ],
    13: [
      {
        question: "Quels courants théologiques sont majoritaires dans le sunnisme classique ?",
        options: [
          "Le mu'tazilisme et l'atharisme",
          "L'ash'arisme et le maturidisme",
          "Le chiisme et le kharijisme",
          "Le soufisme et le salafisme",
        ],
        correctIndex: 1,
        explanation: "L'ash'arisme et le maturidisme sont les deux courants théologiques majoritaires du sunnisme classique.",
      },
      {
        question: "À quelle école juridique le maturidisme est-il historiquement associé ?",
        options: ["L'école hanafite", "L'école malikite", "L'école shafi'ite", "L'école hanbalite"],
        correctIndex: 0,
        explanation: "Le maturidisme est historiquement associé à l'école hanafite.",
      },
    ],
    14: [
      {
        question: "Quel courant est considéré comme le plus rationaliste de la théologie islamique classique ?",
        options: ["L'atharisme", "Le mu'tazilisme", "L'ash'arisme", "Le maturidisme"],
        correctIndex: 1,
        explanation: "Le mu'tazilisme représente le courant le plus rationaliste de la théologie islamique classique.",
      },
      {
        question: "Que privilégie l'atharisme concernant les attributs divins ?",
        options: [
          "L'interprétation allégorique systématique",
          "L'affirmation directe des textes, sans en déterminer la modalité",
          "Le rejet total des textes scripturaires",
          "Le recours exclusif au raisonnement rationnel",
        ],
        correctIndex: 1,
        explanation: "L'atharisme privilégie l'affirmation directe des textes relatifs aux attributs divins, sans interprétation allégorique.",
      },
    ],
    15: [
      {
        question: "Sur quoi repose l'examen critique d'un hadith ?",
        options: [
          "Uniquement sur le contenu (matn)",
          "La chaîne de transmission (isnad) et le contenu (matn)",
          "Uniquement sur la popularité du hadith",
          "L'ancienneté du manuscrit",
        ],
        correctIndex: 1,
        explanation: "L'étude critique du hadith repose sur l'examen conjoint de l'isnad et du matn.",
      },
      {
        question: "Quels sont les quatre degrés de classification d'un hadith ?",
        options: [
          "Vrai, faux, douteux, certain",
          "Sahih, hasan, da'if, mawdu'",
          "Ancien, moderne, mixte, incertain",
          "Fort, moyen, faible, nul",
        ],
        correctIndex: 1,
        explanation: "Les hadiths sont classés en quatre degrés : sahih (authentique), hasan (bon), da'if (faible), mawdu' (fabriqué).",
      },
    ],
  },
  avance: {
    1: [
      {
        question: "Quelles sont les quatre sources reconnues par l'ensemble des écoles sunnites ?",
        options: ["Coran, Sunna, ijma', qiyas", "Coran, coutume, opinion, tradition", "Sunna, ijma', istihsan, maslaha", "Le Coran uniquement"],
        correctIndex: 0,
        explanation: "Les quatre sources reconnues sont le Coran, la Sunna, l'ijma' (consensus) et le qiyas (analogie).",
      },
      {
        question: "Qui est considéré comme le premier à avoir systématisé la hiérarchie de ces sources ?",
        options: ["Abu Hanifa", "Ash-Shafi'i", "Ahmad ibn Hanbal", "Malik ibn Anas"],
        correctIndex: 1,
        explanation: "Ash-Shafi'i, dans Ar-Risala, est considéré comme le premier à avoir systématisé cette hiérarchie.",
      },
    ],
    2: [
      {
        question: "Combien de versets comprend la sourate Ya-Sin ?",
        options: ["36", "50", "83", "114"],
        correctIndex: 2,
        explanation: "Ya-Sin est une sourate mecquoise de quatre-vingt-trois versets.",
      },
      {
        question: "Quel argument Ya-Sin utilisé-t-elle pour défendre la résurrection ?",
        options: [
          "L'analogie avec la terre revivifiée par la pluie",
          "Un témoignage historique",
          "Un miracle visible du Prophète ﷺ",
          "Aucun argument, seulement une affirmation",
        ],
        correctIndex: 0,
        explanation: "Ya-Sin compare la capacité de Dieu à faire revivre une terre morte par la pluie à Sa capacité à ressusciter les morts.",
      },
    ],
    3: [
      {
        question: "Quel outil méthodologique secondaire est particulièrement utilisé par l'école hanafite ?",
        options: ["La maslaha", "L'istihsan", "La pratique médinoise", "Le sadd adh-dhara'i uniquement"],
        correctIndex: 1,
        explanation: "L'istihsan (\"préférence juridique\") est particulièrement utilisé par l'école hanafite.",
      },
      {
        question: "Que désigne la maslaha ?",
        options: [
          "Un type de hadith faible",
          "L'intérêt général, mobilisé notamment par l'école malikite",
          "Une catégorie de péché",
          "Un rite du hajj",
        ],
        correctIndex: 1,
        explanation: "La maslaha (\"intérêt général\") permet de fonder une règle sur la protection d'un intérêt essentiel.",
      },
    ],
    4: [
      {
        question: "Que désignent les asbab al-nuzul ?",
        options: [
          "Les circonstances historiques de la révélation d'un verset",
          "La classification des hadiths",
          "Les écoles juridiques",
          "Les rites du hajj",
        ],
        correctIndex: 0,
        explanation: "Les asbab al-nuzul étudient le contexte historique précis dans lequel un verset a été révélé.",
      },
      {
        question: "Comment le naskh est-il traité par les commentateurs classiques ?",
        options: [
          "Avec beaucoup de prudence méthodologique",
          "Comme une question sans importance",
          "Comme automatiquement applicable à tout verset",
          "Uniquement par les savants modernes",
        ],
        correctIndex: 0,
        explanation: "Le naskh (abrogation) est traité avec beaucoup de prudence méthodologique par les commentateurs classiques.",
      },
    ],
    5: [
      {
        question: "Que décrit le hadith rapporté par Muslim sur les trois catégories de personnes jugées en premier ?",
        options: [
          "Des actes rejetés malgré leur ampleur, car accomplis pour être vus",
          "Des actes toujours acceptés quelle que soit l'intention",
          "Des personnes exemptées de jugement",
          "Des anges chargés du jugement",
        ],
        correctIndex: 0,
        explanation: "Ce hadith décrit des actes en apparence exemplaires rejetés parce qu'accomplis pour être vus et loués des hommes.",
      },
      {
        question: "Comment certains savants qualifient-ils la riya ?",
        options: ["Une simple maladresse sans conséquence", "Un \"shirk mineur\"", "Une obligation religieuse", "Une vertu recommandée"],
        correctIndex: 1,
        explanation: "La riya est parfois qualifiée de \"shirk mineur\" en raison du risque qu'elle fait courir à l'exclusivité de l'intention due à Dieu.",
      },
    ],
    6: [
      {
        question: "Sur quoi se concentrent généralement les sourates mecquoises ?",
        options: [
          "La législation et l'organisation sociale",
          "Le tawhid, le Jugement dernier et les récits prophétiques",
          "Les contrats commerciaux",
          "Le droit pénal",
        ],
        correctIndex: 1,
        explanation: "Les sourates mecquoises se concentrent davantage sur le tawhid, le Jugement dernier et les récits prophétiques.",
      },
      {
        question: "Que désigne l'i'jaz al-Qur'an ?",
        options: [
          "L'inimitabilité littéraire du Coran",
          "La classification des hadiths",
          "Le droit de la famille",
          "L'histoire des califes",
        ],
        correctIndex: 0,
        explanation: "L'i'jaz al-Qur'an désigne l'étude de la dimension littéraire et structurelle du Coran, argument de son origine divine.",
      },
    ],
    7: [
      {
        question: "Qu'est-ce qui distingue un hadith mutawatir d'un hadith ahad ?",
        options: [
          "Le mutawatir est rapporté par un très grand nombre de personnes, rendant sa fiabilité certaine",
          "L'ahad est toujours plus fiable",
          "Il n'y a aucune différence pratique",
          "Le mutawatir concerne uniquement le Coran",
        ],
        correctIndex: 0,
        explanation: "Le mutawatir bénéficie d'une certitude automatique du fait du grand nombre de ses transmetteurs, contrairement à l'ahad.",
      },
      {
        question: "Quelle proportion des hadiths juridiques relève de la catégorie ahad ?",
        options: ["Une minorité négligeable", "La très grande majorité", "Exactement la moitié", "Aucun hadith juridique"],
        correctIndex: 1,
        explanation: "La très grande majorité des hadiths juridiques relève de la catégorie ahad.",
      },
    ],
    8: [
      {
        question: "Qu'est-ce qu'un hadith \"da'if\" ?",
        options: [
          "Un hadith fabriqué de toutes pièces",
          "Un hadith présentant une faiblesse dans sa chaîne de transmission",
          "Un hadith uniquement rapporté par Al-Bukhari",
          "Un hadith contredisant le Coran",
        ],
        correctIndex: 1,
        explanation: "Un hadith da'if présente une faiblesse dans sa chaîne, le rendant impropre à fonder seul une règle juridique.",
      },
      {
        question: "Un même hadith peut-il recevoir des appréciations différentes selon les savants ?",
        options: [
          "Non, jamais",
          "Oui, selon l'évaluation indépendante de chaque vérificateur",
          "Uniquement pour les hadiths mutawatir",
          "Uniquement en cas d'erreur de copie",
        ],
        correctIndex: 1,
        explanation: "Un même hadith peut recevoir des appréciations différentes selon les vérificateurs, chacun évaluant indépendamment la chaîne.",
      },
    ],
    9: [
      {
        question: "Quel courant constitue l'expression la plus rationaliste du kalam ?",
        options: ["L'atharisme", "Le mu'tazilisme", "Le hanbalisme", "Le malikisme"],
        correctIndex: 1,
        explanation: "Le mu'tazilisme constitue l'expression la plus rationaliste du kalam.",
      },
      {
        question: "Que cherchent l'ash'arisme et le maturidisme ?",
        options: [
          "Un rejet total de la raison",
          "Un équilibre entre argumentation rationnelle et fidélité aux textes",
          "Une fusion avec le mu'tazilisme",
          "L'abandon du Coran comme source",
        ],
        correctIndex: 1,
        explanation: "L'ash'arisme et le maturidisme cherchent un équilibre entre argumentation rationnelle et fidélité aux textes.",
      },
    ],
    10: [
      {
        question: "D'où proviennent généralement les divergences entre écoles selon cette leçon ?",
        options: [
          "De désaccords sur les fondements de la foi",
          "De méthodologies d'interprétation différentes appliquées à des sources partagées",
          "De textes fondamentalement différents",
          "De rivalités politiques uniquement",
        ],
        correctIndex: 1,
        explanation: "Une divergence entre écoles est généralement le résultat de méthodologies différentes, non un désaccord sur les fondements de la foi.",
      },
      {
        question: "Quel exemple concret illustré cette divergence méthodologique dans la leçon ?",
        options: [
          "Le nombre de sourates du Coran",
          "La position des mains pendant la prière",
          "Le nombre de piliers de l'Islam",
          "La date du Ramadan",
        ],
        correctIndex: 1,
        explanation: "L'exemple de la position des mains pendant la prière illustré l'impact des hadiths et des pratiques régionales sur la divergence.",
      },
    ],
    11: [
      {
        question: "Quel est l'objectif du comparateur de fiqh de la plateforme ?",
        options: [
          "Désigner une école comme supérieure aux autres",
          "Rendre visible, de manière neutre et sourcée, une pluralité légitime",
          "Remplacer les savants classiques",
          "Simplifier le fiqh en une seule position",
        ],
        correctIndex: 1,
        explanation: "Le comparateur visé à rendre visible une pluralité légitime, sans désigner une position comme supérieure.",
      },
      {
        question: "Comment le comparateur est-il organisé ?",
        options: [
          "Par ordre alphabétique des savants",
          "Par sujet, avec les positions des quatre écoles sourcées",
          "Par siècle historique",
          "Uniquement par école, sans sujet",
        ],
        correctIndex: 1,
        explanation: "Le comparateur est organisé par sujet, avec les positions des quatre écoles sunnites présentées côte à côte.",
      },
    ],
  },
  sira: {
    1: [
      {
        question: "Quel surnom était donné à Muhammad ﷺ avant même le début de sa mission prophétique ?",
        options: ["Al-Amin (le digne de confiance)", "Al-Mustafa (l'élu)", "Al-Fatih (le conquérant)", "Al-Ghazali"],
        correctIndex: 0,
        explanation: "Il était surnommé \"Al-Amin\" à La Mecque en raison de sa réputation d'honnêteté et de fiabilité reconnue de tous.",
      },
      {
        question: "Combien de temps a duré le mariage du Prophète ﷺ avec Khadija ?",
        options: ["Cinq ans", "Dix ans", "Vingt-cinq ans", "Quarante ans"],
        correctIndex: 2,
        explanation: "Leur union, monogame, a duré vingt-cinq ans, jusqu'à la mort de Khadija.",
      },
    ],
    2: [
      {
        question: "Où la première révélation a-t-elle eu lieu, selon la tradition ?",
        options: ["Dans la grotte de Hira", "Dans la Kaaba", "À Médine", "Dans la grotte de Thawr"],
        correctIndex: 0,
        explanation: "La révélation débute dans la grotte de Hira, sur le mont An-Nour près de La Mecque, vers l'an 610.",
      },
      {
        question: "Qui est traditionnellement considérée comme la première personne à avoir cru au message du Prophète ﷺ ?",
        options: ["Khadija", "Abu Bakr", "Ali", "Omar"],
        correctIndex: 0,
        explanation: "Khadija, son épouse, est unanimement présentée comme la toute première croyante.",
      },
    ],
    3: [
      {
        question: "Que provoqué l'appel public au tawhid auprès des chefs de Quraych ?",
        options: [
          "Une adhésion rapide et générale",
          "Une indifférence totale",
          "Une opposition croissante et des persécutions",
          "Une invitation à négocier immédiatement",
        ],
        correctIndex: 2,
        explanation: "L'appel public remet en cause l'ordre religieux et économique mecquois, provoquant moqueries, boycott et persécutions.",
      },
      {
        question: "Vers quel royaume une partie des premiers musulmans émigre-t-elle pour fuir les persécutions ?",
        options: ["L'Abyssinie", "La Perse", "L'Égypte", "Byzance"],
        correctIndex: 0,
        explanation: "Ils émigrent vers le royaume chrétien d'Aksoum, en Abyssinie, dont le souverain est réputé juste.",
      },
    ],
    4: [
      {
        question: "Quels deux soutiens proches le Prophète ﷺ perd-il durant l'\"Année de la Tristesse\" ?",
        options: [
          "Khadija et Abu Talib",
          "Abu Bakr et Omar",
          "Ali et Hamza",
          "Aisha et Fatima",
        ],
        correctIndex: 0,
        explanation: "Il perd son épouse Khadija et son oncle protecteur Abu Talib en l'espace de quelques mois, vers 619.",
      },
      {
        question: "Qu'est-ce qui est institué lors du voyage nocturne et de l'ascension (Isra wal Mi'raj) ?",
        options: ["Les cinq prières quotidiennes", "Le jeûne du Ramadan", "La zakat", "Le hajj"],
        correctIndex: 0,
        explanation: "C'est lors de cet événement que les cinq prières quotidiennes sont instituées, selon la tradition.",
      },
    ],
    5: [
      {
        question: "Que sont les \"serments d'Aqaba\" ?",
        options: [
          "Des engagements d'accueil conclus avec des habitants de Yathrib",
          "Un traité de paix avec les Byzantins",
          "Le nom d'une bataille",
          "Un pèlerinage annuel",
        ],
        correctIndex: 0,
        explanation: "Ce sont deux engagements successifs par lesquels des habitants de Yathrib s'engagent à accueillir et protéger le Prophète ﷺ.",
      },
      {
        question: "Quelle année marque le point de départ du calendrier musulman ?",
        options: ["610 (début de la révélation)", "622 (l'Hégire)", "630 (conquête de La Mecque)", "632 (décès du Prophète ﷺ)"],
        correctIndex: 1,
        explanation: "L'Hégire, l'émigration vers Médine en 622, marque le point de départ du calendrier hégirien.",
      },
    ],
    6: [
      {
        question: "Pourquoi la bataille d'Uhud bascule-t-elle en défaveur des musulmans ?",
        options: [
          "Un groupe d'archers quitte sa position pour le butin",
          "Le Prophète ﷺ est absent",
          "Les musulmans manquent d'armes",
          "Une tempête de sable les surprend",
        ],
        correctIndex: 0,
        explanation: "Des archers quittent leur position stratégique pour participer au butin, permettant à la cavalerie mecquoise de prendre les musulmans à revers.",
      },
      {
        question: "Quelle tactique permet aux musulmans de mettre en échec le siège de Médine (bataille du Fossé) ?",
        options: [
          "Le creusement d'un fossé défensif",
          "Une attaque surprise nocturne",
          "Un traité signé avant le siège",
          "L'intervention d'une tribu alliée",
        ],
        correctIndex: 0,
        explanation: "Sur suggestion de Salman al-Farisi, les musulmans creusent un fossé qui rend l'assaut de la cavalerie ennemie inefficace.",
      },
    ],
    7: [
      {
        question: "Comment le traité de Hudaybiyya est-il qualifié dans le Coran, malgré son apparence désavantageuse ?",
        options: ["Une victoire manifeste", "Une défaite honorable", "Un simple accord commercial", "Une trêve sans importance"],
        correctIndex: 0,
        explanation: "Le Coran (sourate Al-Fath) le qualifie de \"victoire manifeste\", ayant permis une large diffusion pacifique de l'Islam.",
      },
      {
        question: "Comment se déroule la conquête de La Mecque en 630 ?",
        options: [
          "Avec très peu de résistance et une amnistie générale",
          "Après un long siège sanglant",
          "Grâce à une intervention étrangère",
          "Elle n'a jamais eu lieu du vivant du Prophète ﷺ",
        ],
        correctIndex: 0,
        explanation: "La ville se rend avec peu de résistance et le Prophète ﷺ accorde une amnistie générale, y compris à d'anciens persécuteurs.",
      },
    ],
    8: [
      {
        question: "Que rappelle le Sermon d'Adieu, prononcé lors du Pèlerinage d'Adieu ?",
        options: [
          "L'égalité entre croyants et l'interdiction de l'usure",
          "Les règles du commerce international",
          "La liste des califes à venir",
          "Le calendrier des futures conquêtes",
        ],
        correctIndex: 0,
        explanation: "Il rappelle notamment l'égalité entre croyants, l'interdiction de l'usure et de la vengeance tribale, et les droits réciproques entre époux.",
      },
      {
        question: "Qui est désigné comme premier calife après le décès du Prophète ﷺ ?",
        options: ["Abu Bakr", "Omar", "Uthman", "Ali"],
        correctIndex: 0,
        explanation: "Abu Bakr as-Siddiq est désigné premier calife, ouvrant la période rashidun.",
      },
    ],
  },
};

const FINAL_QUIZZES: Record<string, QuestionSeed[]> = {
  introduction: [
    {
      question: "Quel est le premier des cinq piliers de l'Islam ?",
      options: ["La shahada", "La salah", "La zakat", "Le hajj"],
      correctIndex: 0,
      explanation: "La shahada, l'attestation de foi, est le premier des cinq piliers et la porte d'entrée dans l'Islam.",
    },
    {
      question: "Quelle sourate est récitée dans chaque rak'a de la prière ?",
      options: ["Al-Ikhlas", "Al-Fatiha", "Al-Asr", "Al-Baqara"],
      correctIndex: 1,
      explanation: "Al-Fatiha est récitée intégralement dans chacun des rak'at de la prière rituelle.",
    },
    {
      question: "En quelle année a eu lieu l'Hégire ?",
      options: ["570", "610", "622", "632"],
      correctIndex: 2,
      explanation: "L'Hégire, émigration du Prophète ﷺ vers Médine, a eu lieu en 622.",
    },
    {
      question: "Quel surnom Muhammad ﷺ portait-il avant sa mission prophétique, en raison de sa véracité ?",
      options: ["Al-Amin", "Al-Mustafa", "Al-Karim", "As-Sadiq"],
      correctIndex: 0,
      explanation: "Il était surnommé \"Al-Amin\" (le digne de confiance) bien avant la révélation.",
    },
    {
      question: "Combien de recueils de hadiths sont considérés comme canoniques chez les sunnites ?",
      options: ["Quatre", "Six", "Huit", "Dix"],
      correctIndex: 1,
      explanation: "Les Kutub as-Sittah regroupent six recueils canoniques.",
    },
    {
      question: "Quel événement à Ta'if illustré la patience (sabr) du Prophète ﷺ ?",
      options: [
        "Il y fut accueilli en héros",
        "Il y fut rejeté et lapidé, mais refusa la destruction de la ville",
        "Il y reçut la première révélation",
        "Il y signa un traité de paix",
      ],
      correctIndex: 1,
      explanation: "Rejeté et lapidé à Ta'if, il refusa que la ville soit détruite, espérant que sa descendance croirait un jour.",
    },
  ],
  "pratique-de-la-priere": [
    {
      question: "Quelles sont les conditions préalables à la prière ?",
      options: [
        "Pureté rituelle, orientation vers la qibla, temps entré, awra couverte, intention",
        "Avoir jeûné le jour même",
        "Être dans une mosquée",
        "Avoir mémorisé le Coran entier",
      ],
      correctIndex: 0,
      explanation: "Cinq conditions doivent être réunies avant de commencer la prière, dont la pureté rituelle et l'orientation vers la qibla.",
    },
    {
      question: "Dans quel ordre se déroule le wudu ?",
      options: [
        "Mains, bouche/nez, visage, avant-bras, tête/oreilles, pieds",
        "Pieds, mains, tête, visage",
        "Visage puis mains uniquement",
        "Tête, pieds, mains, visage",
      ],
      correctIndex: 0,
      explanation: "Le wudu suit un ordre précis, des mains jusqu'aux pieds en passant par le visage et la tête.",
    },
    {
      question: "Quelle est la séquence de base d'une rak'a ?",
      options: [
        "Station debout, inclinaison, deux prosternations",
        "Deux prosternations puis inclinaison",
        "Position assise uniquement",
        "Inclinaison répétée quatre fois",
      ],
      correctIndex: 0,
      explanation: "Station debout (qiyam), inclinaison (ruku'), puis deux prosternations (sujud) forment la séquence de chaque rak'a.",
    },
    {
      question: "Quelle sourate est un pilier récité à chaque rak'a ?",
      options: ["Al-Ikhlas", "Al-Fatiha", "Al-Baqara", "Ya-Sin"],
      correctIndex: 1,
      explanation: "La Fatiha est récitée à chaque rak'a et considérée comme un pilier de la prière.",
    },
    {
      question: "Comment se conclut la prière ?",
      options: [
        "Par le taslim, en tournant la tête à droite puis à gauche",
        "Par une prosternation supplémentaire obligatoire",
        "En restant debout en silence",
        "Par la récitation d'Ayat al-Kursi uniquement",
      ],
      correctIndex: 0,
      explanation: "Le taslim, salutation en tournant la tête à droite puis à gauche, conclut formellement la prière.",
    },
    {
      question: "Quel est le statut des invocations du quotidien comme celle avant de manger ?",
      options: ["Obligatoires (fard)", "Recommandées (sunna)", "Interdites hors Ramadan", "Réservées aux voyageurs"],
      correctIndex: 1,
      explanation: "Les invocations du quotidien relèvent de la sunna, la pratique recommandée, sans être une obligation.",
    },
  ],
  "jeune-et-aumone": [
    {
      question: "Que fait-on durant les heures de jeûne du Ramadan ?",
      options: [
        "On s'abstient de nourriture, boisson et rapports intimes de l'aube au coucher du soleil",
        "On s'abstient uniquement de viande",
        "On jeûne uniquement la nuit",
        "On prie sans interruption",
      ],
      correctIndex: 0,
      explanation: "Le jeûne consiste à s'abstenir de nourriture, de boisson et de rapports intimes entre l'aube et le coucher du soleil.",
    },
    {
      question: "Quelle école considère que la ventouse (hijama) annule le jeûne ?",
      options: ["Hanafite", "Malikite", "Shafi'ite", "Hanbalite"],
      correctIndex: 3,
      explanation: "L'école hanbalite retient que la ventouse annule le jeûne, à la différence des trois autres écoles.",
    },
    {
      question: "Avant quelle échéance un jour de jeûne manqué doit-il être rattrapé (qada) ?",
      options: ["Avant la fin de la semaine", "Avant le Ramadan suivant", "Avant un mois", "Il n'y a pas de délai"],
      correctIndex: 1,
      explanation: "Le rattrapage doit être effectué avant l'arrivée du Ramadan suivant.",
    },
    {
      question: "Quel taux est généralement retenu pour la zakat sur l'or et l'argent ?",
      options: ["1 %", "2,5 %", "5 %", "10 %"],
      correctIndex: 1,
      explanation: "Le taux généralement retenu pour la zakat sur l'or et l'argent est de 2,5 % de la valeur au-delà du nisab.",
    },
    {
      question: "Quand la zakat al-fitr doit-elle être versée ?",
      options: ["Avant la prière de l'Aïd al-Fitr", "N'importe quand dans l'année", "Après la prière de l'Aïd", "Uniquement le dernier jour du Ramadan à minuit"],
      correctIndex: 0,
      explanation: "La zakat al-fitr doit être versée avant la prière de l'Aïd al-Fitr, pour permettre aux nécessiteux de célébrer la fête.",
    },
    {
      question: "En quoi la sadaqah diffère-t-elle de la zakat ?",
      options: [
        "Elle est volontaire, sans montant ni fréquence fixés",
        "Elle remplacé la zakat",
        "Elle n'existe que pendant le Ramadan",
        "Elle est réservée aux voyageurs",
      ],
      correctIndex: 0,
      explanation: "La sadaqah est une aumône volontaire, sans montant ni fréquence fixés, contrairement à la zakat qui est une obligation calculée.",
    },
  ],
  intermediaire: [
    {
      question: "Quel imam a fondé l'école hanafite ?",
      options: ["Abu Hanifa", "Malik ibn Anas", "Ash-Shafi'i", "Ahmad ibn Hanbal"],
      correctIndex: 0,
      explanation: "Abu Hanifa a fondé l'école hanafite à Kufa.",
    },
    {
      question: "Quelle sourate est parfois désignée comme la \"charte de l'éthique sociale\" du Coran ?",
      options: ["Al-Baqara", "Al-Hujurat", "Al-Fatiha", "Ya-Sin"],
      correctIndex: 1,
      explanation: "Al-Hujurat concentre des principes d'éthique sociale : moquerie, suspicion, médisance, diversité humaine.",
    },
    {
      question: "Quels sont les deux courants théologiques majoritaires du sunnisme classique ?",
      options: ["Mu'tazilisme et atharisme", "Ash'arisme et maturidisme", "Chiisme et kharijisme", "Soufisme et zahirisme"],
      correctIndex: 1,
      explanation: "L'ash'arisme et le maturidisme sont majoritaires dans le sunnisme classique.",
    },
    {
      question: "Quelle est la distinction entre charia et fiqh ?",
      options: [
        "Il n'y a aucune distinction",
        "Le fiqh est l'élaboration humaine et faillible des principes de la charia",
        "La charia est plus récente que le fiqh",
        "Le fiqh concerne uniquement le culte",
      ],
      correctIndex: 1,
      explanation: "Le fiqh est l'élaboration humaine, faillible, des principes divins considérés immuables (charia).",
    },
    {
      question: "Quel épisode a marqué le vécu de l'imam Ahmad ibn Hanbal ?",
      options: ["La conquête de l'Andalousie", "La mihna, concernant la nature du Coran", "La rédaction du Muwatta", "Le siège de Bagdad"],
      correctIndex: 1,
      explanation: "Il résista à la pression du pouvoir abbasside durant l'épisode de la mihna.",
    },
    {
      question: "Quels sont les quatre degrés de classification d'un hadith ?",
      options: ["Sahih, hasan, da'if, mawdu'", "Fort, moyen, faible, nul", "Ancien, récent, mixte, incertain", "Vrai, faux, discuté, certain"],
      correctIndex: 0,
      explanation: "Les hadiths sont classés en sahih, hasan, da'if et mawdu'.",
    },
  ],
  avance: [
    {
      question: "Quelles sont les quatre sources reconnues de l'usul al-fiqh ?",
      options: ["Coran, Sunna, ijma', qiyas", "Coran, coutume, opinion, tradition", "Sunna, istihsan, maslaha, urf", "Le Coran uniquement"],
      correctIndex: 0,
      explanation: "Les quatre sources classiques sont le Coran, la Sunna, l'ijma' et le qiyas.",
    },
    {
      question: "Quel argument la sourate Ya-Sin utilisé-t-elle pour la résurrection ?",
      options: ["Un miracle visible", "L'analogie avec la terre revivifiée par la pluie", "Un témoignage historique", "Aucun argument rationnel"],
      correctIndex: 1,
      explanation: "Ya-Sin compare la capacité de Dieu à revivifier la terre morte par la pluie à Sa capacité à ressusciter les morts.",
    },
    {
      question: "Qu'est-ce que la riya, parfois qualifiée de \"shirk mineur\" ?",
      options: ["L'oubli de la prière", "L'ostentation, agir pour être vu des hommes", "Le doute religieux", "La négligence du jeûne"],
      correctIndex: 1,
      explanation: "La riya désigne le fait d'accomplir un acte religieux pour être vu ou loué des hommes plutôt que pour Dieu.",
    },
    {
      question: "Quel courant théologique représente l'expression la plus rationaliste du kalam ?",
      options: ["L'atharisme", "Le mu'tazilisme", "Le hanbalisme", "Le zahirisme"],
      correctIndex: 1,
      explanation: "Le mu'tazilisme est le courant le plus rationaliste de la théologie islamique classique.",
    },
    {
      question: "Qu'est-ce qu'un hadith mutawatir ?",
      options: [
        "Un hadith faible",
        "Un hadith rapporté par un si grand nombre de personnes que sa fiabilité est certaine",
        "Un hadith fabriqué",
        "Un hadith uniquement présent dans le Coran",
      ],
      correctIndex: 1,
      explanation: "Un hadith mutawatir bénéficie d'une certitude automatique du fait du très grand nombre de ses transmetteurs.",
    },
    {
      question: "Quel est l'objectif du comparateur de positions de la plateforme ?",
      options: [
        "Désigner une école comme la seule valide",
        "Rendre visible une pluralité légitime, de manière neutre et sourcée",
        "Remplacer l'étude des sources originales",
        "Simplifier le fiqh à une seule règle universelle",
      ],
      correctIndex: 1,
      explanation: "Le comparateur rend visible, sans hiérarchie, une pluralité de positions légitimes documentées.",
    },
  ],
  sira: [
    {
      question: "Quel événement marque le début de la révélation coranique ?",
      options: [
        "L'apparition de l'ange Jibril dans la grotte de Hira",
        "L'Hégire vers Médine",
        "La conquête de La Mecque",
        "Le Pèlerinage d'Adieu",
      ],
      correctIndex: 0,
      explanation: "La révélation débute vers 610, dans la grotte de Hira, par l'ordre \"Iqra\" transmis par l'ange Jibril.",
    },
    {
      question: "Vers quel pays les premiers musulmans persécutés émigrent-ils ?",
      options: ["L'Abyssinie", "La Perse", "Byzance", "L'Égypte"],
      correctIndex: 0,
      explanation: "Ils émigrent vers le royaume chrétien d'Aksoum, en Abyssinie.",
    },
    {
      question: "Que institue le voyage nocturne et l'ascension (Isra wal Mi'raj) ?",
      options: ["Les cinq prières quotidiennes", "Le jeûne du Ramadan", "La zakat", "Le pèlerinage"],
      correctIndex: 0,
      explanation: "Les cinq prières quotidiennes sont instituées lors de cet événement.",
    },
    {
      question: "Quelle bataille de 624 est présentée dans le Coran comme un signe du soutien divin ?",
      options: ["Badr", "Uhud", "Le Fossé", "Hudaybiyya"],
      correctIndex: 0,
      explanation: "Badr, première grande victoire musulmane, est présentée dans le Coran (sourate Al-Anfal) comme un signe divin.",
    },
    {
      question: "Comment le Prophète ﷺ traite-t-il ses anciens persécuteurs lors de la conquête de La Mecque ?",
      options: ["Il leur accorde une amnistie générale", "Il les bannit", "Il exige une compensation financière", "Il les exécute"],
      correctIndex: 0,
      explanation: "Il accorde une amnistie générale, y compris à nombre de ses anciens persécuteurs, un épisode largement souligné dans la tradition.",
    },
    {
      question: "Qui succède au Prophète ﷺ à la tête de la communauté après sa mort en 632 ?",
      options: ["Abu Bakr, premier calife", "Ali, son cousin et gendre", "Omar", "Aucun successeur n'est désigné"],
      correctIndex: 0,
      explanation: "Abu Bakr as-Siddiq est désigné premier calife, ouvrant la période rashidun.",
    },
  ],
};

async function insertQuestions(
  db: Database,
  parent: { lessonId?: string; pathId?: string },
  questions: QuestionSeed[],
): Promise<number> {
  let count = 0;
  for (const [index, q] of questions.entries()) {
    const order = index + 1;

    const existing = await db.query.learningQuizQuestions.findFirst({
      where: (t, { and, eq: eqOp }) =>
        parent.lessonId
          ? and(eqOp(t.lessonId, parent.lessonId!), eqOp(t.order, order))
          : and(eqOp(t.pathId, parent.pathId!), eqOp(t.order, order)),
    });

    let questionId: string;
    if (existing) {
      await db
        .update(learningQuizQuestions)
        .set({ question: q.question, explanation: q.explanation })
        .where(eq(learningQuizQuestions.id, existing.id));
      questionId = existing.id;
      await db.delete(learningQuizOptions).where(eq(learningQuizOptions.questionId, questionId));
    } else {
      const [row] = await db
        .insert(learningQuizQuestions)
        .values({
          lessonId: parent.lessonId,
          pathId: parent.pathId,
          order,
          question: q.question,
          explanation: q.explanation,
        })
        .returning();
      questionId = row.id;
    }

    await db.insert(learningQuizOptions).values(
      q.options.map((text, optIndex) => ({
        questionId,
        text,
        isCorrect: optIndex === q.correctIndex,
        order: optIndex + 1,
      })),
    );
    count++;
  }
  return count;
}

export async function seedQuizzes(db: Database): Promise<void> {
  let questionCount = 0;

  for (const [pathSlug, lessonQuizzes] of Object.entries(LESSON_QUIZZES)) {
    const path = await db.query.learningPaths.findFirst({ where: eq(learningPaths.slug, pathSlug) });
    if (!path) continue;

    for (const [order, questions] of Object.entries(lessonQuizzes)) {
      const lesson = await db.query.learningLessons.findFirst({
        where: (t, { and, eq: eqOp }) => and(eqOp(t.pathId, path.id), eqOp(t.order, Number(order))),
      });
      if (!lesson) continue;
      questionCount += await insertQuestions(db, { lessonId: lesson.id }, questions);
    }
  }

  for (const [pathSlug, questions] of Object.entries(FINAL_QUIZZES)) {
    const path = await db.query.learningPaths.findFirst({ where: eq(learningPaths.slug, pathSlug) });
    if (!path) continue;
    questionCount += await insertQuestions(db, { pathId: path.id }, questions);
  }

  console.log(`Quiz: ${questionCount} questions seedees.`);
}
