export type ApiResponse = {
  response_code: number;
  results: Array<{
    type: string;
    difficulty: string;
    correct_answer: string;
    incorrect_answers: string[];
    question: string;
    category: string;
  }>;
};

export interface SelectionDictionary {
  [key: string]: string;
}

export type Category = {
  name: string;
  id: number;
};

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Mode = "select" | "quiz";

export type QuestionData = {
  id: string;
  difficulty: string;
  category: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allAnswers: string[];
  question: string;
  type: string;
  questionHighlightColor: string;
};

export type CompletedQuestion = {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  allAnswers: string[];
  correctAnswer: string;
  selectedAnswer?: string;
  isCorrect: boolean;
};

export type GameHistoryEntry = {
  id: string;
  startedAt: string;
  finishedAt: string;
  category: string;
  difficulty: Difficulty;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  questions: CompletedQuestion[];
};
