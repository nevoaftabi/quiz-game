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
  type ApiResponse,
  type Mode,
  type SelectionDictionary,
  type Category,
} from "./types";
import z from "zod";
import { makeCategorySchema } from "./schemas";
import SelectForm from "./components/SelectForm";
import QuizForm from "./components/QuizForm";
import type { QuestionData } from "./components/Question";

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
