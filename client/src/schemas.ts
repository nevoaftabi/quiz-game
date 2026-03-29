import z from "zod";
import type { Category } from "./types";

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
