/*
TODO: 
-Category count lookup: https://opentdb.com/api_count.php?category=CATEGORY_ID_HERE
-Form verification with Zod
*/

import { useEffect, useRef, useState } from "react";
import { decodeHtmlEntities, shuffleArray } from "./utils";
import {
  type Difficulty,
  getAnswerColor,
  type ApiResponse,
  type Mode,
  type QuestionData,
  type QuestionProps,
  type SelectionDictionary,
  type SelectModeCategories,
} from "./types";

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

type QuizProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  questions: QuestionData[];
  quizSubmitted: boolean;
  selection: SelectionDictionary;
  setSelection: React.Dispatch<React.SetStateAction<SelectionDictionary>>;
  score: number | null;
};

const Quiz = ({
  handleSubmit,
  questions,
  selection,
  quizSubmitted,
  setSelection,
  score,
}: QuizProps) => {
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
};

const SelectMode = ({
  categories,
  setCategory,
  category,
  handleStartFormSubmit,
  numQuestions,
  setNumQuestions,
  difficulty,
  setDifficulty,
  difficulties
}: SelectModeCategories) => {
  return (
    <form onSubmit={() => handleStartFormSubmit}>
      <label htmlFor="">Select a category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        name="category"
        id=""
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <br />
      <label htmlFor="">Number of questions</label>
      <input
        type="number"
        min={1}
        max={50}
        value={numQuestions}
        onChange={(e) => setNumQuestions(Number(e.target.value))}
      />
      <br />
          <label htmlFor="">Select a difficulty</label>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        name="difficulty"
        id=""
      >
        {difficulties.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button type="submit">Start</button>
    </form>
  );
};

function App() {
  const url =
    "https://opentdb.com/api.php?amount=5&category=18&difficulty=medium&type=multiple";
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selection, setSelection] = useState<SelectionDictionary>({});
  const [score, setScore] = useState<null | number>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("Select a category");
  const [numQuestions, setNumQuestions] = useState(1);
  const hasFetched = useRef(false);
  const [mode, setMode] = useState<Mode>("select");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [difficulties, setDifficulties] = useState<Difficulty[]>([ 'Easy', 'Medium', "Hard"])

  const fetchQuestions = async () => {
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

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const result = await fetch("https://opentdb.com/api_category.php");
        if (result.ok) {
          const json = await result.json();
          const categoriesArray = json.trivia_categories.map((c) => c.name);
          setCategories(categoriesArray);
          setCategory(categoriesArray[0]);
        } else {
          alert("Failed to fetch categories");
        }
      } catch {
        alert("Failed to fetch categories");
      }
    };
    fetchData();
  }, []);

  const handleStartFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // fetch question logic here
  };

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

  if (mode === "quiz") {
    return (
      <Quiz
        handleSubmit={handleSubmit}
        questions={questions}
        quizSubmitted={quizSubmitted}
        score={score}
        selection={selection}
        setSelection={setSelection}
      />
    );
  }

  return (
    <>
      <SelectMode
        setCategory={setCategory}
        category={category}
        categories={categories}
        handleStartFormSubmit={handleStartFormSubmit}
        numQuestions={numQuestions}
        difficulties={difficulties}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        setNumQuestions={setNumQuestions}
      />
    </>
  );
}

export default App;
