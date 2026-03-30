import type { Category, GameHistoryEntry } from "./types";

export function shuffleArray(array: any) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function decodeHtmlEntities(text: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export const getApiUrl = (
  numQuestions: number,
  category: Category,
  difficulty: string,
) => {
  return `https://opentdb.com/api.php?amount=${encodeURIComponent(numQuestions)}&category=${encodeURIComponent(category.id)}&difficulty=${encodeURIComponent(difficulty.toLowerCase())}&type=multiple`;
};

export const getAccuracy = (correctCount: number, totalQuestions: number) => {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((correctCount / totalQuestions) * 100);
};

export const formatCompletedAt = (completedAt: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(completedAt));
};

export const getAverageQuestionsPerGame = (gameHistory: GameHistoryEntry[]) => {
  if (gameHistory.length === 0) {
    return 0;
  }

  const totalQuestions = gameHistory.reduce(
    (total, game) => total + game.totalQuestions,
    0,
  );

  return Math.round(totalQuestions / gameHistory.length);
};

export const getTotalCorrectAnswers = (gameHistory: GameHistoryEntry[]) => {
  return gameHistory.reduce((total, game) => total + game.correctCount, 0);
};

export const getTotalIncorrectAnswers = (gameHistory: GameHistoryEntry[]) => {
  return gameHistory.reduce(
    (total, game) => total + (game.totalQuestions - game.correctCount),
    0,
  );
};
