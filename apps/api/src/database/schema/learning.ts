import { boolean, index, jsonb, pgTable, primaryKey, smallint, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";
import { LEARNING_LEVELS, TARGET_TYPES } from "@qurandeen/shared";

export const learningPaths = pgTable("learning_paths", {
  id: id(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  level: varchar("level", { length: 16, enum: LEARNING_LEVELS }).notNull(),
  description: text("description"),
  ...timestamps,
}).enableRLS();

export const learningLessons = pgTable("learning_lessons", {
  id: id(),
  pathId: uuid("path_id")
    .notNull()
    .references(() => learningPaths.id, { onDelete: "cascade" }),
  order: smallint("order").notNull(),
  title: varchar("title", { length: 250 }).notNull(),
  contentType: varchar("content_type", { length: 32, enum: TARGET_TYPES }),
  contentTargetId: uuid("content_target_id"),
  /** Contenu pedagogique reel de la lecon (pas seulement un lien de redirection). */
  content: text("content"),
  /** Points cles a retenir, affiches en recapitulatif de la lecon. */
  keyTakeaways: text("key_takeaways").array(),
  /** References citees dans la lecon : [{label, url}] - liens internes vers le contenu sourcee (verset, hadith, concept...). */
  references: jsonb("references"),
  isPublished: boolean("is_published").default(false).notNull(),
  ...timestamps,
}).enableRLS();

export const userProgress = pgTable(
  "user_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => learningLessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
).enableRLS();

/**
 * Question de quiz d'auto-evaluation, deterministe (redigee par l'équipe
 * editoriale, jamais generee). Rattachee soit a une lecon (mini-quiz de fin
 * de lecon), soit directement a un parcours (quiz final recapitulatif) -
 * jamais les deux a la fois.
 */
export const learningQuizQuestions = pgTable(
  "learning_quiz_questions",
  {
    id: id(),
    lessonId: uuid("lesson_id").references(() => learningLessons.id, { onDelete: "cascade" }),
    pathId: uuid("path_id").references(() => learningPaths.id, { onDelete: "cascade" }),
    order: smallint("order").notNull(),
    question: text("question").notNull(),
    explanation: text("explanation"),
    ...timestamps,
  },
  (t) => [
    index("learning_quiz_questions_lesson_id_idx").on(t.lessonId),
    index("learning_quiz_questions_path_id_idx").on(t.pathId),
  ],
).enableRLS();

export const learningQuizOptions = pgTable(
  "learning_quiz_options",
  {
    id: id(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => learningQuizQuestions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    order: smallint("order").notNull(),
  },
  (t) => [index("learning_quiz_options_question_id_idx").on(t.questionId)],
).enableRLS();
