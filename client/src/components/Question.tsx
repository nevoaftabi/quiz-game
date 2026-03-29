import type { SetStateAction } from "react";
import { type SelectionDictionary } from "../types";

export type QuestionData = {
  id: string;
  difficulty: string;
  category: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allAnswers: string[];
  question: string;
  type: string;
  questionHighlightColor: string;
};

type QuestionProps = {
  questionData: QuestionData;
  setSelection: React.Dispatch<SetStateAction<SelectionDictionary>>;
  selection: SelectionDictionary;
  quizSubmitted: boolean;
  setErrors: React.Dispatch<SetStateAction<string>>;
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

  return "black";
};

const Question = ({
  questionData,
  setSelection,
  setErrors,
  selection,
  quizSubmitted,
}: QuestionProps) => {
  return (
    <div>
      <p>{questionData.question}</p>
      {questionData.allAnswers.map((answer) => (
        <div
          key={answer}
          style={{
            color: getAnswerColor(
              selection,
              questionData,
              quizSubmitted,
              answer,
            ),
          }}
        >
          <label>
            <input
              disabled={quizSubmitted}
              type="radio"
              name={questionData.id}
              value={answer}
              checked={selection[questionData.id] === answer}
              onChange={(e) => {
                setErrors("");
                setSelection((prev) => ({
                  ...prev,
                  [questionData.id]: e.target.value,
                }));
              }}
            />
            {answer}
            <br />
          </label>
        </div>
      ))}
      <hr />
    </div>
  );
};

export default Question;
