-- Tolerance aux fautes de frappe (au-dela des accents deja geres par
-- unaccent, migration 0021) : pg_trgm permet de mesurer une similarite
-- approximative entre deux chaines (ex. "Mohamed" vs "Muhammad" partagent
-- assez de trigrammes pour depasser un seuil de similarite), utilisee cote
-- application dans search.service.ts en complement de l'ILIKE exact.
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
