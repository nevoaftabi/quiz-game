import type { ApiResponse, Difficulty, GameHistoryEntry } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

const apiRequest = async <T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const fetchGameHistory = async (token: string) => {
  return apiRequest<GameHistoryEntry[]>("/api/games", token);
};

export const fetchTriviaQuestions = async (
  token: string,
  payload: {
    numQuestions: number;
    categoryId: number;
    difficulty: Difficulty;
  },
) => {
  return apiRequest<ApiResponse>("/api/trivia/questions", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const saveGameHistory = async (
  token: string,
  gameHistoryEntry: GameHistoryEntry,
) => {
  await apiRequest<{ id: string }>("/api/games", token, {
    method: "POST",
    body: JSON.stringify(gameHistoryEntry),
  });
};
