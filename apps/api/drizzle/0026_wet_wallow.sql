CREATE INDEX IF NOT EXISTS "tafsir_entries_tafsir_source_id_idx" ON "tafsir_entries" USING btree ("tafsir_source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tafsir_entries_verse_start_id_idx" ON "tafsir_entries" USING btree ("verse_start_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hadiths_hadith_book_id_idx" ON "hadiths" USING btree ("hadith_book_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fiqh_divergence_notes_fiqh_topic_id_idx" ON "fiqh_divergence_notes" USING btree ("fiqh_topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "historical_events_period_id_idx" ON "historical_events" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "concept_divergences_concept_id_idx" ON "concept_divergences" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learning_quiz_options_question_id_idx" ON "learning_quiz_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learning_quiz_questions_lesson_id_idx" ON "learning_quiz_questions" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learning_quiz_questions_path_id_idx" ON "learning_quiz_questions" USING btree ("path_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collections_user_id_idx" ON "collections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notes_user_id_idx" ON "notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notes_target_idx" ON "notes" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "report_history_report_id_idx" ON "report_history" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reminders_user_id_idx" ON "reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reminders_is_active_idx" ON "reminders" USING btree ("is_active");