/*
TODO: 
-Category count lookup: https://opentdb.com/api_count.php?category=CATEGORY_ID_HERE
-Form verification with Zod (start form, quiz form)
*/

import { useEffect, useRef, useState } from "react";
import {
  decodeHtmlEntities,
  getApiUrl as getApiUrl,
  shuffleArray,
} from "./utils";
import {
  type Difficulty,
  getAnswerColor,
  type ApiResponse,
  type Mode,
  type QuestionData,
  type QuestionProps,
  type SelectionDictionary,
  type SelectFormProps,
  type Category,
} from "./types";
import z from "zod";

const DifficultySchema = z.enum(["Easy", "Medium", "Hard"]);

const makeCategorySchema = (categories: Category[]) =>
  z
    .object({
      id: z.number().min(9).max(32),
      name: z.string().min(1).max(50),
      numQuestions: z.number().min(1).max(50),
      difficulty: DifficultySchema,
    })
    .refine(
      (value) =>
        categories.some(
          (category) =>
            category.id === value.id && category.name === value.name,
        ),
      {
        message: "Category is not in the allowed categories list",
      },
    );

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

const QuizForm = ({
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
}: SelectFormProps) => {
  return (
    <form onSubmit={handleSelectionFormSubmit} method="post">
      <label htmlFor="">Select a category</label>
      <select
        value={category.id}
        onChange={(e) => {
          const selectedId = Number(e.target.value);
          const selectedCategory = categories.find((c) => c.id === selectedId);

          if (selectedCategory) {
            setCategory(selectedCategory);
          }
        }}
        name="category"
        id=""
      >
        {categories.map((c) => (
          <option key={c.name} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <br />
      <label htmlFor="">Number of questions</label>
      <input
        type="number"
        value={numQuestions}
        onChange={(e) => setNumQuestions(Number(e.target.value))}
      />
      <br />
      <label htmlFor="">Select a difficulty</label>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
        name="difficulty"
      >
        {difficulties.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <br />
      <button type="submit">Start</button>
      {errors
        .split("✖")
        .filter(Boolean)
        .map((part, i) => (
          <p key={i}>✖ {part.trim()}</p>
        ))}
    </form>
  );
};

function App() {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selection, setSelection] = useState<SelectionDictionary>({});
  const [score, setScore] = useState<null | number>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState("");
  const [category, setCategory] = useState<Category>({
    id: -1,
    name: "Select a category",
  });
  const [numQuestions, setNumQuestions] = useState(1);
  const hasFetched = useRef(false);
  const [mode, setMode] = useState<Mode>("select");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");

  const [difficulties] = useState<Difficulty[]>(["Easy", "Medium", "Hard"]);

  const CategorySchema = makeCategorySchema(categories);

  const fetchQuestions = async () => {
    try {
      console.log("here");
      const result = await fetch(
        getApiUrl(numQuestions, category!, difficulty),
      );
      console.log(getApiUrl(numQuestions, category!, difficulty));
      console.log("here2");
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
        setMode("quiz");
      } else {
        alert("Failed to fetch");
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
          setCategories(json.trivia_categories);
          setCategory(json.trivia_categories[0]);
        } else {
          alert("Failed to fetch categories");
        }
      } catch {
        alert("Failed to fetch categories");
      }
    };
    fetchData();
  }, []);

  const handleSelectionFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const result = CategorySchema.safeParse({
      ...category,
      difficulty,
      numQuestions
    });

    if (result.success) {
      await fetchQuestions();
    } else {
      setErrors(z.prettifyError(result.error));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;

    const action = submitter?.value;

    if (action === "reset") {
      setQuestions([]);
      setScore(null);
      setMode("select");
      setQuizSubmitted(false);

      return;
    }

    if (action === "submit") {
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
    }
  };

  if (mode === "quiz") {
    return (
      <QuizForm
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
      <SelectForm
        errors={errors}
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
    </>
  );
}

export default App;
