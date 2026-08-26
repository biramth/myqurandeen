export interface LearningPathSummary {
  id: string;
  title: string;
  slug: string;
  level: "beginner" | "intermediate" | "advanced";
  description: string | null;
}

export interface LearningReference {
  label: string;
  url: string;
}

export interface LearningLesson {
  id: string;
  order: number;
  title: string;
  content: string | null;
  keyTakeaways: string[] | null;
  references: LearningReference[] | null;
}

export interface LearningPathDetail extends LearningPathSummary {
  lessons: LearningLesson[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  explanation: string | null;
  options: QuizOption[];
}
