CREATE TABLE IF NOT EXISTS "learning_quiz_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learning_quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid,
	"path_id" uuid,
	"order" smallint NOT NULL,
	"question" text NOT NULL,
	"explanation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learning_quiz_options" ADD CONSTRAINT "learning_quiz_options_question_id_learning_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."learning_quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learning_quiz_questions" ADD CONSTRAINT "learning_quiz_questions_lesson_id_learning_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."learning_lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learning_quiz_questions" ADD CONSTRAINT "learning_quiz_questions_path_id_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
