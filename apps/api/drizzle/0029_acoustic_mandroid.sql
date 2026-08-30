CREATE TABLE IF NOT EXISTS "dua_schedule_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"timezone" varchar(60) NOT NULL,
	"morning_time" varchar(5) DEFAULT '07:00' NOT NULL,
	"evening_time" varchar(5) DEFAULT '19:00' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"morning_sent_at" timestamp with time zone,
	"evening_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dua_schedule_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dua_schedule_settings" ADD CONSTRAINT "dua_schedule_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
