import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to start the server.");
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
      id UUID PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      started_at TIMESTAMPTZ NOT NULL,
      finished_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_questions (
      id UUID PRIMARY KEY,
      game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      question_order INTEGER NOT NULL,
      question TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      all_answers JSONB NOT NULL,
      correct_answer TEXT NOT NULL,
      selected_answer TEXT,
      is_correct BOOLEAN NOT NULL
    );
  `);
};
