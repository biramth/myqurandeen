import type { PathSeed } from "./learning-seed";

/**
 * Cours "Apprendre à lire l'arabe coranique" - parcours à part de
 * `learning-seed.ts` (contenu volumineux, nature différente : alphabétisation
 * plutôt que connaissance religieuse) mais fusionné dans le même tableau
 * `PATHS` avant seed, pour réutiliser exactement le même mécanisme d'upsert
 * (voir `seedLearning`).
 *
 * Objectif explicite du parcours (demande utilisateur) : ne pas se limiter à
 * "alif ba ta" - couvrir les formes des lettres selon leur position dans le
 * mot (isolée/initiale/médiane/finale, essentiel puisque l'écriture arabe
 * est cursive), puis progresser par exercices de concaténation (2 lettres,
 * puis mots courts) jusqu'à pouvoir aborder la lecture de vrais versets.
 *
 * Les tableaux de formes de lettres et exercices de lecture interactifs sont
 * des composants React dédiés (features/learning/arabic-reading/), branchés
 * par (slug, ordre) via LessonIllustration.tsx - `content` ci-dessous reste
 * le texte pédagogique qui les accompagne, jamais une redite du tableau
 * lui-même.
 *
 * Aucun texte coranique n'est retranscrit à la main dans ce fichier : les
 * leçons d'application (19-20) renvoient vers les vraies pages de sourates
 * déjà en base (texte Uthmani vérifié) plutôt que de dupliquer un verset -
 * même principe de sourcing que le reste du site.
 */
export const ARABIC_READING_PATH: PathSeed = {
  title: "Apprendre à lire l'arabe coranique",
  slug: "lire-arabe-coranique",
  level: "beginner",
  description:
    "De l'alphabet à la lecture des premiers versets : les 28 lettres et leurs formes selon leur position dans le mot, les voyelles, puis des exercices progressifs pour assembler des syllabes et des mots.",
  lessons: [
    {
      order: 1,
      title: "Comment se lit et s'écrit l'arabe",
      content:
        "L'arabe s'écrit et se lit de droite à gauche - l'inverse du français. Un livre arabe s'ouvre donc du côté qui serait la \"fin\" d'un livre français, et à l'intérieur d'une ligne, chaque nouveau mot ou chaque nouvelle lettre se place à gauche du précédent.\n\nL'écriture arabe est cursive : à l'intérieur d'un mot, les lettres s'attachent les unes aux autres par un petit trait de liaison, un peu comme une écriture manuscrite attachée en français. Une conséquence importante en découle, au cœur de ce parcours : une même lettre change légèrement de forme graphique selon sa position dans le mot - isolée, au début, au milieu ou à la fin d'un mot. Ce n'est pas une exception ponctuelle : cela concerne les 28 lettres de l'alphabet. Apprendre à les reconnaître dans leurs différentes formes est donc aussi important que d'apprendre leur son.\n\nAutre différence avec le français : l'arabe n'a pas de majuscules, et le texte que l'on manipule le plus souvent en contexte religieux - celui du Coran - est presque toujours entièrement voyellé, c'est-à-dire que chaque lettre porte un signe indiquant la voyelle courte qui l'accompagne (nous verrons ces signes, appelés harakat, dans le module suivant). C'est ce qui rend la lecture accessible dès qu'on connaît les lettres et ces quelques signes, sans avoir besoin de deviner la prononciation comme cela peut arriver en arabe non voyellé (journaux, romans...).\n\nCe parcours suit une progression volontairement lente et complète : d'abord les 28 lettres et leurs formes selon leur position, puis les voyelles et les premiers exercices de lecture (assembler 2 puis 3 lettres), puis quelques particularités de l'écriture coranique, et enfin l'application directe sur de vrais versets courts.",
      keyTakeaways: [
        "L'arabe se lit et s'écrit de droite à gauche.",
        "L'écriture est cursive : une même lettre change de forme selon sa position dans le mot (isolée, initiale, médiane, finale).",
        "Le texte coranique est entièrement voyellé, ce qui rend la lecture accessible dès que l'on connaît les lettres et les signes de voyelles.",
      ],
      references: [],
    },
    {
      order: 2,
      title: "L'alif et les lettres qui ne s'attachent jamais à la suivante",
      content:
        "Commençons par une règle structurante à connaître avant même de mémoriser toutes les lettres : six lettres de l'alphabet arabe ne s'attachent JAMAIS à la lettre qui les suit, même à l'intérieur d'un mot. Ce sont : ا (alif), د (dal), ذ (dhal), ر (ra), ز (zay) et و (waw). Une fois écrites, la lettre suivante recommence toujours \"à zéro\", sans lien avec elles - c'est pour cela qu'elles n'ont que deux formes réelles (isolée et finale) au lieu de quatre : il n'existe pas de version \"initiale\" ou \"médiane\" pour ces lettres, puisqu'aucune lettre ne vient s'accrocher après elles.\n\nLa première de ces lettres, et l'une des plus fréquentes de tout l'alphabet, est l'alif (ا). Seule, elle représente le plus souvent un \"a\" prolongé (une voyelle longue), mais elle sert aussi fréquemment de simple support visuel à un autre signe (la hamza, que nous verrons plus tard) sans avoir de son propre à elle dans ce cas. Vous la reconnaîtrez facilement : un simple trait vertical.\n\nRetenez ce groupe de six lettres dès maintenant (ا د ذ ر ز و) : le reconnaître vous aidera, dans les prochaines leçons, à repérer immédiatement où un mot \"se coupe\" visuellement même s'il continue en réalité.",
      keyTakeaways: [
        "6 lettres ne s'attachent jamais à la lettre suivante : ا د ذ ر ز و.",
        "Ces 6 lettres n'ont donc que 2 formes réelles (isolée et finale), pas 4.",
        "L'alif (ا) représente le plus souvent un \"a\" long, ou sert de simple support à la hamza.",
      ],
      references: [],
    },
    {
      order: 3,
      title: "Première famille de lettres : ب ت ث",
      content:
        "Les lettres arabes sont traditionnellement apprises par familles qui partagent le même squelette graphique, distinguées seulement par le nombre et la position de petits points diacritiques. C'est la méthode la plus efficace pour les mémoriser, car elle s'appuie sur ce que l'œil reconnaît en premier : la forme générale du trait.\n\nLa première famille est ب ت ث. Les trois lettres partagent exactement le même tracé de base (une sorte de \"barque\") ; seul le nombre de points en dessous ou au-dessus change :\n- ب (ba) porte un point en dessous : le son \"b\".\n- ت (ta) porte deux points au-dessus : le son \"t\".\n- ث (tha) porte trois points au-dessus : un son \"th\" sourd, comme dans l'anglais think (n'existe pas en français).\n\nLe tableau ci-dessus montre les 4 formes de chacune de ces 3 lettres. Observez bien comment le \"corps\" de la lettre s'aplatit et s'étire légèrement dans les formes initiale et médiane pour se lier à ce qui suit, tout en gardant le même nombre et la même position de points - c'est ce repère (les points) qui reste le plus stable d'une forme à l'autre et qui vous aidera le plus, au début, à identifier la lettre quelle que soit sa forme.",
      keyTakeaways: [
        "ب ت ث partagent le même tracé de base, distingué uniquement par les points diacritiques.",
        "ب : un point en dessous, son \"b\". ت : deux points au-dessus, son \"t\". ث : trois points au-dessus, son \"th\" sourd.",
        "Les points diacritiques restent le repère le plus stable pour identifier une lettre dans toutes ses formes.",
      ],
      references: [],
    },
    {
      order: 4,
      title: "Deuxième famille : ج ح خ",
      content:
        "Deuxième famille de lettres partageant un même squelette, cette fois en forme de crochet ouvert vers le haut :\n- ج (jim) porte un point en dessous : un son \"dj\", comme le \"j\" anglais de job.\n- ح (ha emphatique) ne porte aucun point : un \"h\" rauque, expiré profondément depuis la gorge - un son qui n'existe pas en français, à travailler à l'oreille en écoutant des récitations.\n- خ (kha) porte un point au-dessus : un son raclé, proche de la jota espagnole ou du \"ch\" allemand de Bach.\n\nCette famille illustre bien pourquoi il est utile de mémoriser les lettres par groupes de squelette commun plutôt qu'une par une dans le désordre : une fois le crochet de base reconnu, il ne reste plus qu'à repérer l'absence de point (ح), un point au-dessus (خ) ou un point en dessous (ج) pour distinguer les trois.",
      keyTakeaways: [
        "ج ح خ partagent un même crochet de base.",
        "ح ne porte aucun point : un \"h\" rauque profond, sans équivalent en français.",
        "ج (point dessous) = \"dj\" ; خ (point dessus) = \"kh\" raclé.",
      ],
      references: [],
    },
    {
      order: 5,
      title: "Les 4 lettres restantes qui ne s'attachent pas : د ذ ر ز",
      content:
        "Retour sur les lettres non-attachantes présentées en leçon 2 : après l'alif, voici les 4 dernières. Elles se répartissent en deux familles de squelette, chacune ne se distinguant que par un point :\n- د (dal), sans point : le son \"d\". ذ (dhal), avec un point au-dessus : un \"dh\" sonore, comme le \"th\" anglais de this.\n- ر (ra), sans point : un \"r\" roulé, comme en espagnol ou en italien. ز (zay), avec un point au-dessus : le son \"z\".\n\nComme elles ne s'attachent jamais à la lettre suivante, vous ne verrez jamais ces quatre lettres \"aplaties\" au milieu d'un mot comme les lettres de la leçon 3 : elles gardent toujours leur forme isolée (légèrement raccourcie côté droit si une lettre les précède, mais jamais modifiée côté gauche). C'est un repère visuel précieux : dans un mot, chaque fois que vous voyez l'une de ces 6 lettres non-attachantes (avec l'alif et le waw que nous verrons plus loin), vous savez que le \"lien\" graphique s'arrête net juste après, même si le mot continue.",
      keyTakeaways: [
        "د (sans point) / ذ (un point dessus, \"dh\") : même squelette.",
        "ر (sans point, \"r\" roulé) / ز (un point dessus, \"z\") : même squelette.",
        "Ces 4 lettres ne s'attachent jamais à la suivante, comme l'alif et le waw.",
      ],
      references: [],
    },
    {
      order: 6,
      title: "Famille س ش",
      content:
        "La famille س ش se reconnaît à sa base en trois petites \"dents\" alignées :\n- س (sin), sans point : le son \"s\".\n- ش (shin), avec trois points au-dessus des dents : un son \"ch\", comme le \"sh\" anglais.\n\nDans les formes initiale et médiane (voir le tableau), les trois dents restent visibles et sont même souvent le trait le plus caractéristique de ces deux lettres, plus facile à repérer que dans d'autres familles où la forme change davantage selon la position.",
      keyTakeaways: [
        "س ش partagent une base à trois \"dents\".",
        "س (sans point) = \"s\" ; ش (trois points dessus) = \"ch\".",
      ],
      references: [],
    },
    {
      order: 7,
      title: "Les lettres emphatiques : ص ض ط ظ",
      content:
        "Ces quatre lettres se prononcent avec une emphase particulière : le dos de la langue se relève vers le palais, ce qui donne un son plus \"grave\" et plus \"plein\" qu'en français. C'est une caractéristique propre à l'arabe, qui demande surtout de la pratique à l'oreille plutôt qu'une explication théorique.\n\nElles se répartissent en deux familles de squelette :\n- ص (sad), sans point : un \"s\" emphatique. ض (dad), avec un point au-dessus : un \"d\" emphatique - c'est la lettre qui a donné à l'arabe le surnom de \"langue du dad\", car ce son lui est propre.\n- ط (ta emphatique), sans point : un \"t\" emphatique. ظ (za emphatique), avec un point au-dessus : un \"z\"/\"dh\" emphatique.\n\nComparez mentalement ص à س (leçon 6) et ط à ت (leçon 3) : le son de base est proche, seule l'emphase change - mais à l'écrit, ce sont bien des lettres entièrement différentes, avec leur propre tracé.",
      keyTakeaways: [
        "ص ض ط ظ se prononcent avec le dos de la langue relevé (emphase), un trait propre à l'arabe.",
        "ص/ض partagent un squelette ; ط/ظ partagent un autre squelette.",
        "Le \"dad\" (ض) a donné à l'arabe le surnom de \"langue du dad\".",
      ],
      references: [],
    },
    {
      order: 8,
      title: "Famille ع غ et ف ق",
      content:
        "ع et غ partagent un même squelette en forme de boucle ouverte :\n- ع (ayn), sans point : un son guttural produit dans la gorge, sans équivalent en français - l'une des lettres qui demande le plus de pratique à l'oreille pour un francophone.\n- غ (ghayn), avec un point au-dessus : un son \"gh\" grasseyé, assez proche du \"r\" français.\n\nف et ق partagent une base ronde surmontée d'un ou deux points :\n- ف (fa), un point au-dessus : le son \"f\".\n- ق (qaf), deux points au-dessus : un \"q\" profond, articulé tout au fond de la gorge - à distinguer du ك (kaf, leçon suivante) qui se prononce, lui, comme le \"k\" français.",
      keyTakeaways: [
        "ع (sans point, son guttural) et غ (un point, \"gh\") partagent un squelette.",
        "ف (un point, \"f\") et ق (deux points, \"q\" profond) partagent un autre squelette.",
        "ق et ك sont deux lettres distinctes : \"q\" profond vs \"k\" simple.",
      ],
      references: [],
    },
    {
      order: 9,
      title: "Les dernières lettres : ك ل م ن ه و ي, et la hamza",
      content:
        "Il reste sept lettres qui n'appartiennent à aucune des familles précédentes, chacune avec un tracé qui lui est propre :\n- ك (kaf) : le son \"k\".\n- ل (lam) : le son \"l\".\n- م (mim) : le son \"m\".\n- ن (noun) : le son \"n\".\n- ه (ha légère) : un \"h\" aspiré léger - à ne pas confondre avec le ح rauque de la leçon 4.\n- و (waw) : soit une consonne \"w\", soit - très souvent - une voyelle longue \"ou\" quand elle suit une lettre portant elle-même la voyelle \"ou\" courte. C'est l'une des 6 lettres non-attachantes.\n- ي (ya) : soit une consonne \"y\", soit - très souvent - une voyelle longue \"i\".\n\nEnfin, une dernière lettre à connaître : ء (la hamza), qui représente un arrêt bref de la voix (un \"coup de glotte\", le même son qu'entre les deux \"a\" du mot français \"cacao\" prononcé de façon très marquée). Elle ne fait pas partie des 28 lettres traditionnelles de l'alphabet - elle est souvent présentée à part - mais elle apparaît fréquemment, parfois seule, parfois \"posée\" sur un alif, un waw ou un ya qui lui sert alors de simple support visuel.",
      keyTakeaways: [
        "ك ل م ن ه complètent l'alphabet avec un tracé propre à chacune.",
        "و et ي ont un double rôle : consonnes (\"w\"/\"y\") ou voyelles longues (\"ou\"/\"i\") selon le contexte.",
        "La hamza (ء) représente un arrêt bref de la voix ; elle est parfois posée sur un alif/waw/ya qui lui sert de support.",
      ],
      references: [],
    },
    {
      order: 10,
      title: "Récapitulatif : les 28 lettres et leurs formes",
      content:
        "Voici l'alphabet complet réuni dans un seul tableau, dans l'ordre traditionnel d'enseignement suivi par ce parcours. Prenez le temps de le parcourir lettre par lettre : pour chacune, essayez de retrouver de mémoire son nom, son son, et la famille à laquelle elle appartient (même squelette qu'une autre lettre, ou tracé unique) avant de vérifier.\n\nCe tableau n'est pas fait pour être mémorisé d'un coup - revenez-y aussi souvent que nécessaire pendant les prochaines leçons, en particulier dès qu'un exercice de lecture contient une lettre dont la forme vous fait hésiter. Reconnaître instantanément une lettre dans n'importe laquelle de ses quatre formes est la compétence qui, une fois acquise, rend toute la suite du parcours - et la lecture du Coran lui-même - nettement plus fluide.",
      keyTakeaways: [
        "L'alphabet arabe compte 28 lettres, dont 6 qui ne s'attachent jamais à la suivante.",
        "Chaque lettre (sauf ces 6) a 4 formes : isolée, initiale, médiane, finale.",
        "Reconnaître une lettre dans toutes ses formes est la compétence clé pour la suite du parcours.",
      ],
      references: [],
    },
    {
      order: 11,
      title: "Donner une voyelle à une lettre : fatha, kasra, damma",
      content:
        "Une lettre arabe seule (une consonne) ne se prononce pas sans voyelle. Le texte coranique - et celui de ce parcours - indique la voyelle courte de chaque lettre par un petit signe placé au-dessus ou en dessous d'elle. Il en existe trois :\n- La fatha ( َ ) : un petit trait oblique au-dessus de la lettre, qui lui donne le son \"a\". بَ se lit \"ba\".\n- La kasra ( ِ ) : le même petit trait, mais en dessous de la lettre, qui lui donne le son \"i\". بِ se lit \"bi\".\n- La damma ( ُ ) : une petite boucle au-dessus de la lettre, qui lui donne le son \"ou\" bref (pas \"u\" français). بُ se lit \"bou\", que l'on transcrit simplement \"bu\" dans ce parcours par simplicité.\n\nCes trois signes s'appliquent à n'importe quelle lettre de l'alphabet, exactement de la même façon. Une fois qu'on les connaît, on peut déjà \"lire\" n'importe quelle lettre isolée voyellée : c'est le tout premier geste de lecture, avant même d'assembler plusieurs lettres. L'exercice ci-dessus applique les trois voyelles à quatre lettres déjà connues (ب ت د م) : essayez de les lire à voix haute avant de révéler la réponse.",
      keyTakeaways: [
        "Fatha ( َ ) = son \"a\", kasra ( ِ ) = son \"i\", damma ( ُ ) = son \"ou\" bref.",
        "Ces trois signes de voyelle s'appliquent de la même façon à n'importe quelle lettre.",
        "Lire une lettre + sa voyelle est le tout premier geste de lecture de l'arabe.",
      ],
      references: [],
    },
    {
      order: 12,
      title: "Le soukoun : la lettre sans voyelle",
      content:
        "À l'inverse des trois signes précédents, le soukoun ( ْ ), un petit cercle au-dessus de la lettre, indique qu'elle ne porte AUCUNE voyelle : on prononce sa consonne \"sèche\", directement enchaînée à la lettre suivante, sans son de voyelle entre les deux. C'est ce qui permet à l'arabe de former des syllabes avec plusieurs consonnes qui se suivent, comme en français dans le mot \"train\" (deux consonnes \"t\" et \"r\" enchaînées sans voyelle entre elles).\n\nمِنْ (\"min\") en est un bon exemple : le م porte une kasra (\"mi\"), et le ن qui suit porte un soukoun - il se prononce donc \"n\" sec, directement après le \"mi\", sans ajouter de voyelle. Le mot entier se lit \"min\", pas \"mina\".\n\nLe soukoun est aussi la règle de base d'un ensemble de règles de tajwid étudiées plus tard sur ce site (noun sakinah, mim sakinah...) : elles concernent justement le comportement particulier d'un ن ou d'un م portant un soukoun selon la lettre qui suit. Vous les retrouverez en pratique directement en couleur sur les pages du Coran, grâce à l'interrupteur \"Tajwid\" disponible sur la page de chaque sourate.",
      keyTakeaways: [
        "Le soukoun ( ْ ) indique qu'une lettre ne porte aucune voyelle : on prononce sa consonne sèche.",
        "Il permet d'enchaîner deux consonnes sans voyelle entre elles, comme dans مِنْ (\"min\").",
        "Le soukoun sur ن/م est la base des règles de tajwid (noun/mim sakinah) visibles en couleur sur les pages du Coran.",
      ],
      references: [{ label: "Voir le tajwid en couleur sur une sourate", url: "/quran/1" }],
    },
    {
      order: 13,
      title: "La chadda : la lettre doublée",
      content:
        "La chadda ( ّ ), un petit signe en forme de \"w\" au-dessus de la lettre, indique que cette lettre est doublée : on la prononce plus longuement, en insistant dessus, comme si elle comptait pour deux. C'est l'équivalent à l'oral du redoublement d'une consonne à l'écrit en italien (par exemple \"tt\" dans \"tutto\").\n\nUne lettre portant une chadda porte presque toujours aussi une voyelle (fatha, kasra ou damma), placée au-dessus ou en dessous de la chadda elle-même. رَبَّ se lit ainsi \"rabba\", avec un \"b\" nettement plus appuyé que dans رَبَ (qui n'est d'ailleurs pas un mot correct - la chadda ici n'est pas facultative, elle change le mot).\n\nLa chadda apparaît très fréquemment dans le Coran, y compris dans des mots très courants : ثُمَّ (\"thumma\", \"puis\"), إِنَّ (\"inna\", \"certes\"), ou encore dans رَّبِّهِمْ que vous croiserez dans de nombreux versets.",
      keyTakeaways: [
        "La chadda ( ّ ) double la lettre qui la porte : on la prononce plus longuement/appuyée.",
        "Une lettre avec chadda porte presque toujours aussi une voyelle, placée sur la chadda.",
        "La chadda change le mot : ce n'est jamais un détail facultatif.",
      ],
      references: [],
    },
    {
      order: 14,
      title: "Premiers mots : assembler 2 et 3 lettres",
      content:
        "Vous connaissez maintenant les 28 lettres dans leurs différentes formes, les trois voyelles courtes, le soukoun et la chadda : de quoi commencer à vraiment lire. La lecture, à ce stade, n'est rien d'autre qu'un déchiffrage lettre par lettre, dans l'ordre, en appliquant à chacune sa voyelle (ou son soukoun) - exactement comme un enfant apprenant à lire en français assemble \"m\" + \"a\" pour dire \"ma\".\n\nL'exercice ci-dessus rassemble des mots réels et très courants de 2 à 3 lettres, tous composés uniquement de ce que vous avez déjà appris (lettres + fatha/kasra/damma/soukoun, sans voyelle longue ni chadda). Prenez chaque mot lettre par lettre, prononcez chaque son, puis assemblez-les à voix haute avant de vérifier la translittération. Remarquez que plusieurs de ces mots sont des verbes très simples, tous construits sur le même schéma (trois lettres + trois fatha) : c'est l'un des schémas de mots les plus fréquents de toute la langue arabe, y compris dans le Coran.\n\nNe cherchez pas à aller vite : la vitesse de lecture viendra naturellement avec la pratique. L'objectif de cette étape est uniquement de vérifier que le déchiffrage lettre par lettre fonctionne, avant d'ajouter les voyelles longues et le tanwin dans les prochaines leçons.",
      keyTakeaways: [
        "Lire, à ce stade, c'est déchiffrer lettre par lettre en appliquant la voyelle de chacune, puis assembler.",
        "Le schéma \"3 lettres + 3 fatha\" (ex. كَتَبَ) est l'un des plus fréquents de la langue arabe.",
        "La vitesse de lecture vient avec la pratique - l'objectif ici est la fiabilité du déchiffrage.",
      ],
      references: [],
    },
    {
      order: 15,
      title: "Les voyelles longues",
      content:
        "Trois lettres jouent un double rôle en arabe : consonnes dans certains mots, elles deviennent voyelles longues dans d'autres - il s'agit de l'alif (ا), du waw (و) et du ya (ي), déjà rencontrées comme consonnes dans les leçons précédentes.\n\nLa règle est simple : quand une lettre porte une fatha et qu'elle est immédiatement suivie d'un alif (sans voyelle propre), le \"a\" se prolonge - on ne prononce pas l'alif séparément, il allonge simplement le son qui précède. Le même principe s'applique au waw après une damma (le \"ou\" s'allonge) et au ya après une kasra (le \"i\" s'allonge). C'est exactement ce qui se passe dans قَالَ (\"qala\", avec un \"a\" nettement plus long que dans une syllabe fermée par un soukoun), دِينٌ (\"dinun\", \"i\" long) ou نُورٌ (\"nurun\", \"ou\" long).\n\nCes trois lettres de prolongation (alif, waw, ya) sont aussi appelées \"lettres de madd\" - un terme que vous retrouverez dans les règles de tajwid plus avancées, qui distinguent plusieurs façons de prolonger le son selon ce qui suit (une hamza, un soukoun...). Ce parcours n'entre pas dans ce niveau de détail : l'essentiel, à ce stade, est de reconnaître qu'un alif/waw/ya sans sa propre voyelle après une lettre voyellée en conséquence signale un allongement, pas une nouvelle consonne à prononcer séparément.",
      keyTakeaways: [
        "Alif après fatha, waw après damma, ya après kasra : le son s'allonge, la lettre de prolongation ne se prononce pas séparément.",
        "On les appelle \"lettres de madd\" (prolongation) - un terme central en tajwid avancé.",
        "قَالَ, دِينٌ, نُورٌ illustrent chacun un des trois allongements.",
      ],
      references: [],
    },
    {
      order: 16,
      title: "Le tanwin",
      content:
        "Le tanwin est le doublement d'un signe de voyelle en fin de mot, qui ajoute un son \"n\" à la fin : la fatha doublée ( ً ) se lit \"an\", la kasra doublée ( ٍ ) se lit \"in\", et la damma doublée ( ٌ ) se lit \"un\". C'est très fréquent en arabe : il marque, entre autres usages grammaticaux, l'indétermination d'un nom (l'équivalent d'un article \"un/une\" en français, qui n'existe pas comme mot séparé en arabe).\n\nكِتَابٌ (\"kitabun\", \"un livre\") en est un exemple simple : la damma doublée en fin de mot ajoute ce \"n\" final. Une particularité orthographique à connaître : le tanwin fath ( ً , \"an\") s'accompagne presque toujours d'un alif silencieux ajouté après la lettre porteuse, uniquement à l'écrit - il ne s'entend pas et ne s'écrit pas seul. C'est le cas dans بَيْتًا (\"baytan\") : le tanwin est porté par le ت, et l'alif final qui suit ne se prononce pas séparément.\n\nLe tanwin est d'ailleurs directement pris en compte par le moteur de coloration tajwid de ce site (au même titre que le soukoun sur ن) : un mot se terminant par un tanwin peut déclencher les mêmes règles (idgham, iqlab, ikhfa) selon la première lettre du mot suivant.",
      keyTakeaways: [
        "Le tanwin double un signe de voyelle en fin de mot et ajoute un son \"n\" : ً = \"an\", ٍ = \"in\", ٌ = \"un\".",
        "Le tanwin fath ( ً ) s'écrit presque toujours avec un alif silencieux après la lettre porteuse (ex. بَيْتًا).",
        "Le tanwin déclenche les mêmes règles de tajwid (idgham/iqlab/ikhfa) que le soukoun sur noun.",
      ],
      references: [],
    },
    {
      order: 17,
      title: "L'alif de liaison et le ta marbouta",
      content:
        "Deux dernières particularités d'écriture avant de passer à la pratique sur de vrais versets.\n\nL'alif de liaison (hamzat al-wasl), souvent noté ٱ dans les éditions du Coran (dont celles utilisées sur ce site), est un alif qui ne se prononce que si le mot commence une phrase ou suit une pause : au milieu d'une lecture continue, il \"disparaît\" et on enchaîne directement le mot précédent avec la lettre suivante. On le trouve par exemple au début de l'article défini اَل (\"al-\"), très fréquent, ou dans des mots comme ٱسْمٌ (\"ismun\", \"un nom\") et ٱبْنٌ (\"ibnun\", \"un fils\"). Pour un débutant, la règle pratique la plus simple est : si vous commencez à lire à cet endroit, prononcez un \"i\" bref avant la lettre suivante ; si vous enchaînez depuis le mot précédent, ignorez purement et simplement cet alif à la lecture.\n\nLe ta marbouta (ة), littéralement le \"ta lié\", apparaît uniquement en fin de mot et se reconnaît à sa forme arrondie surmontée de deux points (comme un ه portant les deux points du ت). Il se prononce généralement comme un \"h\" très léger en fin de phrase (ou n'est même pas prononcé du tout selon le style de lecture), mais comme un \"t\" normal si le mot est directement suivi d'un autre mot dans la même phrase. Il marque très souvent le féminin d'un nom, comme dans مَدْرَسَةٌ (\"madrasatun\", \"une école\") ou رَحْمَةٌ (\"rahmatun\", \"une miséricorde\").",
      keyTakeaways: [
        "L'alif de liaison (ٱ) ne se prononce qu'en début de lecture/après une pause ; sinon, on l'ignore et on enchaîne.",
        "Le ta marbouta (ة) n'apparaît qu'en fin de mot, marque souvent le féminin, et se prononce \"h\" léger (ou pas du tout) sauf si le mot suivant est enchaîné.",
      ],
      references: [],
    },
    {
      order: 18,
      title: "Le lam solaire et le lam lunaire",
      content:
        "Dernière règle avant de passer à la lecture de vrais versets, et l'une des plus utiles au quotidien puisqu'elle concerne l'article défini اَل (\"al-\", l'équivalent de \"le/la\" en français), l'un des mots les plus fréquents de toute la langue.\n\nSelon la lettre qui suit cet article, le ل (lam) se prononce ou s'efface :\n- Devant une \"lettre lunaire\" (parmi lesquelles ق ك م ه ي ب), le lam se prononce normalement : ٱلْقَمَرُ (\"al-qamaru\", \"la lune\" - d'où le nom \"lunaire\").\n- Devant une \"lettre solaire\" (parmi lesquelles ش ن ر س ت ل), le lam ne se prononce PAS : à l'écrit, il reste présent mais porte un soukoun, et c'est la lettre solaire qui suit qui porte une chadda à la place - on la double, exactement comme en leçon 13. ٱلشَّمْسُ (\"ash-shamsu\", \"le soleil\" - d'où le nom \"solaire\") se prononce donc \"ach-chamsou\", jamais \"al-chamsou\".\n\nCette règle porte le nom de lam shamsiyya (lam solaire) et lam qamariyya (lam lunaire) en tajwid, et c'est exactement ce que colore le moteur de tajwid de ce site sur les pages de sourate : activez l'interrupteur \"Tajwid\" sur n'importe quelle page contenant un mot commençant par اَل pour voir cette règle mise en évidence en couleur, directement sur un vrai verset.",
      keyTakeaways: [
        "Devant une lettre lunaire, le lam de l'article اَل se prononce normalement (ٱلْقَمَرُ, \"al-qamaru\").",
        "Devant une lettre solaire, le lam ne se prononce pas : la lettre solaire est doublée à sa place (ٱلشَّمْسُ, \"ash-shamsu\").",
        "Cette règle (lam shamsiyya/qamariyya) est visible en couleur sur les pages de sourate via l'interrupteur Tajwid.",
      ],
      references: [{ label: "Voir la règle en couleur sur une sourate", url: "/quran/1" }],
    },
    {
      order: 19,
      title: "Premiers pas dans le Coran : lire Al-Fatiha",
      content:
        "Vous disposez maintenant de tout ce qu'il faut pour aborder un vrai texte coranique : les 28 lettres et leurs formes, les voyelles courtes et longues, le soukoun, la chadda, le tanwin, et les deux particularités d'écriture des leçons précédentes. Il est temps de mettre tout cela en pratique sur Al-Fatiha, la sourate d'ouverture du Coran et la plus récitée de toutes (elle revient à chaque unité de prière).\n\nOuvrez la page d'Al-Fatiha (lien ci-dessous) et activez l'interrupteur \"Tajwid\" en haut de page : les couleurs qui apparaissent correspondent exactement aux règles étudiées dans ce parcours (soukoun sur noun/mim, lam shamsiyya, chadda...) et vous aideront à vérifier votre lecture verset par verset. Procédez lentement, un verset à la fois : lisez-le vous-même à voix haute d'abord, puis utilisez le lecteur audio de la page pour comparer votre lecture à celle d'un récitateur.\n\nSi un mot vous résiste, revenez sans hésiter aux leçons précédentes de ce parcours - la maîtrise de la lecture arabe se construit par la répétition, pas en une seule fois.",
      keyTakeaways: [
        "Al-Fatiha réunit la quasi-totalité des notions de ce parcours dans un texte court et très familier.",
        "L'interrupteur Tajwid de la page colore les règles étudiées, directement sur le vrai texte.",
        "Comparer sa propre lecture au lecteur audio de la page est le meilleur moyen de progresser.",
      ],
      references: [{ label: "Lire Al-Fatiha", url: "/quran/1" }],
    },
    {
      order: 20,
      title: "Continuer : trois courtes sourates, puis le tajwid",
      content:
        "Pour consolider ce que vous venez de pratiquer sur Al-Fatiha, poursuivez avec trois autres sourates très courtes et très récitées : Al-Ikhlas, Al-Falaq et An-Nas (les trois dernières du Coran, souvent apprises ensemble). Leur brièveté permet de s'entraîner sur un texte complet sans se décourager, et leur usage fréquent dans la prière quotidienne rend la pratique immédiatement utile.\n\nUne fois la lecture lettre par lettre suffisamment fluide sur ces textes courts, l'étape naturelle suivante est le tajwid : l'ensemble des règles précises de prononciation qui rendent la récitation du Coran conforme à la façon dont elle a été transmise depuis le Prophète ﷺ. Ce site en couvre déjà une bonne partie de façon interactive (noun/mim sakinah, qalqalah, ghunna, lam shamsiyya) directement en couleur sur chaque page de sourate - vous avez d'ailleurs déjà croisé plusieurs de ces règles au fil de ce parcours. Prendre le temps de les repérer, sourate après sourate, est la meilleure façon de continuer à progresser au-delà de ce cours d'introduction à la lecture.",
      keyTakeaways: [
        "Al-Ikhlas, Al-Falaq et An-Nas sont d'excellents textes courts pour consolider la lecture.",
        "Le tajwid (règles précises de prononciation) est l'étape naturelle après la maîtrise du déchiffrage lettre par lettre.",
        "Les règles de tajwid déjà couvertes par ce site restent visibles en couleur sur chaque page de sourate.",
      ],
      references: [
        { label: "Lire Al-Ikhlas", url: "/quran/112" },
        { label: "Lire Al-Falaq", url: "/quran/113" },
        { label: "Lire An-Nas", url: "/quran/114" },
      ],
    },
  ],
};
