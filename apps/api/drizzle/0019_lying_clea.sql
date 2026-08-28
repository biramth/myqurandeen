ALTER TABLE "books" ADD COLUMN "text_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;--> statement-breakpoint
ALTER TABLE "verse_translations" ADD COLUMN "text_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', coalesce("text", ''))) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "books_text_search_gin_idx" ON "books" USING gin ("text_search");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quran_verses_text_search_gin_idx" ON "quran_verses" USING gin ("text_search");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tafsir_entries_text_search_gin_idx" ON "tafsir_entries" USING gin ("text_search");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verse_translations_text_search_gin_idx" ON "verse_translations" USING gin ("text_search");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hadiths_text_search_gin_idx" ON "hadiths" USING gin ("text_search");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "historical_events_text_search_gin_idx" ON "historical_events" USING gin ("text_search");