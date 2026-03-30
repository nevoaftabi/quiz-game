import type { SetStateAction } from "react";
import type { QuestionData, SelectionDictionary } from "../types";

type QuestionProps = {
  questionData: QuestionData;
  setSelection: React.Dispatch<SetStateAction<SelectionDictionary>>;
  selection: SelectionDictionary;
  quizSubmitted: boolean;
  showMissingAnswers: boolean;
};

const getAnswerColor = (
  selection: SelectionDictionary,
  questionData: QuestionData,
  quizSubmitted: boolean,
  thisAnswer: string,
) => {
  if (quizSubmitted) {
    if (thisAnswer === questionData.correctAnswer) {
      return "green";
    }

    if (selection[questionData.id] === thisAnswer) {
      return "red";
    }
  }

  return "white";
};

const Question = ({
  questionData,
  setSelection,
  selection,
  quizSubmitted,
  showMissingAnswers,
}: QuestionProps) => {
  const isMissingAnswer =
    showMissingAnswers && selection[questionData.id] === undefined;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isMissingAnswer
          ? "border-rose-500/60 bg-rose-500/10 shadow-lg shadow-rose-950/20"
          : "border-slate-800 bg-slate-950/60"
      }`}
    >
      <p className="mb-4 text-lg font-semibold text-slate-100">
        {questionData.question}
      </p>
      {isMissingAnswer && (
        <p className="mb-4 text-sm font-medium text-rose-300">
          Choose one answer for this question.
        </p>
      )}
      {questionData.allAnswers.map((answer) => (
        <div
          key={answer}
          className="mb-3 last:mb-0"
          style={{
            color: getAnswerColor(
              selection,
              questionData,
              quizSubmitted,
              answer,
            ),
          }}
        >
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 transition hover:border-sky-500/40 hover:bg-slate-900">
            <input
              className="h-4 w-4 accent-sky-500"
              disabled={quizSubmitted}
              type="radio"
              name={questionData.id}
              value={answer}
              checked={selection[questionData.id] === answer}
              onChange={(e) => {
                setSelection((prev) => ({
                  ...prev,
                  [questionData.id]: e.target.value,
                }));
              }}
            />
            <span className="text-base leading-6">{answer}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default Question;
