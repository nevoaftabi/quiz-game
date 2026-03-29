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
    <>
      <form onSubmit={handleSubmit}>
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
        <br />
        <button
          disabled={quizSubmitted}
          name="action"
          type="submit"
          value="submit"
        >
          Submit
        </button>
        <button type="submit" name="action" value="reset">
          Back
        </button>
        {errors
          .split("✖")
          .filter(Boolean)
          .map((part, i) => (
            <p key={i}>✖ {part.trim()}</p>
          ))}
        {quizSubmitted && (
          <p>
            Score: {score} / {Object.keys(questions).length}
          </p>
        )}
      </form>
    </>
  );
};

export default QuizForm;
