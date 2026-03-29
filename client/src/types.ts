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
