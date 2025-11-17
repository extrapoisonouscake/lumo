const educationAbbreviations = new Set([
  "EFP",
  "ADST",
  "PhD",
  "MBA",
  "BA",
  "MA",
  "UN",
  "AP",
  "2D",
  "3D",
  "IEP",
  "LD",
  "WW2",
  "WW1",
  "WWII",
  "WWI",
  "FRQ",
  "MCQ",
]);
const TEACHER_ADVISORY_ABBREVIATIONS = ["ta", "teacher advisory"];
export const isTeacherAdvisory = (name: string) =>
  TEACHER_ADVISORY_ABBREVIATIONS.includes(name.toLowerCase());

const smallWords = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "nor",
  "at",
  "by",
  "for",
  "in",
  "of",
  "on",
  "to",
  "up",
  "with",
]);
export const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};
function containsBothCases(str: string) {
  const hasUppercase = /[A-Z]/.test(str);
  const hasLowercase = /[a-z]/.test(str);
  return hasUppercase && hasLowercase;
}
const processWord = ({
  word,
  prevChar,
  nextChar,
}: {
  word: string;
  prevChar: string | undefined;
  nextChar: string | undefined;
}) => {
  if (
    educationAbbreviations.has(word.toUpperCase()) &&
    !containsBothCases(word)
  ) {
    return word.toUpperCase();
  } else if (smallWords.has(word.toLowerCase())) {
    if (prevChar === " " || nextChar === " ") {
      return word.toLowerCase();
    } else {
      return word;
    }
  } else if (/^[IVXLCDM]+$/i.test(word) && !containsBothCases(word)) {
    return word.toUpperCase();
  } else {
    return capitalize(word);
  }
};
export const prettifyEducationalName = (name: string) => {
  let processedName = "";
  let currentWord = "";
  for (let i = 0; i < name.length; i++) {
    const char = name[i]!;

    if (char.match(/\p{L}/u)) {
      currentWord += char;
    } else {
      const prevChar = processedName.at(-1);
      const nextChar = name[i + 1];
      processedName += processWord({ word: currentWord, prevChar, nextChar });
      currentWord = "";
      processedName += char;
    }
  }
  processedName += processWord({
    word: currentWord,
    prevChar: processedName.at(-1),
    nextChar: undefined,
  });
  // Remove spaces after opening brackets and before closing brackets
  // Ensure commas are followed by a space
  return processedName
    .replace(/([\(\[\{])\s+|\s+([\)\]\}])/g, "$1$2")
    .replace(/,([^\s])/g, ", $1");
};
