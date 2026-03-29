import type { Category } from "./types";

export function shuffleArray(array: any) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element using ES6 destructuring.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export const getApiUrl = (
  numQuestions: number,
  category: Category,
  difficulty: string,
) => {
  return `https://opentdb.com/api.php?amount=${encodeURIComponent(numQuestions)}&category=${encodeURIComponent(category.id)}&difficulty=${encodeURIComponent(difficulty.toLocaleLowerCase())}&type=multiple`;
};
