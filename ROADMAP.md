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
- [x] Limite dédiée ajoutée sur les endpoints d'écriture utilisateur
      (notes/bookmarks à 30/min, collections à 20/min, `last-read` à
      30/min, `streaks/ping` et `gamification/events` à 60/min) —
      défensives, mises en place sans signal d'abus observé
      (`user-data`/`streaks`/`gamification` controllers).
- [x] Documenter les limites choisies dans `apps/api/README.md` (tableau
      complet par route, mécanisme, principes + note pour la future API
      publique de la phase 6).
- [x] **Récidive trouvée et corrigée le 2026-09-03** (signalée par Google
      Search Console : "le sitemap est un fichier HTML" / sous-sitemaps
      irrécupérables) : `SitemapService.generatePart("static")` déclenchait
      **16 requêtes SQL en parallèle** par appel (les 6 requêtes communes à
      "quran"/"hadith" **en plus** de ses 10 requêtes propres, toutes
      calculées à chaque appel quel que soit le `part` demandé) — largement
      au-dessus du pool Postgres (15 connexions), `EMAXCONNSESSION`
      systématique. Corrigé en deux temps : (1) chaque sous-sitemap ne
      charge plus que les tables dont il a réellement besoin (`static` :
      10 requêtes au lieu de 16 ; `quran`/`hadith` inchangés à 2-3) ; (2) le
      semaphore partagé de `SearchService` (`Semaphore`/
      `withConcurrencyLimit`, 6 requêtes concurrentes max) a été extrait vers
      `common/concurrency/db-query-semaphore.ts` et réutilisé par
      `SitemapService` — un seul semaphore **partagé par toute l'API**
      plutôt qu'une limite locale par service, cohérente avec la note
      d'origine de ce fix (deux services bornés indépendamment pourraient
      quand même cumuler assez de connexions pour saturer le pool). Vérifié
      en conditions réelles : `/sitemap.xml` + les 3 sous-sitemaps répondent
      200 de façon fiable, y compris en rafales concurrentes (5 requêtes
      simultanées, répété plusieurs fois). Tests ajoutés
      (`db-query-semaphore.spec.ts`).
- [x] **Deuxième correction le 2026-09-03** (Search Console, nouveau
      signalement après la première correction ci-dessus) :
      `sitemap-data/hadith.xml` (~33 500 URLs, 3,5 Mo) mettait ~9s à se
      générer sur l'instance Render gratuite - au-delà du délai d'attente du
      crawler de Google ("impossible de récupérer le sitemap" alors même que
      la réponse finissait par arriver). `SitemapController` mis en cache
      comme le reste du contenu de référence (`CacheInterceptor`, TTL global
      1h déjà défini dans `AppModule`) : seule la toute première requête
      après un redémarrage/expiration paie ce coût, les suivantes (dont les
      nouvelles tentatives de Google) sont quasi instantanées (~10-15ms au
      lieu de plusieurs secondes, vérifié en local). Réduit aussi
      mécaniquement la pression sur le pool Postgres partagé, en plus du fix
      précédent.
- [x] **Cause racine trouvée en creusant les deux fix ci-dessus** : le
      `pg.Pool` de `DatabaseModule` n'avait **aucun écouteur sur son
      événement `error`** - un `EventEmitter` Node sans écouteur sur
      `error` relance l'erreur en exception non rattrapée, ce qui **fait
      planter tout le processus** (comportement documenté de `pg`/
      `pg-pool`, pas un bug applicatif). Observé en conditions réelles
      pendant cette investigation : crash complet de l'API en dev (log
      `Unhandled 'error' event` / `Connection terminated unexpectedly`) et
      502 intermittents en prod (Render redémarrant le processus) - ce qui
      explique aussi pourquoi le cache du fix précédent semblait "ne pas
      tenir" (un redémarrage vide le cache mémoire). Corrigé par
      `pool.on("error", ...)` dans `database.module.ts` (log + pas de
      crash) - la charge du sitemap (plusieurs requêtes en rafale) rendait
      ce risque latent bien plus probable, mais le problème concernait
      potentiellement **toute l'API**, pas seulement le sitemap.

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
- [x] Regroupement des autres libs tierces stables dans des chunks vendor
      dédiés (`vendor-i18n`: i18next/react-i18next, `vendor-ui`:
      tailwind-merge/clsx/cva/sonner/radix-ui/floating-ui/lucide,
      `vendor-forms`: react-hook-form/hookform/zod, `vendor-query`:
      @tanstack/react-query) — gain de cache sur les déploiements futurs
      (pas de re-téléchargement si ces libs ne changent pas), pas un gain
      de poids au premier chargement. Résultat mesuré : chunk principal
      `index` à 177 Ko (gzip 57 Ko), tous les chunks sous 500 Ko.
- [ ] Mesurer avec Lighthouse (mobile, réseau throttled) sur le site
      déployé pour confirmer le gain concret sur LCP/TBT en conditions
      réelles (fait ici uniquement via la taille des fichiers, pas un
      profil Lighthouse complet).
- [x] **Trouvé en marge et corrigé** : le build web ne passait plus (`tsc`
      bloquait) sur 3 erreurs préexistantes d'une fonctionnalité en cours
      ("reprendre où j'en étais", 1.2) et d'une page learning :
      `ResumeReading.tsx` et `useRecordLastRead.ts` importaient `React`/
      `useMutation` sans les utiliser, et `LearningLessonPage.tsx`
      utilisait `useEffect` sans l'importer. Corrigé — le build
      (`npm run build -w apps/web`) recompile à nouveau.

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
  - [x] Backend : les DTOs de validation et le calcul RBAC (permissions) —
        couverts (voir 0.5).
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

### 0.4 Row-Level Security Postgres (Supabase) — ✅ fait le 2026-09-02

**Contexte** : alerte Supabase (hors roadmap initiale, remontée directement
par le tableau de bord) — **les 70 tables du schéma `public` avaient RLS
désactivée**. Supabase provisionne automatiquement une API REST
(PostgREST) pour chaque projet, accessible avec la clé publique `anon` :
sans RLS, n'importe qui connaissant l'URL du projet + cette clé pouvait
lire/modifier/supprimer **toutes les données de toutes les tables**
(`users.password_hash` compris) via cette API, entièrement en dehors du
backend NestJS et de son authentification/RBAC.

- [x] Vérifié avant toute action : le rôle de connexion de l'app
      (`postgres`, utilisé par `DATABASE_URL`) a `rolbypassrls = true` —
      activer RLS ne casse donc rien côté application (confirmé par un
      test de lecture réel après migration).
- [x] Ajouté `.enableRLS()` (API native de `drizzle-orm` depuis peu,
      `pgTable(...).enableRLS()`) sur les 70 définitions de table, dans les
      24 fichiers de `apps/api/src/database/schema/` — via un script AST
      (`typescript` compiler API) plutôt qu'un regex, pour ne pas se faire
      piéger par les parenthèses imbriquées dans les colonnes générées
      (ex. `quranVerses.textSearch`).
- [x] Migration générée par `db:generate` (70 `ALTER TABLE ... ENABLE ROW
      LEVEL SECURITY`, une par table, aucune autre modification) et
      appliquée. Volontairement **aucune policy ajoutée** : RLS activée
      sans policy = accès totalement bloqué pour les rôles `anon`/
      `authenticated` de PostgREST, exactement le comportement voulu
      puisque l'app n'utilise jamais cette API (aucune clé Supabase
      cliente dans le projet, uniquement une connexion Postgres directe).
- [x] Vérifié en conditions réelles : 0/70 table sans RLS après migration,
      lecture normale toujours fonctionnelle (`quran_verses`, 6236 lignes),
      endpoints publics (`/quran/surahs`, `/hadith/collections`, `/daily`,
      `/search`) et protégés (`/auth/me`) inchangés.
- [ ] Si l'app adopte un jour l'API PostgREST/Supabase Auth pour un usage
      réel (actuellement non prévu), il faudra alors écrire de vraies
      policies par table plutôt que le blocage total actuel.

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

### 1.2 "Reprendre où j'en étais" (S/M) — ✅ fait le 2026-09-03

**Contexte** : `useStreakPing`/`useGamificationEvent` trackent déjà la
lecture (`verse_read`) — vérifier s'il existe déjà une table de dernière
position avant de dupliquer un mécanisme.

- [x] Vérifier l'existant (`user_streaks`, `user_daily_actions`) : aucune
      trace de "dernier contenu consulté" réutilisable — on crée la
      table dédiée.
- [x] Nouvelle table `user_last_read` (`user-data.ts`) : userId, targetType,
      targetId, updatedAt — une seule position par (userId, targetType) via
      contrainte unique, mise à jour (upsert) à chaque lecture verse/hadith/
      leçon.
- [x] Endpoints `POST /user-data/last-read` (enregistre/écrase la position
      du type) et `GET /user-data/last-read?limit=` (les 3 plus récentes,
      résolues en titre + lien via `resolveTargets`).
- [x] Widget `ResumeReading` sur la page d'accueil (visiteur connecté) :
      "Reprendre : Al-Baqara, verset 45" avec lien direct, 2-3 positions
      récentes.
- [x] Cas limite multi-types : **une position par type de contenu**
      (recommandation de la roadmap) — lecture d'un verset puis d'une leçon
      garde les deux, affichage des 2-3 plus récentes. DTO validé dans
      `dto.spec.ts`.
- [x] **Bug trouvé et corrigé le 2026-09-04** : la clé i18n
      `home.resumeReading.label` n'existait dans aucune des deux locales
      (`fr.json`/`en.json`) — le libellé de la section affichait donc la clé
      brute au lieu du texte traduit. Ajoutée dans les deux fichiers.

### 1.3 Page "Pourquoi myQurandeen" (S) — ✅ fait le 2026-09-02

- [x] Nouvelle page `/about` (slug anglais, cohérent avec `/quran`,
      `/schools`... déjà tous des noms anglais malgré une UI en français par
      défaut), contenu i18n complet (fr/en) : 5 sections — gratuit et
      sans publicité (mesure d'audience sans cookie), sources vérifiables
      systématiques, l'IA qui n'invente rien, neutralité sur les sujets de
      divergence, open-source (licence MIT). Liens sortants vers le dépôt
      GitHub et `CONTRIBUTING.md`.
- [x] Nouveau composant `Footer.tsx` (n'existait pas du tout avant),
      rendu sur tout le site via `AppLayout` : lien vers `/about` + GitHub —
      plus seulement accessible par URL directe. Positionné pour ne jamais
      chevaucher la barre de navigation mobile fixe (`BottomNav`).
- [ ] Réutiliser cette page comme pitch pour les partenariats
      (mosquées/assos) et comme contenu de référence pour la présence
      réseaux sociaux (phase 2) — pas fait ici, dépend de ces chantiers.

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

### 1.5 Gestion du vendredi (jumu'a) (S) — ✅ fait le 2026-09-04

**Contexte** : le contenu pédagogique du site indique déjà que la prière du
vendredi (jumu'a) remplace exceptionnellement le dhuhr ce jour-là
(`learning-seed.ts`), mais rien dans le module horaires de prière/
notifications n'en tenait compte — le dhuhr du vendredi était traité comme
un jour normal.

- [x] Page horaires de prière : le créneau dhuhr affiche "Jumu'a" (au lieu
      de "Dhuhr") le vendredi, avec une note "Remplace le dhuhr ce
      vendredi" — même logique reprise pour la carte "prochaine prière".
      Détection par le jour local du navigateur (`now.getDay() === 5`),
      cohérent avec le reste de la page qui calcule déjà tout côté client.
- [x] Notification dhuhr : `PrayerAlertSchedulerService` envoie un titre
      ("Jumu'a") et un texte dédiés le vendredi (rappelle au passage deux
      sunnah largement établies : lecture de la sourate Al-Kahf, salawat
      sur le Prophète ﷺ), dans les 8 langues déjà supportées. Détection par
      `clock.dayOfWeek` (fuseau local de l'utilisateur, déjà calculé par
      `localClock()` pour l'anti-doublon).
- [x] Bannière "C'est vendredi !" sur la page d'accueil (même gabarit que
      la bannière Ramadan), lien direct vers la sourate Al-Kahf
      (`/quran/18`) — présentée comme le reste du contenu pédagogique du
      site (fait largement établi, sans citation de hadith précise
      attachée, aucune correspondance trouvée dans le corpus hadith importé
      pour ce fait spécifique).
- [x] Vérifié en direct (le jour de la vérification tombait justement un
      vendredi) : bannière accueil + lien vers Al-Kahf, libellé "Jumu'a" et
      note sur la page horaires de prière, carte "prochaine prière" passant
      correctement à Asr une fois l'heure du jumu'a dépassée.

---

## Phase 2 — SEO & distribution

### 2.1 SEO sur les pages de contenu (M/L) — ✅ fait le 2026-09-03 (sauf soumission Search Console/Bing, nécessite ton compte)

**Contexte** : `PageMeta`/`buildOgImage` existent déjà et couvrent
title/description/OG/Twitter. Il manque la couche indexation/données
structurées.

- [x] `sitemap.xml` généré dynamiquement (endpoint API) couvrant toutes les
      pages de contenu indexables : versets, sourates, hadiths, concepts,
      savants, sujets de fiqh, livres, prophètes, événements historiques.
      Shardé en sous-sitemaps (`static`/`quran`/`hadith`, < 50 000 URL chacun,
      volume actuel ~6 200 versets + ~33 500 hadiths) + index racine, servis
      par `/sitemap.xml` et `/sitemap-data/{part}.xml` (rewrite Vercel en
      place). Helpers XML extraits et testés (`sitemap-xml.spec.ts`,
      `sitemap.service.spec.ts`).
- [x] Données structurées JSON-LD (`schema.org`) : `Article`/`CreativeWork`
      pour les pages de contenu (verset, hadith, concept), `BreadcrumbList`
      généré depuis le fil d'Ariane (`breadcrumbs`) via `PageMeta`.
      Infrastructure réutilisable `jsonLd`/`breadcrumbs` + helpers purs
      (`buildBreadcrumbList`, `serializeJsonLd`) testés dans
      `PageMeta.test.ts`.
- [x] **Vérifié : crawlabilité sans JS.** Le site est une SPA 100% rendue
      client (`apps/web/index.html` est un shell vide, `<div id="root">`),
      confirmé volontairement **hors scope** d'un vrai SSR/SSG par un choix
      déjà documenté (commentaire de `middleware.ts`) : le pré-rendu Edge
      existant ne cible QUE les robots d'aperçu de lien (WhatsApp, X,
      Discord...), jamais Googlebot, précisément pour ne pas dégrader
      l'indexation réelle — l'étendre à Googlebot remplacerait un contenu
      riche (texte complet, JSON-LD, fil d'Ariane) par un stub minimal
      titre+description. Confirmé correct : Google exécute fiablement le JS
      des SPA React depuis plusieurs années (Web Rendering Service),
      contrairement à la plupart des robots de partage — d'où la distinction
      déjà faite dans le code. **Risque identifié, spécifique à cet
      hébergement** : l'API tourne sur le **tier gratuit de Render**, qui met
      l'instance en veille après ~15 min d'inactivité (cause déjà connue et
      traitée pour les notifications, voir `reminders/scheduler-run.controller.ts`)
      — si Googlebot crawle une page pendant que l'instance dort, le budget
      de rendu de Google pourrait expirer avant la réponse de l'API et
      indexer une page vide. Le cron externe existant (`POST /reminders/run`,
      cron-job.org) maintient déjà l'instance éveillée s'il tourne à un
      intervalle inférieur à ~15 min — **à vérifier côté tableau de bord
      cron-job.org** (hors du dépôt, je n'y ai pas accès) : si l'intervalle
      configuré est bien de l'ordre de la minute (cohérent avec
      `@Cron(EVERY_MINUTE)` côté code), ce risque est déjà couvert sans rien
      changer.
- [ ] **Reste à faire, nécessite ton propre compte (je n'ai pas d'accès)** :
      soumettre `https://myqurandeen.vercel.app/sitemap.xml` à
      [Google Search Console](https://search.google.com/search-console)
      (Sitemaps → coller l'URL) et à
      [Bing Webmaster Tools](https://www.bing.com/webmasters) (qui alimente
      aussi DuckDuckGo/Yahoo) — les deux exigent une vérification de
      propriété du domaine au préalable. Une fois fait, l'inspection d'URL de
      Search Console confirmerait directement le point ci-dessus (Google
      voit-il le contenu complet ou une page vide ?) — vérification que je
      ne peux pas faire moi-même sans accès à ce compte.
- [x] `robots.txt` vérifié : autorise tout le contenu public, bloque
      `/admin`, `/profile`, `/login`, `/register`, les routes auth et
      marketing de désabonnement (déjà en place).
- [x] **Décidé : pas de balises `hreflang`.** L'architecture actuelle sert
      **une seule URL par contenu** quelle que soit la langue (la traduction
      affichée dépend de la préférence client, jamais encodée dans l'URL —
      confirmé, aucune route `:lang` n'existe dans `router.tsx`) : `hreflang`
      n'a de sens qu'entre plusieurs URLs alternatives pour un même contenu,
      qui n'existent pas ici. Passer à des URLs par langue serait un
      changement structurel majeur (routing, sitemap, liens internes) sans
      bénéfice clair vu que le contenu principal (texte arabe) est identique
      quelle que soit la langue de l'interface — non retenu pour l'instant.

### 2.2 Widget "verset du jour" embarquable (M) — ✅ fait le 2026-09-03

- [x] Nouvelle route publique `/embed/daily-verse` (`EmbedDailyVersePage.tsx`),
      déclarée en dehors de la route `<AppLayout/>` dans `router.tsx` (route
      sœur, pas un enfant) : aucune sidebar/header/footer/nav. Toujours dans
      le même bundle SPA, donc le thème clair/sombre suit automatiquement la
      préférence système du visiteur (`ThemeProvider` inchangé).
- [x] Réutilise l'endpoint `GET /daily` déjà existant (section 1.1 a
      finalement livré un seul endpoint combiné verset+hadith plutôt que
      deux séparés) — aucun changement backend nécessaire pour ce chantier.
- [x] Snippet `<iframe>` prêt à copier-coller (dimensions recommandées
      400×240) ajouté à la page "Pourquoi myQurandeen" avec bouton copier.
- [x] En-tête HTTP ajouté : `Content-Security-Policy: frame-ancestors *;`
      sur `/embed/(.*)` dans `vercel.json`, en plus de la règle de cache
      déjà présente sur `/assets/`. **Non vérifiable en local** (le serveur
      de dev Vite n'applique pas `vercel.json` — à confirmer une fois
      déployé, ex. avec `curl -I https://.../embed/daily-verse`). Le reste
      du site n'a par ailleurs **aucune** protection `X-Frame-Options`
      aujourd'hui (ni avant ni après ce chantier) — durcissement séparé,
      plus large que ce widget, à traiter à part.
- [x] Lien de la carte + lien "myQurandeen →" du widget marqués
      `withShareUtm(..., "widget")` — traçable séparément des autres
      canaux de partage dans les statistiques.
- [ ] Option JS (`<script>` qui injecte le widget sans iframe) — pas fait,
      à ne considérer qu'après un retour d'usage sur la version iframe.
- [ ] Suivre les domaines qui embarquent le widget (referrer côté
      analytics) pour mesurer la traction réelle — pas instrumenté au-delà
      du tag UTM déjà en place.

### 2.3 Automatiser la présence réseaux sociaux (M) — ❌ retirée le 2026-09-03

**Décision utilisateur** : l'automatisation X/Facebook a été **entièrement
retirée** — l'utilisateur préfère publier le verset/hadith du jour **à la main**
via des comptes normaux. Le module `apps/api/src/modules/social/` (services,
planificateur), le schéma `social_posts`, les variables
`TWITTER_*`/`FACEBOOK_*` (`.env.example` + `env.validation.ts`) et la table
`social_posts` en base (migration `0039`) ont été supprimés.

Une implémentation initiale avait été livrée puis testée (utilisation du même
contenu déterministe que `DailyService`/`OgService` de la page d'accueil,
anti-doublon par table unique, chaque plateforme optionnelle sans clé) — mais
elle ne correspondait pas à la méthode de publication souhaitée par
l'utilisateur, d'où son retrait complet. Publication désormais **manuelle** :
copier le contenu du jour affiché sur la page d'accueil vers les réseaux
sociaux de son choix (X, Instagram, Facebook, TikTok...).

---

## Phase 3 — Lecture enrichie

### 3.1 Tajwid coloré (M/L) — ✅ fait le 2026-09-03

**[~] Décision, revue en cours de chantier** : la piste initiale (texte
Tajweed annoté importé, façon Tanzil) a été **écartée après vérification** :
Tanzil.net ne publie en réalité aucun texte tajwid annoté (page absente de
sa doc), et le seul jeu de données libre trouvé avec une couverture complète
vérifiée ([cpfair/quran-tajweed](https://github.com/cpfair/quran-tajweed),
CC BY 4.0, 6236/6236 versets) a un **bug de décalage connu et non résolu**
(issue #2 du dépôt) entre ses positions — calculées sur une copie 2017 du
texte Tanzil "Uthmani + pause/sajda" — et le texte Tanzil actuel :
l'utiliser tel quel aurait produit une coloration **fausse** sur de vrais
versets. L'alternative technique propre (texte déjà balisé de
Quran.com/Quran Foundation) a des conditions d'utilisation qui interdisent
le stockage en base sans accord commercial écrit, en plus d'exiger un
compte développeur. **Décision retenue** : calculer les règles nous-mêmes
par analyse directe de notre propre texte arabe déjà en base (déjà
vérifié, déjà licencié) — élimine à la fois le risque de décalage (aucune
dépendance à un fichier externe) et le risque de licence (règles de
grammaire tajwid publiques, pas une redistribution de données tierces).
Aucun changement de schéma/import nécessaire : tout se calcule côté client,
à l'affichage.

- [x] Nouveau module pur [apps/web/src/features/quran/tajweed.ts](apps/web/src/features/quran/tajweed.ts)
      (`computeTajweedSegments`) : découpe un texte arabe Uthmani en segments
      `{text, rule}` par analyse caractère par caractère (lettres de base vs
      diacritiques/marques décoratives). Couvre noun/tanwin sakinah
      (idgham avec/sans ghunna, iqlab, ikhfa, idhar halqi), mim sakinah
      (ikhfa shafawi, idgham shafawi, idhar shafawi), qalqalah (y compris
      "kubra" en fin de verset), ghunna (chadda sur noun/mim) et lam
      shamsiyya — avec gestion de l'exception "الدنيا" (pas d'idgham à
      l'intérieur d'un même mot) et de l'alif de soutien muet du tanwin fath.
      **Hors scope assumé** : les règles de madd (plusieurs sous-types selon
      le contexte au-delà des limites du mot/verset, risque réel de
      classification fausse si approximées) — à traiter dans une itération
      dédiée.
- [x] 18 tests unitaires ([tajweed.test.ts](apps/web/src/features/quran/tajweed.test.ts))
      sur des chaînes construites à la main, un par règle + cas négatifs +
      invariant de reconstruction (aucun caractère perdu/dupliqué).
- [x] Composant [TajweedText.tsx](apps/web/src/features/quran/TajweedText.tsx)
      (mémoïsé) + interrupteur [TajweedControl.tsx](apps/web/src/features/quran/TajweedControl.tsx)
      avec légende (popover, 9 règles + pastille de couleur) — persisté en
      `localStorage`, partagé entre `SurahDetailPage.tsx` et `VersePage.tsx`.
      Désactivé par défaut.
- [x] Palette de 9 couleurs dédiées (`--tajweed-*` dans `index.css`, variantes
      clair/sombre) — palette propre au projet, pas la reproduction d'un
      code couleur de mushaf existant (il en existe plusieurs, tous
      différents).
- [x] Vérifié en conditions réelles (navigateur, données de production) :
      Al-Fatiha entière (7 versets) — 3 lam shamsiyya sur "الله"/"الرحمن"/
      "الرحيم" (répété), 1 sur "الدين", 1 sur "الصراط", correctement absents
      sur "الحمد"/"لله"/"العالمين"/"المستقيم" (lettres lunaires ou pas
      d'alif précédent) ; Ayat al-Kursi (2:255) — idgham ghunna correct sur
      "سِنَةٌ وَلَا" et "بِشَيْءٍ مِّنْ", idgham sans ghunna correct sur
      "نَوْمٌ ۚ لَّهُ" (à travers la marque de pause), ghunna correcte sur
      "مِّنْ".
- [x] **Bug trouvé et corrigé le 2026-09-04** (signalé par l'utilisateur :
      "le tajwid coloré ne marche pas") : la vérification "en conditions
      réelles" ci-dessus était en réalité faussée par la couleur `text-primary`
      déjà appliquée à la basmala (sans rapport avec le tajwid) - le vrai
      texte des versets ne recevait jamais aucune coloration. Cause :
      `useTajweedToggle` reposait sur un `useState` local par composant, or
      le bouton (`TajweedControl`) et le texte colore (`SurahDetailPage`/
      `VersePage`) sont des **instances de composants différentes** - cliquer
      le bouton mettait a jour son propre etat (et `localStorage`) mais
      jamais celui de la page, qui ne relisait `localStorage` qu'au tout
      premier montage. Le bouton affichait bien "Tajwid active" sans qu'aucune
      couleur n'apparaisse jamais. Corrige en remplacant le `useState` local
      par un store externe partage (`useSyncExternalStore`, React 18) - le
      mecanisme prevu pour exactement ce cas. Cette fois verifie directement
      dans le DOM (nombre d'enfants `<span>` par verset, pas juste une
      capture d'ecran) sur `SurahDetailPage` ET `VersePage` : coloration
      effective confirmee sur les deux pages, etat bien partage entre elles.

### 3.1bis Coloration tajwid — pistes non retenues dans cette itération

- [ ] Règles de madd (allongement) — voir décision ci-dessus.
- [ ] Import d'un jeu de données tiers si une source fiable et bien
      maintenue apparaît un jour (couverture complète + alignement garanti
      avec notre texte + licence compatible) — non nécessaire tant que le
      calcul maison suffit.

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
- [x] Tester explicitement le scénario "mode avion" de bout en bout
      (`apps/web/src/features/offline/offline-mode.test.ts`, via
      `fake-indexeddb`) : téléchargement → lecture hors-ligne — liste des
      sourates, détail d'une sourate, verset, traduction — depuis IndexedDB
      **sans aucun réseau**, détection de mise à jour par version, et
      nettoyage complet par `clearQuran`.

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

### 3.4 Cours "Apprendre à lire l'arabe coranique" (L) — ✅ fait le 2026-09-04

**Contexte** : demande explicite de l'utilisateur - un cours "ultra complet",
pas limité à l'alphabet seul : les formes des lettres selon leur position
dans le mot, puis des exercices de concaténation progressifs (2 lettres,
puis mots courts) jusqu'à pouvoir aborder la lecture de vrais versets.
Nouveau parcours dans l'infrastructure `learning` déjà existante (parcours/
leçons/quiz, voir phase 1 introduction/pratique de la prière) - aucun
changement de schéma nécessaire.

- [x] **20 leçons** dans un nouveau parcours `lire-arabe-coranique`
      ([learning-arabic-reading-seed.ts](apps/api/src/database/seed/learning-arabic-reading-seed.ts),
      fusionné dans `PATHS` de `learning-seed.ts`) : sens de lecture et
      écriture cursive (L1) ; les 28 lettres par familles de squelette
      graphique partagé, la méthode traditionnelle la plus efficace pour les
      mémoriser (L2-L10, tableau récapitulatif final) ; voyelles courtes,
      soukoun, chadda (L11-13) ; premiers mots réels de 2-3 lettres (L14) ;
      voyelles longues et tanwin (L15-16) ; alif de liaison, ta marbouta, lam
      solaire/lunaire (L17-18) ; application directe sur Al-Fatiha puis
      Al-Ikhlas/Al-Falaq/An-Nas (L19-20, liens vers les vraies pages de
      sourate plutôt que du texte coranique retranscrit à la main dans le
      seed - même principe de sourcing que le reste du site).
- [x] **Tableaux de formes de lettres interactifs**
      ([LetterFormsTable.tsx](apps/web/src/features/learning/arabic-reading/LetterFormsTable.tsx)) :
      isolée/initiale/médiane/finale déduites par tatweel (U+0640) plutôt que
      saisies à la main via des codepoints Unicode de "presentation forms"
      (déconseillés, et risque réel d'erreur de transcription) - le moteur
      de rendu arabe du navigateur choisit la forme connectée exactement
      comme il le ferait pour un vrai mot.
- [x] **Exercices de lecture progressifs**
      ([ReadingDrill.tsx](apps/web/src/features/learning/arabic-reading/ReadingDrill.tsx)) :
      grille de mots à déchiffrer, translittération masquée par défaut et
      révélée au clic (par item ou globalement) - pousse à vraiment tenter
      la lecture avant de vérifier. Branchés par (parcours, ordre de leçon)
      via `LessonIllustration.tsx`, même mécanisme que les illustrations
      existantes (postures de prière...).
- [x] Quiz : 1 question sur la moitié des leçons + quiz final récapitulatif
      (6 questions) dans `quiz-seed.ts`, même convention que les autres
      parcours.
- [x] Vérifié en direct : les 3 types de contenu (tableau de lettres,
      exercice de lecture avec révélation, quiz) rendus et interactifs sur
      plusieurs leçons ; tableau récapitulatif des 28 lettres complet et
      correct (y compris les tirets "—" pour les formes inexistantes des 6
      lettres non-attachantes) ; parcours visible dans la liste `/learn`.
      Scripts de seed exécutés avec succès (20 leçons + 185 questions au
      total, tous parcours confondus).

---

## Phase 4 — Mode Ramadan — ✅ fait le 2026-09-03

**Dépendance** : s'appuie sur le module horaires de prière (`prayer-times`,
calcul `adhan`) ; la position est définie par la ville choisie par
l'utilisateur via la recherche (voir 2.x — plus de géolocalisation).

- [x] **Bascule d'affichage saisonnière.** Bibliothèque de conversion
      hijri écartée au profit d'un calcul maison (`features/ramadan/
      hijri-calendar.ts`, dupliqué côté API pour le planificateur - même
      convention que `prayer-times.ts`) : algorithme tabulaire/civil
      arithmétique (époque JDN 1948440), formules vérifiées contre
      l'implémentation de référence de `ext/calendar` de PHP et contre deux
      dates de Ramadan largement documentées (1447 AH, 1448 AH). Aucune
      dépendance externe, aucune question de licence - même raisonnement
      que le moteur de tajwid maison (3.1). 10 tests unitaires (aller-retour
      Grégorien↔JDN↔Hijri, époque, bornes du mois). **Le calendrier
      tabulaire est une approximation arithmétique, pas une observation
      réelle du croissant lunaire : le début/la fin réels sont annoncés
      localement et peuvent différer de +-1 jour, disclaimer affiché dans
      l'UI.**
- [x] **Revu le 2026-09-04, sur demande explicite** : le réglage
      d'activation manuelle (`auto`/`on`/`off`, pour tester/anticiper hors
      saison) a été **retiré** - le mode Ramadan (bannière accueil + page
      `/ramadan`, khatm, notification) ne doit s'afficher **qu'en période
      réelle de Ramadan**, sans aucune possibilité de l'activer en avance.
      `useRamadanMode.ts` simplifié en conséquence (calcul pur, plus d'état/
      persistance).
- [x] Horaires iftar (Maghrib) / suhoor (Fajr) réutilisant directement
      `computePrayerTimes` et la position déjà enregistrée par l'utilisateur
      (`usePrayerLocation`, partagée avec la page horaires de prière) - zéro
      nouvelle brique de calcul. Affichés sur la nouvelle page `/ramadan`
      et en bannière sur la page d'accueil quand le mode est actif.
- [x] Suivi de khatm : nouvelle table `khatm_progress` (une ligne par
      utilisateur, réinitialisée automatiquement à chaque nouvelle année
      hijri). La position (`lastSurahNumber`/`lastVerseNumber`) est marquée
      par l'utilisateur - même geste que "reprendre où j'en étais" (1.2) -
      et `versesCompleted` calculé côté serveur (jamais saisi directement),
      vérifié en conditions réelles contre la base de production (somme des
      versets des sourates précédentes + position - retombe exactement sur
      6236 pour Sourate 114 Verset 6, le dernier verset du Coran). Objectif
      quotidien (versets restants ÷ jours restants du mois) calculé côté
      client, comme le reste du calendrier hijri.
- [x] Contenu dédié : catégorie de duas "Ramadan" déjà présente et sourcée
      (`duas-seed.ts`, Iftar + Laylat al-Qadr) - rien à importer, lien
      ajouté depuis la page Ramadan (`/duas/ramadan`).
- [x] Notification quotidienne (`RamadanAlertSchedulerService`, même
      squelette que les 4 autres planificateurs de `reminders/`) -
      désactivable indépendamment des autres rappels
      (`ramadan_alert_settings`, même structure que `streak_alert_settings`).
      Message adapté selon qu'un khatm est en cours ou non (objectif du
      jour vs message générique), dans les 8 langues déjà supportées.
- [x] Élément de partage (réutilise `StatShareCard`/`ShareButton` déjà en
      place pour séries/succès, aucun nouveau composant visuel) : "J'ai
      terminé le Coran ce Ramadan", déclenché quand `completedAt` est
      renseigné (6236/6236 versets).
- [x] Vérifié : `typecheck`/`lint`/`build`/tests (68 API + 57 web) au vert ;
      migration `khatm_progress`/`ramadan_alert_settings` générée, relue et
      appliquée (RLS activée automatiquement) ; page `/ramadan` vérifiée en
      direct (bascule auto/forcé, horaires iftar/suhoor avec une position
      réelle, états connecté/non connecté) ; calcul `versesCompleted`
      vérifié directement en base (voir ci-dessus). Non vérifié en direct
      dans le navigateur : le flux authentifié complet (création de compte
      + vérification email) - couvert à la place par une vérification
      directe de la requête SQL sous-jacente, identique à celle exécutée
      par le service.
- [ ] Pas fait : bouton pour réinitialiser/recommencer un khatm en cours
      volontairement (le changement automatique d'année hijri suffit pour
      le cas normal) ; pas d'ajout de nouveau contenu dua au-delà de ce qui
      existait déjà.

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
- [x] **Style du lecteur amélioré le 2026-09-04** (`AudioRecitation.tsx`) :
      barre de progression cliquable (`<input type="range">` natif,
      `accent-primary`, pas de nouvelle dépendance — cohérent avec le reste
      du projet qui évite d'ajouter une lib pour un besoin simple) avec
      temps écoulé/durée sous la barre ; gros bouton lecture/pause circulaire
      centré, boutons précédent/suivant en icônes de part et d'autre ; nom du
      récitateur affiché en clair, sélecteur repositionné en en-tête compact
      (icône seule). Remplace l'ancienne rangée unique de boutons + select
      qui se comprimait maladroitement (`flex-wrap`) sur petit écran.

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
