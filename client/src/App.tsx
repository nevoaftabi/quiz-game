import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router";
import { SignIn, UserButton, useAuth } from "@clerk/clerk-react";
import { makeCategorySchema, makeQuizSubmissionSchema } from "./schemas";
import SelectForm from "./components/SelectForm";
import QuizForm from "./components/QuizForm";
import {
  fetchGameHistory,
  fetchTriviaQuestions,
  saveGameHistory,
} from "./api";
import {
  decodeHtmlEntities,
  formatCompletedAt,
  getAccuracy,
  getAverageQuestionsPerGame,
  getTotalCorrectAnswers,
  getTotalIncorrectAnswers,
  shuffleArray,
} from "./utils";
import type {
  ApiResponse,
  Category,
  Difficulty,
  GameHistoryEntry,
  QuestionData,
  SelectionDictionary,
} from "./types";

type SelectFormErrors = {
  summary: string;
  category?: string;
  numQuestions?: string;
  difficulty?: string;
};

const getSelectFormErrors = (
  categories: Category[],
  numQuestions: number,
): SelectFormErrors => {
  if (!categories.length) {
    return {
      summary: "Categories are still loading.",
      category: "Please wait a moment for categories to finish loading.",
    };
  }

  if (Number.isNaN(numQuestions) || numQuestions < 1) {
    return {
      summary: "Please fix the highlighted fields before starting the quiz.",
      numQuestions: "Choose at least 1 question.",
    };
  }

  if (numQuestions > 50) {
    return {
      summary: "Please fix the highlighted fields before starting the quiz.",
      numQuestions: "Choose 50 questions or fewer.",
    };
  }

  return { summary: "" };
};

const LoadingScreen = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-4 text-slate-200 shadow-xl">
      Loading...
    </div>
  </div>
);

const LoginPage = () => {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (userId) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <SignIn />
    </div>
  );
};

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!userId) {
    return <Navigate replace to="/login" />;
  }

  return <>{children}</>;
};

type PlayPageProps = {
  onGameComplete: (game: GameHistoryEntry) => Promise<void>;
};

const PlayPage = ({ onGameComplete }: PlayPageProps) => {
  const { getToken } = useAuth();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selection, setSelection] = useState<SelectionDictionary>({});
  const [score, setScore] = useState<null | number>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showMissingAnswers, setShowMissingAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [selectFormErrors, setSelectFormErrors] = useState<SelectFormErrors>({
    summary: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category>({
    id: -1,
    name: "Select a category",
  });
  const [numQuestions, setNumQuestions] = useState(5);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const hasFetchedCategories = useRef(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [mode, setMode] = useState<"select" | "quiz">("select");

  const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const resetPlayState = () => {
    setQuestions([]);
    setSelection({});
    setScore(null);
    setQuizSubmitted(false);
    setShowMissingAnswers(false);
    setLoadingMessage("");
    setSelectFormErrors({ summary: "" });
    setStartedAt(null);
    setMode("select");
  };

  useEffect(() => {
    if (hasFetchedCategories.current) return;

    hasFetchedCategories.current = true;

    const fetchCategories = async () => {
      try {
        const result = await fetch("https://opentdb.com/api_category.php");

        if (!result.ok) {
          return;
        }

        const json = await result.json();
        setCategories(json.trivia_categories);
        setCategory(json.trivia_categories[0]);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const fetchQuestions = async () => {
    const token = await getToken();

    if (!token) {
      return false;
    }

    try {
      const json: ApiResponse = await fetchTriviaQuestions(token, {
        numQuestions,
        categoryId: category.id,
        difficulty,
      });

      setQuestions(
        json.results.map((q) => ({
          id: crypto.randomUUID(),
          correctAnswer: decodeHtmlEntities(q.correct_answer),
          category: decodeHtmlEntities(q.category),
          difficulty: decodeHtmlEntities(q.difficulty),
          questionHighlightColor: "black",
          incorrectAnswers: q.incorrect_answers.map((a) =>
            decodeHtmlEntities(a),
          ),
          question: decodeHtmlEntities(q.question),
          type: decodeHtmlEntities(q.type),
          allAnswers: shuffleArray(
            [...q.incorrect_answers, q.correct_answer].map((a) =>
              decodeHtmlEntities(a),
            ),
          ),
        })),
      );
      setSelection({});
      setQuizSubmitted(false);
      setShowMissingAnswers(false);
      setScore(null);
      setStartedAt(new Date().toISOString());
      setMode("quiz");
      return true;
    } catch {
      return false;
    }
  };

  const handleSelectionFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setLoadingMessage("");
    setSelectFormErrors({ summary: "" });

    const result = makeCategorySchema(categories).safeParse({
      ...category,
      difficulty,
      numQuestions,
    });

    if (!result.success) {
      setSelectFormErrors(getSelectFormErrors(categories, numQuestions));
      return;
    }

    setIsLoading(true);

    try {
      setLoadingMessage("Loading questions...");
      let requestSucceeded = await fetchQuestions();

      while (!requestSucceeded) {
        setLoadingMessage("Request failed. Retrying in 5 seconds...");
        await sleep(5000);
        setLoadingMessage("Retrying request...");
        requestSucceeded = await fetchQuestions();
      }
    } finally {
      setLoadingMessage("");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const action = submitter?.value;

    if (action === "reset") {
      resetPlayState();
      return;
    }

    if (action !== "submit") {
      return;
    }

    const result = makeQuizSubmissionSchema(questions, selection).safeParse({});

    if (!result.success) {
      setShowMissingAnswers(true);
      return;
    }

    const correctCount = questions.reduce(
      (accum, currentValue) =>
        accum +
        (selection[currentValue.id] === currentValue.correctAnswer ? 1 : 0),
      0,
    );

    setShowMissingAnswers(false);
    setScore(correctCount);
    setQuizSubmitted(true);

    const completedQuestions = questions.map((q) => {
      const selectedAnswer = selection[q.id];

      return {
        id: q.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        allAnswers: q.allAnswers,
        correctAnswer: q.correctAnswer,
        selectedAnswer,
        isCorrect: selectedAnswer === q.correctAnswer,
      };
    });

    await onGameComplete({
      id: crypto.randomUUID(),
      startedAt: startedAt ?? new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      category: category.name,
      difficulty,
      totalQuestions: questions.length,
      correctCount,
      accuracy: getAccuracy(correctCount, questions.length),
      questions: completedQuestions,
    });

    setQuestions((currentQuestions) =>
      currentQuestions.map((q) => ({
        ...q,
        questionHighlightColor:
          selection[q.id] === q.correctAnswer ? "green" : "red",
      })),
    );
  };

  if (mode === "quiz") {
    return (
      <QuizForm
        handleSubmit={handleSubmit}
        questions={questions}
        quizSubmitted={quizSubmitted}
        showMissingAnswers={showMissingAnswers}
        score={score}
        selection={selection}
        setSelection={setSelection}
      />
    );
  }

  return (
    <SelectForm
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      selectFormErrors={selectFormErrors}
      setCategory={setCategory}
      category={category}
      categories={categories}
      handleSelectionFormSubmit={handleSelectionFormSubmit}
      numQuestions={numQuestions}
      difficulties={difficulties}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      setNumQuestions={setNumQuestions}
    />
  );
};

type HistoryPageProps = {
  gameHistory: GameHistoryEntry[];
};

const HistoryPage = ({ gameHistory }: HistoryPageProps) => {
  const navigate = useNavigate();
  const averageQuestionsPerGame = getAverageQuestionsPerGame(gameHistory);
  const totalCorrectAnswers = getTotalCorrectAnswers(gameHistory);
  const totalIncorrectAnswers = getTotalIncorrectAnswers(gameHistory);
  const overallAccuracy = getAccuracy(
    totalCorrectAnswers,
    totalCorrectAnswers + totalIncorrectAnswers,
  );

  return (
    <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
          Match History
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">Completed Games</h1>
        <p className="mt-3 text-sm text-slate-400">
          Review your past quiz runs, scores, and accuracy.
        </p>
      </div>

      {gameHistory.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Avg Questions / Game
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {averageQuestionsPerGame}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Overall Accuracy
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {overallAccuracy}%
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm uppercase tracking-wide text-emerald-300">
              Correct Answers
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-200">
              {totalCorrectAnswers}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
            <p className="text-sm uppercase tracking-wide text-rose-300">
              Incorrect Answers
            </p>
            <p className="mt-2 text-3xl font-bold text-rose-200">
              {totalIncorrectAnswers}
            </p>
          </div>
        </div>
      )}

      {gameHistory.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-6 py-10 text-center text-slate-300">
          No completed games yet. Start a quiz from the Play tab to build your
          history.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950/80">
              <tr className="text-left text-sm uppercase tracking-wide text-slate-400">
                <th className="px-4 py-4">Started</th>
                <th className="px-4 py-4">Finished</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Difficulty</th>
                <th className="px-4 py-4">Score</th>
                <th className="px-4 py-4">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/70 text-slate-100">
              {gameHistory.map((game) => (
                <tr
                  key={game.id}
                  className="cursor-pointer transition hover:bg-slate-800/90"
                  onClick={() => navigate(`/history/${game.id}`)}
                >
                  <td className="px-4 py-4 text-sm text-slate-300">
                    {formatCompletedAt(game.startedAt)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300">
                    {formatCompletedAt(game.finishedAt)}
                  </td>
                  <td className="px-4 py-4 font-medium">{game.category}</td>
                  <td className="px-4 py-4">{game.difficulty}</td>
                  <td className="px-4 py-4">
                    {game.correctCount} / {game.totalQuestions}
                  </td>
                  <td className="px-4 py-4">{game.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

type HistoryDetailsPageProps = {
  gameHistory: GameHistoryEntry[];
};

const HistoryDetailsPage = ({ gameHistory }: HistoryDetailsPageProps) => {
  const { gameId } = useParams();
  const selectedGame = gameHistory.find((game) => game.id === gameId);

  if (!selectedGame) {
    return (
      <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Game Not Found</h1>
        <p className="mt-3 text-slate-400">
          That game isn&apos;t in your history.
        </p>
        <Link
          className="mt-6 inline-flex rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-400"
          to="/history"
        >
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            Game Review
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">
            {selectedGame.category}
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            {selectedGame.difficulty}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Started: {formatCompletedAt(selectedGame.startedAt)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Finished: {formatCompletedAt(selectedGame.finishedAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-right">
          <p className="text-sm uppercase tracking-wide text-emerald-300">
            Results
          </p>
          <p className="mt-1 text-xl font-semibold text-emerald-200">
            {selectedGame.correctCount} / {selectedGame.totalQuestions}
          </p>
          <p className="text-sm text-emerald-300">
            Accuracy: {selectedGame.accuracy}%
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {selectedGame.questions.map((question, index) => (
          <div
            key={question.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Question {index + 1}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  {question.question}
                </h2>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  question.isCorrect
                    ? "bg-emerald-500/15 text-emerald-300"
                    : question.selectedAnswer
                      ? "bg-rose-500/15 text-rose-300"
                      : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {question.isCorrect
                  ? "Completed Correctly"
                  : question.selectedAnswer
                    ? "Completed Incorrectly"
                    : "Not Completed"}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {question.allAnswers.map((answer) => {
                const isCorrect = answer === question.correctAnswer;
                const isSelected = answer === question.selectedAnswer;

                return (
                  <div
                    key={answer}
                    className={`rounded-xl border px-4 py-3 ${
                      isCorrect
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : isSelected
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                          : "border-slate-800 bg-slate-900/70 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{answer}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {isCorrect
                          ? "Correct Answer"
                          : isSelected
                            ? "Your Answer"
                            : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const { isLoaded, userId, getToken } = useAuth();
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);

  const loadGameHistory = useCallback(async () => {
    const token = await getToken();

    if (!token) {
      return;
    }

    const history = await fetchGameHistory(token);
    setGameHistory(history);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!userId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadGameHistory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoaded, loadGameHistory, userId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link className="text-xl font-bold text-white" to="/">
            Trivia Game
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-3">
              <NavLink
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-sky-500 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
                to="/"
              >
                Play
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-sky-500 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
                to="/history"
              >
                History
              </NavLink>
            </nav>

            {userId ? (
              <UserButton />
            ) : (
              <Link
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
                to="/login"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl justify-center px-4 py-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PlayPage
                  onGameComplete={async (game) => {
                    const token = await getToken();

                    if (!token) {
                      return;
                    }

                    await saveGameHistory(token, game);
                    await loadGameHistory();
                  }}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage gameHistory={gameHistory} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/:gameId"
            element={
              <ProtectedRoute>
                <HistoryDetailsPage gameHistory={gameHistory} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
