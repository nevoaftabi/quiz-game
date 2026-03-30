import type { Category, Difficulty } from "../types";

export type SelectFormProps = {
  categories: Category[];
  isLoading: boolean;
  loadingMessage: string;
  selectFormErrors: {
    summary: string;
    category?: string;
    numQuestions?: string;
    difficulty?: string;
  };
  setCategory: React.Dispatch<React.SetStateAction<Category>>;
  category: Category;
  handleSelectionFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  numQuestions: number;
  setNumQuestions: React.Dispatch<React.SetStateAction<number>>;
  difficulty: Difficulty;
  difficulties: Difficulty[];
  setDifficulty: React.Dispatch<React.SetStateAction<Difficulty>>;
};

const SelectForm = ({
  categories,
  setCategory,
  category,
  handleSelectionFormSubmit,
  numQuestions,
  setNumQuestions,
  difficulty,
  setDifficulty,
  difficulties,
  isLoading,
  loadingMessage,
  selectFormErrors,
}: SelectFormProps) => {
  const categoryHasError = Boolean(selectFormErrors.category);
  const difficultyHasError = Boolean(selectFormErrors.difficulty);
  const immediateNumQuestionsError =
    Number.isNaN(numQuestions) || numQuestions < 1
      ? "Choose at least 1 question."
      : numQuestions > 50
        ? "Choose 50 questions or fewer."
        : "";
  const displayedNumQuestionsError =
    selectFormErrors.numQuestions || immediateNumQuestionsError;
  const hasNumQuestionsError = Boolean(displayedNumQuestionsError);

  return (
    <div className="flex w-full items-start justify-center px-4 pt-2 pb-6 text-slate-100">
      <form
        onSubmit={handleSelectionFormSubmit}
        method="post"
        className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur"
      >
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            Quiz Setup
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">Trivia Game</h1>
          <p className="mt-3 text-sm text-slate-400">
            Pick your category, difficulty, and number of questions.
          </p>
        </div>

        {selectFormErrors.summary && (
          <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            <p className="font-semibold">There’s a problem with your setup.</p>
            <p className="mt-1 text-rose-200">{selectFormErrors.summary}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-200"
              htmlFor="category"
            >
              Select a category
            </label>
            <select
              className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 text-slate-100 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                categoryHasError
                  ? "border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30"
                  : "border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              }`}
              disabled={isLoading}
              value={category.id}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                const selectedCategory = categories.find(
                  (c) => c.id === selectedId,
                );

                if (selectedCategory) {
                  setCategory(selectedCategory);
                }
              }}
              name="category"
              id="category"
            >
              {categories.map((c) => (
                <option key={c.name} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categoryHasError && (
              <p className="text-sm font-medium text-rose-300">
                {selectFormErrors.category}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-200"
              htmlFor="numQuestions"
            >
              Number of questions
            </label>
            <input
              className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 text-slate-100 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                hasNumQuestionsError
                  ? "border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30"
                  : "border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              }`}
              disabled={isLoading}
              id="numQuestions"
              type="number"
              aria-invalid={hasNumQuestionsError}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
            {hasNumQuestionsError && (
              <p className="text-sm font-medium text-rose-300">
                {displayedNumQuestionsError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-200"
              htmlFor="difficulty"
            >
              Select a difficulty
            </label>
            <select
              className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 text-slate-100 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                difficultyHasError
                  ? "border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30"
                  : "border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              }`}
              disabled={isLoading}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              name="difficulty"
              id="difficulty"
            >
              {difficulties.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {difficultyHasError && (
              <p className="text-sm font-medium text-rose-300">
                {selectFormErrors.difficulty}
              </p>
            )}
          </div>
        </div>

        <button
          className="mt-8 w-full rounded-2xl bg-sky-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Loading..." : "Start"}
        </button>

        {loadingMessage && (
          <p className="mt-4 text-center text-sm text-sky-300">
            {loadingMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default SelectForm;
