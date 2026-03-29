import z from "zod";
import type { Category, SelectionDictionary } from "./types";
import type { QuestionData } from "./components/Question";

const DifficultySchema = z.enum(["Easy", "Medium", "Hard"]);

export const makeCategorySchema = (categories: Category[]) =>
  z
    .object({
      id: z.number().min(9).max(32),
      name: z.string().min(1).max(50),
      numQuestions: z.number().min(1).max(50),
      difficulty: DifficultySchema,
    })
    .refine(
      (value) =>
        categories.some(
          (category) =>
            category.id === value.id && category.name === value.name,
        ),
      {
        message: "Category is not in the allowed categories list",
      },
    );

export const makeQuizSubmissionSchema = (
  questions: QuestionData[],
  selection: SelectionDictionary,
) =>
  z
    .object({})
    .refine(() => questions.every((q) => selection[q.id] !== undefined), {
      message: "Please answer every question before submitting",
    });
