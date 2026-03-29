import { Errors } from "../App";
import type { Category, Difficulty } from "../types";

export type SelectFormProps = {
  categories: Category[];
  errors: string;
  isLoading: boolean;
  loadingMessage: string;
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
  errors,
  isLoading,
  loadingMessage,
}: SelectFormProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
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

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="category">
              Select a category
            </label>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              value={category.id}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                const selectedCategory = categories.find((c) => c.id === selectedId);

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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="numQuestions">
              Number of questions
            </label>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              id="numQuestions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="difficulty">
              Select a difficulty
            </label>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="mt-6 space-y-2 text-sm text-rose-300">
          <Errors errors={errors} />
        </div>
      </form>
    </div>
  );
};

export default SelectForm;
