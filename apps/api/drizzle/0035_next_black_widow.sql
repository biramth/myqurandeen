CREATE TABLE IF NOT EXISTS "quran_reciters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name_arabic" varchar(200) NOT NULL,
	"name_transliterated" varchar(200) NOT NULL,
	"style" varchar(32) NOT NULL,
	"edition_code" varchar(64) NOT NULL,
	"bitrate" smallint NOT NULL,
	"source" text NOT NULL,
	"source_url" text NOT NULL,
	"license" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quran_reciters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quran_verse_audio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"verse_id" uuid NOT NULL,
	"reciter_id" uuid NOT NULL,
	"url" text NOT NULL,
	"duration_sec" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quran_verse_audio_verse_reciter_uidx" UNIQUE("verse_id","reciter_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quran_verse_audio" ADD CONSTRAINT "quran_verse_audio_verse_id_quran_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."quran_verses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quran_verse_audio" ADD CONSTRAINT "quran_verse_audio_reciter_id_quran_reciters_id_fk" FOREIGN KEY ("reciter_id") REFERENCES "public"."quran_reciters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
