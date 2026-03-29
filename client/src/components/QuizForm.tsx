import { Errors } from "../App";
import type { SelectionDictionary } from "../types";
import Question, { type QuestionData } from "./Question";

type QuizFormProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  questions: QuestionData[];
  quizSubmitted: boolean;
  selection: SelectionDictionary;
  setSelection: React.Dispatch<React.SetStateAction<SelectionDictionary>>;
  score: number | null;
  errors: string;
  setErrors: React.Dispatch<React.SetStateAction<string>>;
};

const QuizForm = ({
  handleSubmit,
  questions,
  selection,
  quizSubmitted,
  setSelection,
  setErrors,
  score,
  errors,
}: QuizFormProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur"
      >
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            Quiz In Progress
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">Trivia Game</h1>
          <p className="mt-3 text-sm text-slate-400">
            Answer every question, then submit to see your score.
          </p>
        </div>

        <div className="space-y-6">
        {questions.map((q) => (
          <Question
            setErrors={setErrors}
            quizSubmitted={quizSubmitted}
            key={q.id}
            selection={selection}
            questionData={q}
            setSelection={setSelection}
          />
        ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            disabled={quizSubmitted}
            name="action"
            type="submit"
            value="submit"
          >
            Submit
          </button>
          <button
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            type="submit"
            name="action"
            value="reset"
          >
            Back
          </button>
        </div>

        <div className="mt-6 space-y-2 text-sm text-rose-300">
          <Errors errors={errors} />
        </div>

        {quizSubmitted && (
          <p className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-lg font-semibold text-emerald-300">
            Score: {score} / {Object.keys(questions).length}
          </p>
        )}
      </form>
    </div>
  );
};

export default QuizForm;
