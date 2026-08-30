CREATE TABLE IF NOT EXISTS "user_streaks" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"current_streak" smallint DEFAULT 0 NOT NULL,
	"longest_streak" smallint DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
