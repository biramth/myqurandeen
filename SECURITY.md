# Politique de securite

## Signaler une vulnerabilite

Merci de **ne pas** ouvrir d'issue publique pour une faille de securite.
Utilisez plutot l'onglet "Security" du depot GitHub ("Report a vulnerability")
ou contactez directement les mainteneurs en prive.

Merci d'inclure :

- une description de la vulnerabilite et de son impact potentiel ;
- les etapes pour la reproduire ;
- la version/commit concerne.

Nous accusons reception sous 72h et visons une correction ou un plan
d'action sous 30 jours pour les failles critiques.

## Perimetre

Sont notamment couverts :

- authentification, gestion des sessions et des cookies ;
- controle d'acces (RBAC) et fuite de donnees privees (notes, favoris) ;
- injection (SQL, XSS, SSRF) ;
- upload de fichiers ;
- configuration CORS/CSP/headers.

## Bonnes pratiques du projet

- Aucun secret n'est commite : tout passe par des variables d'environnement
  (`.env`, jamais versionne - voir `.env.example`).
- Les mots de passe sont hashes avec argon2.
- Toute autorisation est verifiee cote serveur, jamais uniquement cote
  frontend.
- Les dependances sont revues regulierement (`npm audit`, Dependabot).
