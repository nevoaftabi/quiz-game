import { Router } from "express";
import { pool } from "../db.js";
import { requireUser } from "../auth.js";
import type { SaveGamePayload } from "../types.js";

const router = Router();

router.use(requireUser);

router.get("/", async (_req, res) => {
  const userId = res.locals.userId as string;

  const gameResult = await pool.query(
    `
      SELECT
        id,
        category,
        difficulty,
        total_questions AS "totalQuestions",
        correct_count AS "correctCount",
        accuracy,
        started_at AS "startedAt",
        finished_at AS "finishedAt"
      FROM games
      WHERE clerk_user_id = $1
      ORDER BY finished_at DESC
    `,
    [userId],
  );

  const history = await Promise.all(
    gameResult.rows.map(async (game) => {
      const questionResult = await pool.query(
        `
          SELECT
            id,
            question,
            category,
            difficulty,
            all_answers AS "allAnswers",
            correct_answer AS "correctAnswer",
            selected_answer AS "selectedAnswer",
            is_correct AS "isCorrect"
          FROM game_questions
          WHERE game_id = $1
          ORDER BY question_order ASC
        `,
        [game.id],
      );

      return {
        ...game,
        questions: questionResult.rows,
      };
    }),
  );

  res.json(history);
});

router.get("/:gameId", async (req, res) => {
  const userId = res.locals.userId as string;
  const { gameId } = req.params;

  const gameResult = await pool.query(
    `
      SELECT
        id,
        category,
        difficulty,
        total_questions AS "totalQuestions",
        correct_count AS "correctCount",
        accuracy,
        started_at AS "startedAt",
        finished_at AS "finishedAt"
      FROM games
      WHERE id = $1 AND clerk_user_id = $2
      LIMIT 1
    `,
    [gameId, userId],
  );

  if (!gameResult.rows[0]) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  const questionResult = await pool.query(
    `
      SELECT
        id,
        question,
        category,
        difficulty,
        all_answers AS "allAnswers",
        correct_answer AS "correctAnswer",
        selected_answer AS "selectedAnswer",
        is_correct AS "isCorrect"
      FROM game_questions
      WHERE game_id = $1
      ORDER BY question_order ASC
    `,
    [gameId],
  );

  res.json({
    ...gameResult.rows[0],
    questions: questionResult.rows,
  });
});

router.post("/", async (req, res) => {
  const userId = res.locals.userId as string;
  const payload = req.body as SaveGamePayload;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        INSERT INTO games (
          id,
          clerk_user_id,
          category,
          difficulty,
          total_questions,
          correct_count,
          accuracy,
          started_at,
          finished_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        payload.id,
        userId,
        payload.category,
        payload.difficulty,
        payload.totalQuestions,
        payload.correctCount,
        payload.accuracy,
        payload.startedAt,
        payload.finishedAt,
      ],
    );

    for (const [index, question] of payload.questions.entries()) {
      await client.query(
        `
          INSERT INTO game_questions (
            id,
            game_id,
            question_order,
            question,
            category,
            difficulty,
            all_answers,
            correct_answer,
            selected_answer,
            is_correct
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
        `,
        [
          question.id,
          payload.id,
          index,
          question.question,
          question.category,
          question.difficulty,
          JSON.stringify(question.allAnswers),
          question.correctAnswer,
          question.selectedAnswer ?? null,
          question.isCorrect,
        ],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ id: payload.id });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to save game history" });
  } finally {
    client.release();
  }
});

export default router;
