ALTER TABLE "authors" ADD CONSTRAINT "authors_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_title_unique" UNIQUE("title");--> statement-breakpoint
ALTER TABLE "tafsir_sources" ADD CONSTRAINT "tafsir_sources_title_unique" UNIQUE("title");