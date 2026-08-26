CREATE TABLE IF NOT EXISTS "hadith_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hadith_id" uuid NOT NULL,
	"grader_name" varchar(150) NOT NULL,
	"grade" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hadith_collections" ADD COLUMN "slug" varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE "hadith_collections" ADD COLUMN "source_id" uuid;--> statement-breakpoint
ALTER TABLE "hadiths" ADD COLUMN "collection_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "hadiths" ADD COLUMN "number_in_collection" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hadith_grades" ADD CONSTRAINT "hadith_grades_hadith_id_hadiths_id_fk" FOREIGN KEY ("hadith_id") REFERENCES "public"."hadiths"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hadith_collections" ADD CONSTRAINT "hadith_collections_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hadiths" ADD CONSTRAINT "hadiths_collection_id_hadith_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."hadith_collections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "hadith_collections" ADD CONSTRAINT "hadith_collections_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "hadiths" ADD CONSTRAINT "hadiths_collection_number_uidx" UNIQUE("collection_id","number_in_collection");