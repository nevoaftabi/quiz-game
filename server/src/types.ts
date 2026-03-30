export type CompletedQuestionPayload = {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  allAnswers: string[];
  correctAnswer: string;
  selectedAnswer?: string;
  isCorrect: boolean;
};

export type SaveGamePayload = {
  id: string;
  startedAt: string;
  finishedAt: string;
  category: string;
  difficulty: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  questions: CompletedQuestionPayload[];
};
