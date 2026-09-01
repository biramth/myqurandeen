CREATE TABLE IF NOT EXISTS "prayer_alert_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"timezone" varchar(60) NOT NULL,
	"calculation_method" varchar(30) DEFAULT 'MuslimWorldLeague' NOT NULL,
	"enabled_prayers" varchar(10)[] DEFAULT '{"fajr","dhuhr","asr","maghrib","isha"}' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"fajr_sent_at" timestamp with time zone,
	"dhuhr_sent_at" timestamp with time zone,
	"asr_sent_at" timestamp with time zone,
	"maghrib_sent_at" timestamp with time zone,
	"isha_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prayer_alert_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prayer_alert_settings" ADD CONSTRAINT "prayer_alert_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
