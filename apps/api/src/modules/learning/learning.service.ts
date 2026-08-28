import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq, inArray } from "drizzle-orm";
import { LEARNING_LEVELS } from "@qurandeen/shared";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  learningLessons,
  learningPaths,
  learningQuizOptions,
  learningQuizQuestions,
  userProgress,
} from "../../database/schema";

@Injectable()
export class LearningService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listPaths() {
    const paths = await this.db.select().from(learningPaths);
    // Tri par difficulte croissante (beginner -> intermediate -> advanced) :
    // un tri alphabetique sur `level` donnerait l'ordre errone
    // advanced/beginner/intermediate, "advanced" passant en premier.
    return paths.sort(
      (a, b) => LEARNING_LEVELS.indexOf(a.level as (typeof LEARNING_LEVELS)[number]) -
        LEARNING_LEVELS.indexOf(b.level as (typeof LEARNING_LEVELS)[number]),
    );
  }

  async getPath(slug: string) {
    const path = await this.db.query.learningPaths.findFirst({ where: eq(learningPaths.slug, slug) });
    if (!path) {
      throw new NotFoundException(`Parcours "${slug}" introuvable`);
    }

    const lessons = await this.db
      .select({
        id: learningLessons.id,
        order: learningLessons.order,
        title: learningLessons.title,
        content: learningLessons.content,
        keyTakeaways: learningLessons.keyTakeaways,
        references: learningLessons.references,
      })
      .from(learningLessons)
      .where(and(eq(learningLessons.pathId, path.id), eq(learningLessons.isPublished, true)))
      .orderBy(asc(learningLessons.order));

    return { ...path, lessons };
  }

  async getUserProgress(userId: string) {
    const rows = await this.db
      .select({ lessonId: userProgress.lessonId })
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    return rows.map((r) => r.lessonId);
  }

  async toggleLessonCompletion(userId: string, lessonId: string): Promise<{ completed: boolean }> {
    const lesson = await this.db.query.learningLessons.findFirst({ where: eq(learningLessons.id, lessonId) });
    if (!lesson) {
      throw new NotFoundException("Lecon introuvable");
    }

    const existing = await this.db.query.userProgress.findFirst({
      where: and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)),
    });

    if (existing) {
      await this.db
        .delete(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)));
      return { completed: false };
    }

    await this.db.insert(userProgress).values({ userId, lessonId });
    return { completed: true };
  }

  async getLessonQuiz(lessonId: string) {
    const lesson = await this.db.query.learningLessons.findFirst({ where: eq(learningLessons.id, lessonId) });
    if (!lesson) {
      throw new NotFoundException("Lecon introuvable");
    }
    const questions = await this.db
      .select()
      .from(learningQuizQuestions)
      .where(eq(learningQuizQuestions.lessonId, lessonId))
      .orderBy(asc(learningQuizQuestions.order));
    return this.attachOptions(questions);
  }

  async getPathFinalQuiz(slug: string) {
    const path = await this.db.query.learningPaths.findFirst({ where: eq(learningPaths.slug, slug) });
    if (!path) {
      throw new NotFoundException(`Parcours "${slug}" introuvable`);
    }
    const questions = await this.db
      .select()
      .from(learningQuizQuestions)
      .where(eq(learningQuizQuestions.pathId, path.id))
      .orderBy(asc(learningQuizQuestions.order));
    return this.attachOptions(questions);
  }

  private async attachOptions(questions: (typeof learningQuizQuestions.$inferSelect)[]) {
    if (questions.length === 0) return [];
    const questionIds = questions.map((q) => q.id);
    const options = await this.db
      .select()
      .from(learningQuizOptions)
      .where(inArray(learningQuizOptions.questionId, questionIds))
      .orderBy(asc(learningQuizOptions.order));

    const optionsByQuestion = new Map<string, typeof options>();
    for (const option of options) {
      const list = optionsByQuestion.get(option.questionId) ?? [];
      list.push(option);
      optionsByQuestion.set(option.questionId, list);
    }

    return questions.map((q) => ({
      id: q.id,
      question: q.question,
      explanation: q.explanation,
      options: optionsByQuestion.get(q.id) ?? [],
    }));
  }
}
