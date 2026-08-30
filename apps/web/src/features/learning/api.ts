import { apiClient } from "@/lib/api-client";
import { getLocalDateString } from "@/lib/local-date";
import type { LearningPathDetail, LearningPathSummary, QuizQuestion } from "./types";

export const learningApi = {
  listPaths: () => apiClient.get<LearningPathSummary[]>("/learning/paths", { skipAuth: true }),
  getPath: (slug: string) => apiClient.get<LearningPathDetail>(`/learning/paths/${slug}`, { skipAuth: true }),
  getProgress: () => apiClient.get<string[]>("/learning/progress"),
  toggleLesson: (lessonId: string) =>
    apiClient.post<{ completed: boolean }>(`/learning/lessons/${lessonId}/toggle`, {
      localDate: getLocalDateString(),
    }),
  getLessonQuiz: (lessonId: string) =>
    apiClient.get<QuizQuestion[]>(`/learning/lessons/${lessonId}/quiz`, { skipAuth: true }),
  getPathQuiz: (slug: string) => apiClient.get<QuizQuestion[]>(`/learning/paths/${slug}/quiz`, { skipAuth: true }),
};
