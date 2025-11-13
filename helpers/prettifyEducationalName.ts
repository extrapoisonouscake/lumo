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
const directReplacements: Record<string, string> = {};
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
      if (educationAbbreviations.has(word.toUpperCase()))
        return word.toUpperCase();
      const parts = word.match(/[a-zA-Z]+|\d+|[^a-zA-Z\d]+/g) || [word];

      return parts
        .map((part, j) => {
          if (
            educationAbbreviations.has(part.toUpperCase()) ||
            /^\d+[a-zA-Z]+$/.test(part) ||
            /^[IVXLCDM]+$/i.test(part)
          ) {
            return part.toUpperCase();
          } else if (
            (i === 0 || !smallWords.has(part)) &&
            j === 0 &&
            !/^\d+(st|nd|rd|th)$/i.test(part)
          ) {
            return capitalize(part);
          } else {
            return part;
          }
        })
        .join("");
    })
    .join("");

  // Remove spaces after opening brackets and before closing brackets
  return processedName.replace(/([\(\[\{])\s+|\s+([\)\]\}])/g, "$1$2");
};
