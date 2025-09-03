const educationAbbreviations = new Set([
  "EFP",
  "ADST",
  "PhD",
  "MBA",
  "BA",
  "MA",
  "BSc",
  "MSc",
  "UN",
  "AP",
]);
export const TEACHER_ADVISORY_ABBREVIATION = "TA";
const directReplacements: Record<string, string> = {
  "teacher advisory": TEACHER_ADVISORY_ABBREVIATION,
};
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
export const prettifyEducationalName = (name: string) => {
  const lowerCaseName = name.toLowerCase();
  const replacement = directReplacements[lowerCaseName];
  if (replacement) return replacement;

  const processedName = lowerCaseName
    .split(/(\s+|[()[\]{}–—-])/g)
    .map((word, i) => {
      if (
        educationAbbreviations.has(word.toUpperCase()) ||
        /^\d+[a-zA-Z]+$/.test(word) ||
        /^[IVXLCDM]+$/i.test(word)
      ) {
        return word.toUpperCase();
      } else if (
        (i === 0 || !smallWords.has(word)) &&
        !/^\d+(st|nd|rd|th)$/i.test(word)
      ) {
        return capitalize(word);
      } else {
        return word;
      }
    })
    .join("");

  // Remove spaces after opening brackets and before closing brackets
  return processedName.replace(/([\(\[\{])\s+|\s+([\)\]\}])/g, "$1$2");
};
