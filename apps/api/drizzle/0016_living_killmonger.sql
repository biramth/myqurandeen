CREATE TABLE IF NOT EXISTS "ai_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar(40) NOT NULL,
	"content_id" uuid NOT NULL,
	"content_text" text NOT NULL,
	"context_text" text,
	"metadata" text,
	"embedding_dim" integer NOT NULL,
	"embedding" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_embeddings_content_type_idx" ON "ai_embeddings" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_embeddings_content_id_idx" ON "ai_embeddings" USING btree ("content_id");