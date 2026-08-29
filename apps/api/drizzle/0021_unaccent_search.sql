-- Recherche insensible aux accents : "priere" doit retrouver "prière", "ecole"
-- doit retrouver "école", etc. - un cas tres courant en francais (clavier,
-- frappe rapide) qui ne remontait jusqu'ici aucun resultat car to_tsvector('simple', ...)
-- ne normalise pas les accents. unaccent() est STABLE (depend du search_path),
-- pas IMMUTABLE : les colonnes generees exigeant IMMUTABLE, on l'enveloppe dans
-- un wrapper qui cible explicitement le dictionnaire "unaccent" - recette
-- documentee par PostgreSQL pour rendre l'appel utilisable dans une colonne generee.
CREATE EXTENSION IF NOT EXISTS "unaccent";--> statement-breakpoint
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
$$ SELECT unaccent('unaccent', $1) $$;--> statement-breakpoint
ALTER TABLE "books" drop column "text_search";--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "text_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', immutable_unaccent(coalesce(title, '') || ' ' || coalesce(description, '')))) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "books_text_search_gin_idx" ON "books" USING gin ("text_search");--> statement-breakpoint
ALTER TABLE "quran_verses" drop column "text_search";--> statement-breakpoint
ALTER TABLE "quran_verses" ADD COLUMN "text_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', immutable_unaccent(coalesce(text_arabic, '')))) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quran_verses_text_search_gin_idx" ON "quran_verses" USING gin ("text_search");--> statement-breakpoint
ALTER TABLE "tafsir_entries" drop column "text_search";--> statement-breakpoint
ALTER TABLE "tafsir_entries" ADD COLUMN "text_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', immutable_unaccent(coalesce(content, '')))) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tafsir_entries_text_search_gin_idx" ON "tafsir_entries" USING gin ("text_search");--> statement-breakpoint
ALTER TABLE "verse_translations" drop column "text_search";--> statement-breakpoint
ALTER TABLE "verse_translations" ADD COLUMN "text_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', immutable_unaccent(coalesce("text", '')))) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verse_translations_text_search_gin_idx" ON "verse_translations" USING gin ("text_search");--> statement-breakpoint
ALTER TABLE "hadiths" drop column "text_search";--> statement-breakpoint
ALTER TABLE "hadiths" ADD COLUMN "text_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', immutable_unaccent(coalesce(text_translation, '') || ' ' || coalesce(text_arabic, '')))) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hadiths_text_search_gin_idx" ON "hadiths" USING gin ("text_search");--> statement-breakpoint
ALTER TABLE "historical_events" drop column "text_search";--> statement-breakpoint
ALTER TABLE "historical_events" ADD COLUMN "text_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', immutable_unaccent(coalesce(title, '') || ' ' || coalesce(description, '')))) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "historical_events_text_search_gin_idx" ON "historical_events" USING gin ("text_search");
