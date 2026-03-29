import type { SelectionDictionary } from "../types";
import Question, { type QuestionData } from "./Question";

type QuizFormProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  questions: QuestionData[];
  quizSubmitted: boolean;
  selection: SelectionDictionary;
  setSelection: React.Dispatch<React.SetStateAction<SelectionDictionary>>;
  score: number | null;
};

const QuizForm = ({
  handleSubmit,
  questions,
  selection,
  quizSubmitted,
  setSelection,
  score,
}: QuizFormProps) => {
  return (
    <>
      <form onSubmit={handleSubmit}>
        {questions.map((q) => (
          <Question
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
          Reset
        </button>
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