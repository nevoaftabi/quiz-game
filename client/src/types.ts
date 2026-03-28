import type { SetStateAction } from "react";

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

export interface SelectionDictionary {
  [key: string]: string;
}

export type SelectModeCategories = {
  categories: string[];
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  handleStartFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
  numQuestions: number
  setNumQuestions: React.Dispatch<React.SetStateAction<number>>,
  difficulty: Difficulty,
  difficulties: Difficulty[],
  setDifficulty: React.Dispatch<React.SetStateAction<Difficulty>>;
};

export type QuestionProps = {
  questionData: QuestionData;
  setSelection: React.Dispatch<SetStateAction<SelectionDictionary>>;
  selection: SelectionDictionary;
  quizSubmitted: boolean;
};

export type Difficulty = "Easy" | "Medium" | "Hard";

export const getAnswerColor = (
  selection: SelectionDictionary,
  questionData: QuestionData,
  quizSubmitted: boolean,
  thisAnswer: string,
) => {
  if (quizSubmitted) {
    if (thisAnswer === questionData.correctAnswer) {
      return "green";
    }

    if (selection[questionData.id] === thisAnswer) {
      return "red";
    }
  }

  return "black";
};

export type Mode = "select" | "quiz";