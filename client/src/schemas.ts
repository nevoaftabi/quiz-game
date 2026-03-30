import z from "zod";
import type { Category, QuestionData, SelectionDictionary } from "./types";

const DifficultySchema = z.enum(["Easy", "Medium", "Hard"]);

export const makeCategorySchema = (categories: Category[]) =>
  z
    .object({
      id: z
        .number()
        .positive("Please choose a category from the list."),
      name: z.string().min(1, "Please choose a category from the list."),
      numQuestions: z
        .number()
        .min(1, "Choose at least 1 question.")
        .max(50, "Choose 50 questions or fewer."),
      difficulty: DifficultySchema,
    })
    .refine(
      (value) =>
        categories.some(
          (category) =>
            category.id === value.id && category.name === value.name,
        ),
      {
        message: "Please choose a category from the list.",
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
