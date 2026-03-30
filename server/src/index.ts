import "dotenv/config";
import cors from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { initializeDatabase } from "./db.js";
import gamesRouter from "./routes/games.js";
import triviaRouter from "./routes/trivia.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/trivia", triviaRouter);
app.use("/api/games", gamesRouter);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
