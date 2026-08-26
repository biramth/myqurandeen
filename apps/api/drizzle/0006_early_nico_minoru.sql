CREATE TABLE IF NOT EXISTS "hadith_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hadith_id" uuid NOT NULL,
	"translation_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hadith_translations_hadith_translation_uidx" UNIQUE("hadith_id","translation_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hadith_translations" ADD CONSTRAINT "hadith_translations_hadith_id_hadiths_id_fk" FOREIGN KEY ("hadith_id") REFERENCES "public"."hadiths"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hadith_translations" ADD CONSTRAINT "hadith_translations_translation_id_translations_id_fk" FOREIGN KEY ("translation_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
