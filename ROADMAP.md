# Feuille de route myQurandeen

Ce document liste les chantiers identifiés pour faire évoluer le produit et
sa visibilité, avec un plan technique et une checklist par chantier. Chaque
section est indépendante : on peut piocher dans l'ordre qui convient, mais
les **phases** ci-dessous reflètent les dépendances réelles entre chantiers
(ex. l'infra de paiement sert à la fois à l'IA payante et à l'API payante).

Convention : `[ ]` = à faire, `[~]` = décision à prendre avant de commencer,
`(S/M/L/XL)` = effort estimé (Small à quelques heures, XL = plusieurs semaines).

## Vue d'ensemble des phases

| Phase | Contenu | Pourquoi cet ordre |
|---|---|---|
| 0 — Fondations | Rate limiting, bundle JS, tests | Sécurise et accélère tout ce qui vient après, ne dépend de rien |
| 1 — Gains rapides | Verset/hadith du jour, "reprendre où j'en étais", page "Pourquoi", taille de police Arabe | Peu d'effort, impact direct, aucune dépendance externe |
| 2 — SEO & distribution | SEO contenu, widget embarquable, réseaux sociaux auto | S'appuie sur l'infra de partage/OG déjà existante |
| 3 — Lecture enrichie | Tajwid coloré, cache hors-ligne, recherche par racine | Plus gros chantiers de données, indépendants entre eux |
| 4 — Ramadan | Mode Ramadan | Dépend des horaires de prière (déjà en cours) |
| 5 — Audio | Récitation audio | Le plus gros chantier de données/stockage |
| 6 — Monétisation | Infra de paiement, IA payante, API payante | Les deux dépendent de la même infra ; à faire en dernier, une fois le reste stabilisé |

---

## Phase 0 — Fondations techniques

### 0.1 Rate limiting (S/M)

**Contexte** : `@nestjs/throttler` est déjà utilisé (ex. `/ai/query` à
15/min, `/ai/index` à 3/min), mais l'app n'a pas d'audit systématique de ce
qui est protégé.

- [ ] Vérifier si `ThrottlerModule.forRoot()` pose une limite globale par
      défaut dans `apps/api/src/app.module.ts` — sinon en ajouter une
      raisonnable (ex. 100 req/min/IP) qui s'applique à tout endpoint sans
      annotation spécifique.
- [ ] Lister tous les contrôleurs publics (`quran`, `hadith`, `tafsir`,
      `search`, `duas`, `schools`, `history`, `concepts`, `scholars`,
      `library`, `learning`) et vérifier qu'aucun n'est totalement nu face
      au scraping massif.
- [ ] Cas particulier `search` : c'est l'endpoint le plus coûteux
      (FTS Postgres sur plusieurs tables) — mérite une limite dédiée plus
      stricte que la valeur globale.
- [ ] Ajouter une limite sur les endpoints d'écriture non déjà couverts
      (notes, bookmarks, collections, reports) pour éviter le spam.
- [ ] Documenter les limites choisies dans `apps/api/README.md` ou un doc
      dédié, pour que l'équipe API publique (phase 6) parte d'une base
      claire.

### 0.2 Bundle JS principal (~750 Ko) (M)

**Contexte** : le dernier build montre un chunk `index-*.js` de 752 Ko
(gzip 222 Ko) alors que le reste est déjà bien scindé par page
(`React.lazy` par route). Ce chunk pèse sur le LCP/TTI mobile, donc sur le
SEO (Core Web Vitals) et le taux de conversion des nouveaux visiteurs.

- [ ] Générer une visualisation du bundle (`rollup-plugin-visualizer` ou
      `vite-bundle-visualizer`) pour voir précisément ce qui compose ce
      chunk avant d'optimiser à l'aveugle.
- [ ] Vérifier si des dépendances lourdes (ex. `lucide-react` importé sans
      tree-shaking correct, une lib de date, `zod` côté client) finissent
      dans le chunk principal au lieu d'être scindées.
- [ ] Ajouter des `manualChunks` ciblés dans `apps/web/vite.config.ts`
      (`build.rollupOptions.output.manualChunks`) pour séparer les grosses
      libs tierces du code applicatif partagé (layout, providers, router).
- [ ] Vérifier que les composants lourds mais rarement utilisés à froid
      (éditeur de notes riche, dashboard admin, assistant IA) sont bien en
      `React.lazy` — l'admin l'est déjà (`AdminPage-*.js` séparé), à
      confirmer pour le reste.
- [ ] Fixer un budget de taille dans `vite.config.ts`
      (`build.chunkSizeWarningLimit`) une fois la cible atteinte, pour
      détecter toute régression future en CI.
- [ ] Mesurer avant/après avec Lighthouse (mobile, réseau throttled) et
      noter le gain concret sur LCP/TBT.

### 0.3 Couverture de tests (L, continu)

**Contexte** : rythme de développement élevé (plusieurs fonctionnalités par
session) sans filet de tests automatisés visible — risque de régression
silencieuse qui grandit avec la taille du code.

- [ ] Décider du socle : `vitest` (cohérent avec l'écosystème Vite déjà en
      place côté web) + `@testing-library/react` pour le frontend, `jest`
      (déjà probablement configuré par défaut NestJS) côté API.
- [ ] Prioriser par risque plutôt que par exhaustivité :
  - [ ] Backend : les helpers purs à haut risque de régression silencieuse
        (`localClock`, `minutesSince`, `alreadySentToday` dans le module
        reminders — logique déjà source de bugs corrigés cette session),
        les DTOs de validation, le calcul RBAC (permissions).
  - [ ] Frontend : les utilitaires purs (`splitBasmala`, `withShareUtm`,
        `computePrayerTimes`/`computeQiblaDirection`), pas les composants
        UI dans un premier temps (ROI plus faible, plus fragile).
- [ ] Ajouter un job CI (GitHub Actions) qui fait tourner `typecheck` +
      `lint` + les tests sur chaque PR — le typecheck/lint existent déjà
      comme scripts npm, seul le déclenchement CI manque probablement.
- [ ] Fixer une règle simple pour la suite : toute nouvelle fonction pure
      non triviale (calcul de date, calcul financier, parsing) doit
      s'accompagner d'un test — pas d'objectif de couverture globale
      arbitraire, plutôt une discipline sur le code neuf.

---

## Phase 1 — Gains rapides

### 1.1 Verset/hadith du jour en page d'accueil (S/M)

- [ ] Backend : nouvel endpoint `GET /daily/verse` et `GET /daily/hadith`
      (ou un seul `GET /daily` renvoyant les deux) — sélection déterministe
      par date (ex. hash de la date UTC modulo le nombre total de
      versets/hadiths) pour que tous les visiteurs voient le même contenu
      le même jour, sans état à stocker.
- [ ] Frontend : nouveau composant sur `HomePage.tsx`, réutilise
      `PageMeta`/`buildOgImage` pour que le contenu du jour soit aussi
      l'image OG par défaut de la page d'accueil (fraîcheur perçue par les
      crawlers/réseaux sociaux).
- [ ] Ajouter un bouton de partage direct dessus (`ShareButton` existant) —
      c'est le point d'entrée le plus naturel pour la diffusion virale
      quotidienne.
- [ ] i18n : clés `home.dailyVerse.*`/`home.dailyHadith.*`, fr/en d'abord.
- [ ] Option ultérieure : alterner verset/hadith/dua/concept par jour de la
      semaine pour varier le contenu affiché.

### 1.2 "Reprendre où j'en étais" (S/M)

**Contexte** : `useStreakPing`/`useGamificationEvent` trackent déjà la
lecture (`verse_read`) — vérifier s'il existe déjà une table de dernière
position avant de dupliquer un mécanisme.

- [ ] Vérifier l'existant (`user_streaks`, `user_daily_actions`) : y a-t-il
      déjà une trace de "dernier contenu consulté" réutilisable ?
- [ ] Si non : nouvelle table légère `user_last_read` (userId unique,
      targetType, targetId/surahNumber/verseNumber, href, updatedAt) mise à
      jour à chaque `verse_read`/lecture de leçon.
- [ ] Endpoint `GET /user-data/last-read`.
- [ ] Widget sur la page d'accueil (visiteur connecté) et/ou le profil :
      "Reprendre : Al-Baqara, verset 45" avec lien direct.
- [ ] Cas limite : plusieurs types de contenu consultés en parallèle
      (Coran + un parcours d'apprentissage) — décider si on garde une seule
      position globale ou une par type de contenu (recommandé : une par
      type, affichage des 2-3 plus récentes).

### 1.3 Page "Pourquoi myQurandeen" (S)

- [ ] Nouvelle page statique `/pourquoi` (ou `/about`), contenu i18n
      complet (fr/en au moins) : sans publicité, open-source, sourcing
      systématique (renvoyer vers `CONTRIBUTING.md`/le principe de sources
      vérifiables déjà documenté), toutes les positions présentées sans
      hiérarchie de "vérité" sur les sujets à divergence.
- [ ] Lien visible dans le footer et/ou le menu, pas seulement accessible
      par URL directe.
- [ ] Réutiliser cette page comme pitch pour les partenariats
      (mosquées/assos) et comme contenu de référence pour la présence
      réseaux sociaux (phase 2).

### 1.4 Taille de police Arabe réglable (S)

- [ ] Contrôle utilisateur (slider ou 3-4 tailles prédéfinies) persistée en
      `localStorage`, appliquée via une variable CSS (`--arabic-font-size`)
      lue par toutes les classes `font-arabic` déjà utilisées
      (`SurahDetailPage`, `VersePage`, `SearchPage`, hadith).
- [ ] Accessible depuis la page de sourate (bouton discret près du
      sélecteur de traduction/tafsir) plutôt qu'enfoui dans un réglage
      profil — c'est là que le besoin se fait sentir.
- [ ] Vérifier le rendu aux tailles extrêmes (line-height, présence de
      marques de récitation) pour éviter un texte tronqué/chevauché.

---

## Phase 2 — SEO & distribution

### 2.1 SEO sur les pages de contenu (M/L)

**Contexte** : `PageMeta`/`buildOgImage` existent déjà et couvrent
title/description/OG/Twitter. Il manque la couche indexation/données
structurées.

- [ ] `sitemap.xml` généré dynamiquement (endpoint API ou script de build)
      couvrant toutes les pages de contenu indexables : versets, sourates,
      hadiths, concepts, savants, sujets de fiqh, livres, prophètes,
      événements historiques. Avec ~6 200 versets + 33 500 hadiths, prévoir
      plusieurs fichiers sitemap (limite de 50 000 URL/fichier) + un
      sitemap index.
- [ ] Données structurées JSON-LD (`schema.org`) : `Article`/`CreativeWork`
      pour les pages de contenu, `BreadcrumbList` pour les fils d'Ariane
      déjà présents (`Breadcrumbs.tsx`), `FAQPage` si une FAQ voit le jour.
- [ ] Vérifier que les pages de contenu sont **crawlables sans exécution
      JS** — le système de pré-rendu Edge pour l'OG (déjà construit pour
      les crawlers de partage) est un bon point de départ ; voir s'il peut
      être étendu au HTML complet pour les moteurs de recherche (SSR/SSG
      partiel), sinon au minimum confirmer que Googlebot exécute le JS
      correctement sur ces routes (Search Console → Inspection d'URL).
- [ ] Soumettre le sitemap à Google Search Console et Bing Webmaster
      Tools ; suivre l'indexation dans les semaines qui suivent.
- [ ] `robots.txt` à vérifier/créer (autoriser tout le contenu public,
      bloquer `/admin`, `/profile`, les routes authentifiées).
- [ ] Balises `hreflang` si le contenu multilingue doit être indexé
      séparément par langue (à trancher : une seule URL par verset avec
      langue via préférence utilisateur, ou des URLs par langue — impact
      SEO différent selon le choix).

### 2.2 Widget "verset du jour" embarquable (M)

- [ ] Nouvelle route publique dédiée à l'embed, ex. `/embed/daily-verse`,
      **sans** layout applicatif (pas de sidebar/nav), CSS minimal en
      ligne, pensée pour tourner dans une `<iframe>` sur un site tiers.
- [ ] Réutilise l'endpoint `GET /daily/verse` de la section 1.1.
- [ ] Générer un snippet `<iframe>` prêt à copier-coller (avec dimensions
      recommandées) sur la page "Pourquoi myQurandeen" ou une page dédiée
      `/widgets`.
- [ ] En-têtes HTTP à vérifier : `X-Frame-Options`/`Content-Security-Policy
      frame-ancestors` doivent explicitement autoriser l'embed pour cette
      route précise (le reste du site doit rester protégé contre le
      clickjacking).
- [ ] Option JS (`<script>` qui injecte le widget sans iframe) pour un
      rendu mieux intégré visuellement chez l'hébergeur — plus complexe,
      à ne considérer qu'après un retour d'usage sur la version iframe.
- [ ] Suivre les domaines qui embarquent le widget (referrer côté
      analytics) pour mesurer la traction réelle.

### 2.3 Automatiser la présence réseaux sociaux (M)

- [ ] Choisir la ou les plateformes de départ : X/Twitter et Facebook ont
      des API de publication automatisée relativement simples ; Instagram
      impose un compte Business/Creator + review d'app pour publier via
      l'API (contrainte réelle, à anticiper) ; TikTok n'a pas d'API de
      publication automatisée grand public — prévoir une publication
      manuelle assistée pour celui-là au moins au départ.
- [ ] Nouveau job planifié (cron externe déjà en place pour les
      notifications — même pattern) qui génère l'image du jour via
      `buildOgImage`/le système `ShareCard` existant et la publie via
      l'API de chaque plateforme choisie.
- [ ] Prévoir une variante "portrait" des cartes générées (les réseaux
      sociaux favorisent le format story/vertical) si le générateur actuel
      est pensé pour du paysage/carré.
- [ ] Boucle de contenu : verset du jour, hadith du jour, citation d'un
      savant, rappel d'un succès/série (façon Duolingo) en alternance pour
      ne pas être monotone.
- [ ] Lien systématique vers la page correspondante avec paramètres UTM
      (`withShareUtm` déjà disponible) pour mesurer le trafic réellement
      généré par chaque canal.

---

## Phase 3 — Lecture enrichie

### 3.1 Tajwid coloré (M/L)

**[~] Décision** : utiliser le texte Tajweed annoté fourni par Tanzil (déjà
la source du texte Arabe actuel) plutôt que de recalculer les règles de
tajwid soi-même — à vérifier : format exact du fichier Tanzil Tajweed
(balisage par règle) et licence de redistribution, cohérent avec
l'exigence de sourcing du projet.

- [ ] Récupérer/valider la source de données tajwid (Tanzil ou équivalent
      libre) et son format de balisage par règle (ghunna, idgham, qalqala,
      etc.).
- [ ] Étendre le schéma : soit une colonne dédiée sur `quran_verses`
      (texte Arabe déjà segmenté en règles), soit une table séparée
      `quran_verse_tajweed` si le balisage est volumineux — éviter de
      complexifier `textArabic` qui sert aussi à la recherche/l'export.
- [ ] Script d'import dédié (miroir de `quran-import.ts`), idempotent.
- [ ] Composant frontend qui découpe le texte en segments colorés (palette
      définie une fois, cohérente entre thème clair/sombre) plutôt que
      d'injecter du HTML brut non maîtrisé.
- [ ] Interrupteur "Tajwid" à côté du sélecteur de traduction/tafsir
      existant sur `SurahDetailPage.tsx`, désactivé par défaut (le tajwid
      coloré peut nuire à la lisibilité pour qui n'en a pas l'habitude).
- [ ] Légende des couleurs/règles accessible (tooltip ou page dédiée) —
      sans ça la fonctionnalité est un mur de couleurs pour un débutant.

### 3.2 Cache hors-ligne complet du Coran (M/L)

**Contexte** : la PWA a déjà un service worker fait main
(`apps/web/public/sw.js`) avec cache réseau-first pour l'app shell et
stale-while-revalidate pour les assets — il ne couvre pas encore les
données Coran elles-mêmes.

- [ ] Nouvel endpoint API `GET /quran/export` (ou par sourate) optimisé
      pour un téléchargement en masse (texte Arabe + translittération +
      traductions actives), évitant 114+ requêtes individuelles.
- [ ] Stockage côté client : IndexedDB (pas `localStorage`, trop petit et
      synchrone) — un store par sourate ou un store global selon la
      taille réelle mesurée.
- [ ] UI : bouton "Télécharger pour hors-ligne" (page Coran ou réglages),
      avec barre de progression et indicateur de taille estimée avant
      confirmation (respecter les connexions limitées/data mobile).
- [ ] Adapter les hooks de lecture (`quranApi.getSurah`, etc.) pour lire
      depuis IndexedDB en priorité si les données hors-ligne existent et
      que le réseau est indisponible (`navigator.onLine` + fallback sur
      échec de fetch).
- [ ] Gestion de mise à jour : invalider/rafraîchir le cache local si le
      contenu serveur change (peu probable pour le texte coranique lui-même,
      plus probable si de nouvelles traductions sont ajoutées) — un simple
      numéro de version comparé au téléchargement suffit.
- [ ] Tester explicitement le scénario "mode avion" de bout en bout avant
      de considérer la fonctionnalité terminée.

### 3.3 Recherche par racine arabe (L)

**[~] Décision** : démarrer sur le Coran uniquement (un jeu de données
racine/lemme par mot existe pour le Coran, ex. Quranic Arabic Corpus —
**vérifier la licence exacte avant tout import**, cohérent avec l'exigence
de sourcing du projet) plutôt que sur tout le corpus Arabe (hadith compris),
qui demanderait un analyseur morphologique Arabe complet — chantier
nettement plus lourd, à considérer séparément si la version Coran seule
fait ses preuves.

- [ ] Valider la source de données racine/lemme et sa licence.
- [ ] Nouvelle table `quran_word_roots` (verseId, position du mot dans le
      verset, forme, racine, lemme) — import idempotent par script dédié.
- [ ] Endpoint de recherche dédié `GET /quran/search-by-root?root=...`
      (distinct de la recherche FTS existante, qui reste utile pour la
      recherche littérale).
- [ ] UI : sur `SurahDetailPage`/`VersePage`, un mot arabe cliquable ouvre
      "voir tous les versets partageant cette racine" — c'est l'usage le
      plus naturel pour un lecteur, pas une simple barre de recherche à
      part.
- [ ] Index Postgres adapté (`btree` sur la colonne racine suffit a priori,
      pas besoin de FTS ici).

---

## Phase 4 — Mode Ramadan

**Dépendance** : s'appuie sur le module horaires de prière déjà en
construction (`prayer-times`, calcul `adhan`, géolocalisation) pour les
horaires iftar/suhoor.

- [ ] Bascule d'affichage saisonnière : détection automatique de la
      période de Ramadan (calendrier hijri — bibliothèque de conversion
      grégorien/hijri à introduire, ex. `hijri-date` ou calcul manuel) avec
      activation manuelle possible en réglage pour tester/anticiper.
- [ ] Horaires iftar (= Maghrib) / suhoor (= juste avant Fajr) réutilisant
      directement `computePrayerTimes` du module prayer-times, affichés en
      priorité sur la page d'accueil pendant la période.
- [ ] Suivi de khatm (lecture complète du Coran sur le mois) : nouvelle
      table `user_khatm_progress` (userId, dernière sourate/verset, date de
      début), objectif calculé automatiquement (Coran ÷ jours restants du
      mois) avec rappel quotidien de la portion du jour.
- [ ] Contenu dédié : duas spécifiques au Ramadan déjà présentes dans les
      catégories existantes ? à vérifier et compléter sinon.
- [ ] Notification quotidienne dédiée pendant le mois (réutilise l'infra
      push existante), désactivable indépendamment des autres rappels.
- [ ] Élément de partage dédié (façon `StatShareCard` déjà utilisée pour
      séries/succès) : "J'ai terminé le Coran ce Ramadan" — bon candidat
      viral saisonnier à fort effet de groupe.

---

## Phase 5 — Récitation audio

**[~] Décisions à trancher avant de commencer** :
1. Récitateur(s) : commencer par un seul (licence libre/permissive
   claire à vérifier, ex. certains enregistrements EveryAyah sont
   librement redistribuables — à confirmer précisément par récitateur).
2. Hébergement : fichiers audio potentiellement volumineux (Coran complet
   ≈ plusieurs Go selon qualité) — stockage objet (S3-compatible,
   Cloudflare R2 pour éviter les coûts de sortie) plutôt que servi
   directement par le backend NestJS.
3. Granularité : audio par verset (plus flexible, plus de fichiers) vs par
   sourate (moins de fichiers, moins pratique pour naviguer verset par
   verset) — recommandé : par verset, c'est le standard des apps Coran et
   ça permet la mise en avant du "verset du jour" en audio.

- [ ] Trancher les 3 décisions ci-dessus.
- [ ] Schéma : table `quran_verse_audio` (verseId, reciterId, url, durée) +
      table `quran_reciters` (nom, style de récitation, source/licence).
- [ ] Script d'import (téléchargement en masse depuis la source choisie,
      upload vers le stockage objet, écriture des métadonnées en base) —
      prévoir un mode reprise (idempotent, ne re-télécharge pas l'existant)
      vu le volume.
- [ ] Backend : endpoint qui renvoie l'URL audio (signée si le stockage le
      demande) pour un verset/récitateur donné.
- [ ] Frontend : lecteur audio inline sur `VersePage`/`SurahDetailPage`
      avec lecture en continu (verset suivant automatique) — composant à
      concevoir pour rester utilisable au clavier/lecteur d'écran.
- [ ] Téléchargement hors-ligne de l'audio : à articuler avec le cache
      hors-ligne texte (3.2), mais séparément (l'audio est nettement plus
      lourd, ne doit pas être inclus par défaut dans le téléchargement
      "texte complet").
- [ ] Sélecteur de récitateur si plusieurs sont ajoutés par la suite —
      prévoir le schéma pour plusieurs récitateurs dès le départ même si
      un seul est importé au lancement.

---

## Phase 6 — Monétisation (IA + API publique)

### 6.0 Infra de paiement partagée — Wave + Stripe (M/L) — préalable aux deux chantiers suivants

**Choix retenu** : **deux moyens de paiement dès le départ, pas l'un puis
l'autre** — **Wave** (mobile money) pour l'Afrique, **Stripe** (carte
bancaire) pour l'international/la diaspora. Sur la page d'abonnement,
l'utilisateur choisit simplement entre "Payer avec Wave" et "Payer par
carte" — pas de détection géographique automatique (peu fiable avec
VPN/roaming, et le choix manuel est de toute façon plus simple à coder et
plus transparent pour l'utilisateur).

Différence structurante entre les deux à bien intégrer dès la conception :
**Stripe gère l'abonnement récurrent nativement** (débit automatique,
webhooks `customer.subscription.updated/deleted` qui tiennent
`currentPeriodEnd` à jour tout seuls) alors que **Wave ne fait que du
paiement ponctuel** (Checkout Session → l'utilisateur paie via l'app
Wave/USSD → webhook de confirmation, une seule fois). Pour Wave,
l'abonnement "mensuel" doit donc être recréé côté produit : on stocke une
date d'expiration et on redemande un paiement à l'échéance nous-mêmes,
plutôt que de compter sur un débit automatique qui n'existe pas côté Wave.

- [ ] Créer un compte Wave Business (clés API, environnements
      sandbox/production) et un compte Stripe (mode test d'abord).
- [ ] Nouvelle table `subscriptions`, générique dès le départ pour
      accueillir les deux fournisseurs (et un troisième plus tard, ex.
      Orange Money) sans la refaire : `userId`, `plan`, `provider`
      (`"wave"` | `"stripe"`), `providerReference` (id de la checkout
      session Wave, ou customerId+subscriptionId Stripe), `status`
      (`pending`/`active`/`expired`/`canceled`), `currentPeriodEnd`,
      `amount`, `currency` (XOF pour Wave, EUR/USD pour Stripe) +
      `api_keys` (userId/organisation, clé hashée, plan, quota,
      créée/révoquée) pour la partie API (6.2).
- [ ] Intégration Wave : endpoint qui crée une session de paiement
      (montant, référence interne) et redirige vers l'URL Wave renvoyée
      par l'API ; endpoint webhook qui active l'abonnement à réception de
      la confirmation (`status = active`, `currentPeriodEnd = maintenant +
      30 jours`).
- [ ] Intégration Stripe : Checkout Session en mode abonnement (pas
      paiement unique) ; endpoint webhook qui écoute
      `checkout.session.completed` (activation initiale) et
      `customer.subscription.updated`/`deleted` (renouvellement/résiliation
      gérés automatiquement par Stripe, il suffit de refléter l'état reçu
      dans `subscriptions`).
- [ ] **Vérifier la signature de chaque webhook** (Wave et Stripe ont chacun
      leur propre mécanisme) avant de faire confiance au payload — non
      négociable pour un endpoint qui active un accès payant.
- [ ] Planificateur de renouvellement **pour la branche Wave uniquement**
      (Stripe s'auto-gère), sur le modèle exact des schedulers déjà en
      place dans `apps/api/src/modules/reminders/` (`Cron(EVERY_...)`,
      verrou `SchedulerLockService`) : à J-3 de `currentPeriodEnd`,
      notification "votre abonnement expire bientôt, renouvelez"
      (réutilise l'infra push déjà existante) ; à échéance dépassée sans
      nouveau paiement, passage automatique en `status = expired`.
- [ ] Guard NestJS réutilisable `SubscriptionGuard`/décorateur
      `@RequireSubscription(plan)` (vérifie `status === "active"` et
      `currentPeriodEnd` non dépassé, **indépendamment du provider** — le
      reste de l'app n'a jamais à savoir si l'abonnement vient de Wave ou
      de Stripe) sur le modèle des guards RBAC déjà en place
      (`PermissionsGuard`), pour ne pas dupliquer la logique entre IA et
      API publique.
- [ ] Page compte : statut d'abonnement, date d'expiration, et selon le
      provider — lien vers le portail client Stripe (annulation/changement
      de carte en libre-service, Stripe le fournit tout fait) ou bouton
      "payer maintenant" pour renouveler manuellement côté Wave (pas
      d'équivalent portail self-service chez Wave, ce flux est à construire
      soi-même mais reste simple : même endpoint que pour un nouvel
      abonnement).

### 6.1 Débloquer l'assistant IA (paywall) (S puis M selon validation)

**Approche en 2 temps demandée** : d'abord valider l'intérêt réel avant
d'investir dans la levée du plafond technique (quota Gemini gratuit,
indexation hadith/tafsir manquante).

**Étape A — page d'accès/abonnement (à faire en premier, rapide)**
- [ ] Nouvelle page `/assistant/abonnement` (ou fusionnée dans
      `AssistantPage.tsx` en état verrouillé pour qui n'est pas abonné) :
      présente la fonctionnalité, deux boutons ("Payer avec Wave" / "Payer
      par carte") avec le tarif dans la devise correspondante (FCFA / EUR
      ou USD) — nécessite 6.0 au moins en version minimale. Pour valider
      l'intérêt sans tout construire d'un coup, on peut démarrer avec
      seulement l'un des deux (Wave, l'audience prioritaire) et une
      activation manuelle à réception du paiement, le temps de confirmer
      la demande, puis ajouter Stripe et l'automatisation complète une fois
      l'intérêt confirmé.
- [ ] Remplacer l'accès actuel à `/assistant` par cet état verrouillé pour
      les non-abonnés, en gardant `health`/`stats` publics comme
      aujourd'hui.
- [ ] Suivre le nombre de clics/conversions sur cette page (analytics déjà
      en place) — c'est la vraie mesure de validation avant d'aller plus
      loin.

**Étape B — une fois l'intérêt confirmé**
- [ ] Finaliser l'automatisation des deux webhooks (Wave + Stripe) et le
      planificateur de renouvellement Wave (6.0) pour activer/désactiver
      l'accès sans intervention manuelle, quel que soit le moyen de
      paiement choisi.
- [ ] Lever le vrai plafond technique : arbitrer entre passer sur un plan
      Gemini payant (débloque le quota de 1000 embeddings/jour) ou
      revenir sur Ollama en local si des ressources machine deviennent
      disponibles (les deux providers existent déjà, voir
      `apps/api/src/modules/ai/README.md`).
- [ ] Terminer l'indexation manquante (hadith, tafsir) une fois le quota
      débloqué — actuellement partielle par contrainte de quota, pas par
      choix produit.
- [ ] Décider un modèle d'usage pour les abonnés (illimité vs quota
      généreux) et un palier gratuit limité (ex. 5 questions/jour) pour
      laisser goûter la fonctionnalité sans abonnement — bon levier de
      conversion.

### 6.2 API publique en lecture seule, payante (M/L)

**Surface de l'API — ce qu'on rend disponible.** Le principe : tout le
contenu déjà public sur le site, structuré en ressources REST propres,
plus une nouveauté que peu d'API concurrentes proposent (horaires de
prière/Qibla, calcul pur, sans souci de droits). Rien qui touche aux
données d'un utilisateur, même avec une clé payante.

| Ressource | Endpoints | Détail |
|---|---|---|
| **Coran** | `GET /v1/quran/surahs`, `/v1/quran/surahs/{n}`, `/v1/quran/surahs/{n}/verses/{v}` | Texte arabe, translittération, métadonnées de sourate (nom, lieu de révélation, nb de versets) |
| **Traductions** | `GET /v1/quran/translations`, `/v1/quran/surahs/{n}/verses/{v}/translations?lang=fr` | Une par langue/édition disponible ; **chaque objet retourné inclut son attribution/licence** (traducteur, source) — jamais une traduction seule sans sa provenance |
| **Tafsir** | `GET /v1/tafsir/works`, `/v1/tafsir/works/{id}/verses/{n}:{v}` | Éditions disponibles + contenu verset par verset |
| **Hadith** | `GET /v1/hadith/collections`, `/v1/hadith/collections/{slug}/books`, `/v1/hadith/collections/{slug}/hadiths/{n}` | Les 6 recueils canoniques + Muwatta/Riyad as-Salihin, avec gradation d'authenticité |
| **Fiqh** | `GET /v1/fiqh/topics`, `/v1/fiqh/topics/{slug}/positions`, `/v1/fiqh/schools` | Positions par école, toujours présentées côte à côte (jamais une seule "vérité") |
| **Concepts** | `GET /v1/concepts`, `/v1/concepts/{slug}` | Encyclopédie (Tawhid, Salah, Zakat...) |
| **Savants / Prophètes / Histoire** | `GET /v1/scholars(/{slug})`, `/v1/prophets(/{slug})`, `/v1/history/periods`, `/v1/history/events` | Biographies, chronologie sourcée |
| **Duas** | `GET /v1/duas/categories`, `/v1/duas/categories/{slug}/duas` | Texte arabe, translittération, traduction, référence source |
| **Bibliothèque** | `GET /v1/library/books(/{slug})` | Métadonnées des ouvrages (pas le texte intégral des œuvres classiques externes) |
| **Horaires de prière / Qibla** | `GET /v1/prayer-times?lat=&lng=&method=`, `GET /v1/qibla?lat=&lng=` | Calcul pur (adhan), aucune question de droits — bon argument de différenciation vs les API Coran classiques |
| **Recherche** | `GET /v1/search?q=` | Réservée aux paliers payants (Starter/Pro) — c'est l'endpoint le plus coûteux en base, pas raisonnable en accès gratuit illimité |

**Explicitement exclu, même en Pro** : tout endpoint d'écriture, les
données utilisateur (favoris/notes/collections), l'authentification, la
modération/admin, et l'assistant IA (produit séparé, section 6.1 — voir
piste future ci-dessous).

**Conventions transverses à poser dès le départ** (un contrat public est
difficile à changer après coup) :
- [ ] Versionner dès le premier jour (`/v1/...`) même sans plan de v2
      immédiat — un changement cassant sans version serait le pire signal
      possible envoyé aux premiers développeurs intégrateurs.
- [ ] Enveloppe de réponse cohérente sur tous les endpoints
      (`{ data, meta }`, format d'erreur unique) plutôt qu'un format ad hoc
      par ressource — actuellement chaque contrôleur interne renvoie sa
      propre forme, à harmoniser spécifiquement pour la surface publique.
- [ ] Pagination cohérente sur les listes volumineuses (versets, hadiths) —
      `?page=&limit=` avec un maximum raisonnable par page.
- [ ] CORS ouvert (contrairement à l'API interne) puisque l'usage visé
      inclut des frontends tiers, pas seulement des intégrations serveur.
- [ ] En-têtes de quota (`X-RateLimit-Remaining`, `X-RateLimit-Reset`) sur
      chaque réponse pour que le développeur suive sa consommation sans
      appel dédié.
- [ ] Vérifier explicitement, traduction par traduction, que les droits
      couvrent bien une **redistribution via API** (pas seulement un
      affichage sur le site — les deux usages n'ont pas toujours les mêmes
      conditions) avant de l'inclure dans la surface publique ; exclure
      celles qui ne le permettent pas plutôt que de deviner.
- [ ] Piste future (hors scope initial, dépend de 6.1) : exposer une
      version "RAG-as-a-service" de l'assistant IA via l'API, une fois le
      plafond Gemini levé — probablement un palier encore au-dessus de Pro
      vu le coût par requête nettement plus élevé qu'une simple lecture en
      base.

**Paiement** : réutilise intégralement l'infra de 6.0, pas une deuxième
intégration Wave/Stripe séparée — un développeur choisit son moyen de
paiement exactement comme pour l'abonnement IA (6.1), juste sur une page
dédiée à l'API plutôt qu'à l'assistant. Un développeur africain qui
intègre l'API paie par Wave, un développeur/une entreprise à l'étranger
paie par carte via Stripe — même mécanique, même table `subscriptions`.

**[~] Décision : grille tarifaire de départ** (à ajuster selon les
retours réels, pas figée) :

| Palier | Quota | Prix indicatif | Contrainte |
|---|---|---|---|
| Free | 100 req/jour | Gratuit | Attribution obligatoire (lien myQurandeen visible) |
| Starter | 10 000 req/jour | ~5 000 FCFA / ~8€ par mois | Sans obligation d'attribution |
| Pro | 100 000 req/jour | ~25 000 FCFA / ~40€ par mois | + support prioritaire |

- [ ] Un même utilisateur doit pouvoir cumuler un abonnement IA **et** un
      abonnement API en même temps (deux produits distincts) — donc la
      table `subscriptions` de 6.0 ne doit **pas** avoir de contrainte
      unique sur `userId` seul, mais sur `(userId, plan)` : un seul
      abonnement actif par plan à la fois, plusieurs plans différents
      actifs possibles pour la même personne.
- [ ] `plan` prend des valeurs dédiées à l'API (`api_free`, `api_starter`,
      `api_pro`), distinctes de celles de l'IA (`ai_monthly`) — même table,
      même `SubscriptionGuard`, valeurs différentes selon le produit.
- [ ] Page `/developers` : tableau de bord clé API (génération, quota
      consommé aujourd'hui, régénération/révocation) + section abonnement
      qui réutilise les mêmes composants de paiement Wave/Stripe que
      `/assistant/abonnement` (à factoriser en composants partagés dès le
      départ, pas dupliqués entre les deux pages).
- [ ] Passage Free → payant : relève le quota de la clé API existante en
      place, pas besoin d'en régénérer une nouvelle (moins de friction,
      les intégrations existantes du développeur continuent de marcher).
- [ ] Facturation à paliers fixes mensuels pour démarrer (plus simple à
      livrer) plutôt qu'à l'usage/dépassement — Stripe permet du "metered
      billing" nativement si ça devient pertinent plus tard, mais ça
      complexifie l'intégration webhook ; à ne considérer que si la
      demande le justifie. Cette option n'existe de toute façon pas côté
      Wave (paiement ponctuel, pas de facturation variable).
- [ ] Documentation API publique (OpenAPI/Swagger — NestJS l'expose déjà
      probablement en interne vu `@ApiTags`/`@nestjs/swagger` déjà utilisés
      partout, à exposer publiquement sur une route dédiée type `/docs`).
- [ ] Système de clé API (`api_keys`, section 6.0) : génération depuis
      l'espace développeur, régénération/révocation en self-service.
- [ ] Middleware de comptage d'usage par clé (Redis si le volume le
      justifie un jour, sinon un simple compteur Postgres avec reset
      quotidien suffit pour démarrer — cohérent avec le choix du projet de
      ne pas ajouter Redis/ES tant que ce n'est pas justifié).
- [ ] SDK/exemples minimalistes (curl + un exemple JS) sur la page
      développeurs pour réduire la friction d'adoption.
- [ ] Cette API, une fois publique, devient elle-même un levier de
      croissance (section 2) : chaque développeur qui l'utilise cite
      probablement le projet.

---

## Notes de suivi

- Cocher les cases au fur et à mesure directement dans ce fichier
  (`git commit` normal) pour garder une trace de l'avancement dans
  l'historique du dépôt.
- Les points marqués `[~]` sont des décisions produit/business à trancher
  avant de commencer le chantier correspondant — pas des tâches techniques.
- Ce document n'a pas vocation à être exhaustif à vie : à réviser/réordonner
  au fil de l'eau plutôt que suivi rigidement du haut vers le bas.
