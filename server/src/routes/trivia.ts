import { Router } from "express";
import { z } from "zod";
import { requireUser } from "../auth.js";

const router = Router();

const triviaRequestSchema = z.object({
  numQuestions: z.number().int().min(1).max(50),
  categoryId: z.number().int().positive(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

router.use(requireUser);

router.post("/questions", async (req, res) => {
  const result = triviaRequestSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid trivia request",
      details: result.error.flatten(),
    });
    return;
  }

  const { numQuestions, categoryId, difficulty } = result.data;
  const searchParams = new URLSearchParams({
    amount: String(numQuestions),
    category: String(categoryId),
    difficulty: difficulty.toLowerCase(),
    type: "multiple",
  });

  try {
    const triviaResponse = await fetch(
      `https://opentdb.com/api.php?${searchParams.toString()}`,
    );

    if (!triviaResponse.ok) {
      res.status(502).json({ error: "Failed to fetch trivia questions" });
      return;
    }

    const triviaJson = await triviaResponse.json();
    res.json(triviaJson);
  } catch {
    res.status(502).json({ error: "Failed to fetch trivia questions" });
  }
});

export default router;
