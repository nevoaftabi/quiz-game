import { useEffect, useState, type SetStateAction } from "react";
import { shuffleArray } from "./utils";

type ApiResponse = {
  response_code: number;
  results: Array<{
    type: string;
    difficulty: string;
    correct_answer: string;
    incorrect_answers: string[];
    question: string;
    category: string;
  }>;
};

type QuestionData = {
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

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

type QuestionProps = {
  questionData: QuestionData;
  setSelection: React.Dispatch<SetStateAction<SelectionDictionary>>;
  selection: SelectionDictionary;
  quizSubmitted: boolean;
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
  selection,
  quizSubmitted,
}: QuestionProps) => {
  return (
    <div>
      <p>{questionData.question}</p>
      {questionData.allAnswers.map((answer) => (
        <div
          style={{
            color: getAnswerColor(
              selection,
              questionData,
              quizSubmitted,
              answer,
            ),
          }}
        >
          <label key={answer}>
            <input
              disabled={quizSubmitted}
              required
              type="radio"
              name={questionData.id}
              value={answer}
              checked={selection[questionData.id] === answer}
              onChange={(e) =>
                setSelection((prev) => ({
                  ...prev,
                  [questionData.id]: e.target.value,
                }))
              }
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

interface SelectionDictionary {
  [key: string]: string;
}

function App() {
  const url =
    "https://opentdb.com/api.php?amount=5&category=18&difficulty=medium&type=multiple";
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selection, setSelection] = useState<SelectionDictionary>({});
  const [score, setScore] = useState<null | number>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch(url);
        if (result.ok) {
          const json: ApiResponse = await result.json();

          setQuestions(
            json.results.map((q) => {
              return {
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
              };
            }),
          );
        }
      } catch {
        alert("Failed to fetch");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setScore(
      questions.reduce(
        (accum, currentValue) =>
          accum +
          (selection[currentValue.id] === currentValue.correctAnswer ? 1 : 0),
        0,
      ),
    );

    setQuizSubmitted(true);

    setQuestions((questions) =>
      questions.map((q) => ({
        ...q,
        questionHighlightColor:
          selection[q.id] === q.correctAnswer ? "green" : "red",
      })),
    );
  };

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
        <button disabled={quizSubmitted} type="submit">
          Submit
        </button>
        <button>Reset</button>
        {score && (
          <p>
            Score: {score} / {Object.keys(questions).length}
          </p>
        )}
      </form>
    </>
  );
}

export default App;
