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

### 0.1 Rate limiting (S/M) — ✅ audit fait le 2026-09-01

**Contexte** : `@nestjs/throttler` était déjà utilisé (ex. `/ai/query` à
15/min, `/ai/index` à 3/min) **et une limite globale existait déjà**
(`ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])` dans
`app.module.ts`, 120 req/min/IP par défaut) — contrairement à ce que ce
document supposait. L'audit a donc porté sur les trous restants plutôt que
sur une mise en place complète.

- [x] Limite globale déjà en place (120/min/IP), vérifiée.
- [x] Audit des contrôleurs publics : tous cachés en mémoire
      (`CacheInterceptor`) sauf `learning` (mélange volontairement contenu
      public + progression par utilisateur dans le même contrôleur — ne pas
      ajouter `CacheInterceptor` au niveau contrôleur ici, ça mettrait en
      cache la progression d'un utilisateur pour un autre).
- [x] `search` : limite dédiée à 30/min (`search.controller.ts`) — c'était
      bien le seul endpoint public sans limite spécifique et coûteux.
- [x] **Trouvé en marge de l'audit et corrigé** : `SearchService.search()`
      lançait 12 requêtes SQL en parallèle par appel (2×`Promise.all`). Le
      pool Postgres partagé par toute l'API est borné à 15 connexions
      (`DatabaseModule`) — 2 recherches simultanées suffisaient à le
      saturer et faisaient échouer en cascade **le reste de l'API**, pas
      seulement la recherche (`EMAXCONNSESSION`). Corrigé par un semaphore
      partagé (`Semaphore`/`withConcurrencyLimit` dans `search.service.ts`,
      6 requêtes concurrentes max, tous appels confondus) — vérifié en
      conditions réelles : 16 recherches simultanées sans aucune erreur.
- [x] Incohérence trouvée sur `/auth` : `forgot-password`/
      `resend-verification` (qui *demandent* un token) étaient limités à
      5/min, mais `verify-email`/`reset-password` (qui le *consomment*) ne
      l'étaient pas du tout. Alignés à 5/min également.
- [x] `/notifications/test` (envoie un vrai push externe) limité à 5/min —
      n'avait pas de limite dédiée.
- [ ] Reste à faire : limite dédiée sur les endpoints d'écriture
      utilisateur (notes, bookmarks, collections) si le comportement en
      production le justifie — laissés au défaut global (120/min) pour
      l'instant, pas de signal d'abus observé.
- [ ] Documenter les limites choisies dans `apps/api/README.md` ou un doc
      dédié, pour que l'équipe API publique (phase 6) parte d'une base
      claire.

### 0.2 Bundle JS principal (~750 Ko) (M) — ✅ fait le 2026-09-01

**Contexte** : le dernier build montrait un chunk `index-*.js` de 752 Ko
(gzip 222 Ko) alors que le reste était déjà bien scindé par page
(`React.lazy` par route). Ce chunk pèse sur le LCP/TTI mobile, donc sur le
SEO (Core Web Vitals) et le taux de conversion des nouveaux visiteurs.

- [x] Visualisation du bundle : `rollup-plugin-visualizer` était déjà
      câblé (`ANALYZE=1 npm run build -w apps/web` → `dist/stats.html`),
      pas besoin de l'ajouter.
- [x] **Cause principale trouvée, sans rapport avec le decoupage de
      chunks** : le `.env` racine (partagé avec l'API) contient
      `NODE_ENV=development`. Vite le lit aussi via `envDir` (pointé sur la
      racine du repo) et `vite build` livrait donc le **bundle
      développement de React** (React DOM dev + `react/jsx-dev-runtime`,
      normalement jamais expédié en production). À lui seul, ce point
      représentait ~230 Ko du chunk principal. Comme `.env` est ignoré par
      git, tout contributeur ou déploiement auto-hébergé qui copie
      `.env.example` (qui a le même `NODE_ENV=development`) reproduirait le
      bug — corrigé de façon durable et multiplateforme via `cross-env` :
      `"build": "tsc -b && cross-env NODE_ENV=production vite build"`
      (`apps/web/package.json`), indépendant de tout `.env` ambiant.
- [x] `manualChunks` de `vite.config.ts` (forme objet) ne capturait pas
      `react-dom` du tout : ses sous-modules CJS
      (`react-dom-client.production.js` etc., empaquetés via des modules
      virtuels `?commonjs-*`) ne matchaient pas le nom de paquet tel quel et
      restaient dans le chunk principal. Remplacé par la forme fonction
      (`manualChunks(id) { if (id.includes(...)) return "vendor-react" }`),
      qui matche le chemin complet de façon fiable.
- [x] `canvas-confetti` (~7 Ko gzip) chargé par `CelebrationHost.tsx` (monté
      une fois dans `AppLayout`, donc sur chaque page) alors que la
      confetti ne se déclenche que sur un événement de célébration, rare —
      passé en `import()` dynamique, chargé à la demande seulement.
- [x] **Résultat mesuré** : chunk principal 752,55 Ko → **430,92 Ko**
      (gzip 222,56 Ko → **137,10 Ko**), soit **-43% / -38%**. Plus aucun
      chunk au-dessus du seuil d'alerte de 500 Ko (donc rien à ajuster sur
      `chunkSizeWarningLimit`).
- [ ] Reste à faire si besoin plus tard : regrouper d'autres libs tierces
      stables partout utilisées (i18next, tailwind-merge, sonner, le
      cluster radix-ui/floating-ui) dans un chunk vendor dédié — gain de
      cache sur les futurs déploiements (pas de re-téléchargement si ces
      libs ne changent pas), pas un gain de poids au premier chargement.
      Non fait ici : effort/risque plus élevé pour un gain différent de
      celui visé (LCP au premier chargement, déjà résolu).
- [ ] Mesurer avec Lighthouse (mobile, réseau throttled) sur le site
      déployé pour confirmer le gain concret sur LCP/TBT en conditions
      réelles (fait ici uniquement via la taille des fichiers, pas un
      profil Lighthouse complet).

### 0.3 Couverture de tests (L, continu)

**Contexte** : rythme de développement élevé (plusieurs fonctionnalités par
session) sans filet de tests automatisés visible — risque de régression
silencieuse qui grandit avec la taille du code.

- [x] Décider du socle : `vitest` (cohérent avec l'écosystème Vite déjà en
      place côté web) côté frontend, `jest` (déjà configuré par défaut
      NestJS) côté API. Pas besoin de `@testing-library/react` pour
      l'instant : on cible les helpers purs, pas les composants UI.
- [x] Prioriser par risque plutôt que par exhaustivité :
  - [x] Backend : les helpers purs à haut risque de régression silencieuse
        (`localClock`, `minutesSince`, `alreadySentToday`, `GRACE_MINUTES`)
        extraits de `reminder-scheduler.service.ts` vers
        `scheduling-logic.ts` (testables sans tirer NestJS/ESM) et couverts.
  - [~] Backend : les DTOs de validation et le calcul RBAC (permissions) —
        non couverts pour l'instant (RAZ dépend du socle, à compléter).
  - [x] Frontend : les utilitaires purs (`splitBasmala`,
        `withShareUtm`/`buildOgImage`, `computePrayerTimes`/
        `computeQiblaDirection`/`nextPrayer`).
- [x] Ajouter un job CI (GitHub Actions) qui fait tourner `typecheck` +
      `lint` + les tests sur chaque PR — l'étape `Tests` (`npm run test`)
      a été ajoutée à `.github/workflows/ci.yml`.
- [x] Fixer une règle simple pour la suite : toute nouvelle fonction pure
      non triviale (calcul de date, calcul financier, parsing) doit
      s'accompagner d'un test — pas d'objectif de couverture globale
      arbitraire, plutôt une discipline sur le code neuf.

---

## Phase 1 — Gains rapides

### 1.1 Verset/hadith du jour en page d'accueil (S/M) — ✅ fait le 2026-09-02

- [x] Backend : un seul endpoint `GET /daily` renvoyant `{ verse, hadith }` —
      sélection déterministe par hachage de la date UTC ("AAAA-MM-JJ")
      modulo le nombre total de versets/hadiths (`count(*)`, puis
      `ORDER BY id LIMIT 1 OFFSET index` — stable d'un appel à l'autre pour
      un jeu de données inchangé, pas besoin d'un ordre "naturel"). Nouveau
      module `apps/api/src/modules/daily/`, public, mis en cache comme le
      reste du contenu de référence (`CacheInterceptor`, TTL global 1h).
- [x] Frontend : `DailyContentSection` sur `HomePage.tsx`, sous la barre de
      recherche. Réutilise `PageMeta`/`buildOgImage` (image OG dynamique
      = verset du jour) et `ShareButton`/`ShareCard` existants pour le
      partage — aucune nouvelle brique de partage à construire.
- [x] i18n : `home.dailyVerse.label`/`home.dailyHadith.label`, fr/en.
- [x] Vérifié en direct : contenu réel affiché (Yusuf 12:21 + un hadith
      Abu Dawud lors du test), lien vers la page du verset/hadith correct,
      balise `og:image` reflétant bien le verset du jour.
- [ ] Option ultérieure, non faite : alterner verset/hadith/dua/concept par
      jour de la semaine pour varier le contenu affiché.

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

### 1.4 Taille de police Arabe réglable (S) — ✅ fait le 2026-09-01

- [x] Contrôle utilisateur : 5 paliers prédéfinis (85/100/115/130/150%),
      boutons -/+ plutôt qu'un slider (plus simple, pas de gain réel pour 5
      valeurs discrètes). Persisté en `localStorage`
      (`ArabicFontSizeProvider`, même pattern que `ThemeProvider`), appliqué
      via une variable CSS (`--arabic-font-scale`) posée sur `<html>` dès le
      montage de l'app (`AppProviders`) — pas seulement pendant que la page
      sourate est affichée.
- [x] **Ajustement par rapport au plan initial** : plutôt qu'une classe
      `font-arabic` globalement réglable (qui aurait aussi fait grossir les
      noms arabes courts affichés un peu partout - savants, concepts,
      prophètes...), la variable est lue via `arabicFontSizeStyle(baseRem)`
      appliquée explicitement sur les 5 éléments de lecture visés
      (`SurahDetailPage` et `VersePage` : verset + basmala,
      `HadithDetailPage`, `HadithChapterPage`, `SearchPage`), chacun gardant
      sa propre taille de base (verset isolé plus grand qu'une liste de
      versets, etc.) multipliée par le même réglage global.
- [x] Bouton accessible sur la page de sourate, à côté du sélecteur de
      tafsir/traduction — pas dans un réglage de profil.
- [x] Vérifié en direct : bascule 100%→130% sur la page de sourate, persiste
      en naviguant vers un verset isolé et une page de hadith (mêmes
      tailles de base préservées, juste multipliées) ; confirmé que les
      noms arabes décoratifs (ex. nom d'un savant) ne bougent pas.

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

- [x] Nouvel endpoint API `GET /quran/export` (texte Arabe + translittération
      en une requête) + `GET /quran/export/translations/:id` pour les
      traductions, évitant 114+ requêtes individuelles.
- [x] Stockage côté client : IndexedDB via **Dexie** (`offline-db.ts`) — un
      store global par entité (`surahs`, `verses`, `translations`,
      `metadata`).
- [x] UI : bouton "Télécharger pour hors-ligne" (onglet "Hors-ligne" du
      profil) avec barre de progression, sélection des traductions et
      indicateur de taille estimée avant confirmation.
- [x] Adapter les hooks de lecture (`quranApi.getSurah`, etc.) pour lire
      depuis IndexedDB quand le réseau est indisponible
      (`useOffline` + fallback sur `navigator.onLine`).
- [x] Gestion de mise à jour : `GET /quran/export/version` comparée à la
      version stockée localement (`quran-version`) — signale un cache à
      rafraîchir quand le contenu serveur change.
- [~] Tester explicitement le scénario "mode avion" de bout en bout avant
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

**Dépendance** : s'appuie sur le module horaires de prière (`prayer-times`,
calcul `adhan`) ; la position est définie par la ville choisie par
l'utilisateur via la recherche (voir 2.x — plus de géolocalisation).

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

**[~] Décisions tranchées** :
1. Récitateurs : **plusieurs dès le lancement** — 5 récitateurs importés
   (Alafasy, Husary, Minshawi, Maher Al-Muaiqly, Abdul Basit), éditions
   librement distribuables du CDN Al Quran Cloud (Islamic Network).
2. Hébergement : **CDN externe** — on ne stocke que les URLs
   (pattern `https://cdn.islamic.network/quran/audio/{bitrate}/{edition}/{ayahGlobal}.mp3`),
   pas les fichiers ; stockage objet jugé non nécessaire au lancement.
3. Granularité : **par verset** (numéro de verset global 1..6236) — lecture
   continue verset à verset + mise en avant possible du "verset du jour".

- [x] Trancher les 3 décisions ci-dessus.
- [x] Schéma : table `quran_verse_audio` (verseId, reciterId, url, durée) +
      table `quran_reciters` (nom, style de récitation, source/licence).
- [x] Script d'import idempotent (upsert des récitateurs par slug, calcul des
      offsets globaux, insert par lots — pas de doublons en cas de reprise).
- [x] Backend : `GET /quran/reciters` + `GET /quran/surahs/:number/verses/:verseNumber/audio`
      (publics, cache HTTP actif).
- [x] Frontend : lecteur audio inline (composant `AudioRecitation`) sur
      `VersePage`/`SurahDetailPage` — lecture en continu (verset suivant
      automatique), boutons précédent/suivant, sélecteur de récitateur
      persisté en localStorage, utilisable au clavier/lecteur d'écran.
- [ ] Téléchargement hors-ligne de l'audio : à articuler avec le cache
      hors-ligne texte (3.2), mais séparément (l'audio est nettement plus
      lourd, ne doit pas être inclus par défaut dans le téléchargement
      "texte complet").
- [x] Sélecteur de récitateur actif dès le lancement (5 récitateurs) —
      schéma prévu pour en ajouter d'autres, import idempotent.

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
