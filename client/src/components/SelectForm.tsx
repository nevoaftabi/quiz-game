import type { Category, Difficulty } from "../types";

export type SelectFormProps = {
  categories: Category[];
  errors: string;
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

export default SelectForm;