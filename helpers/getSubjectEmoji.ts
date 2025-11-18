import subjectsEmojis from "@/data/subjects-emojis-keywords.json";


export function getSubjectEmoji(name: string) {
  const matchedKeyword = findBestKeywordMatch(name);
  return matchedKeyword
    ? subjectsEmojis[matchedKeyword as keyof typeof subjectsEmojis]
    : null;
}

const keywords = Object.keys(subjectsEmojis);
function findBestKeywordMatch(subjectName: string): string | undefined {
  // Clean the subject name: remove grade numbers and normalize whitespace
  const cleanedName = subjectName
    .replace(/\s+\d+(?:\/\d+)*$/, "") // Remove grade numbers at the end
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  for (const keyword of keywords) {
    if (isKeywordMatch(keyword, cleanedName)) {
      return keyword;
    }
  }

  return undefined;
}

function isKeywordMatch(keyword: string, subjectName: string): boolean {
  const keywordWords = keyword.split(/\s+/);
  const subjectWords = subjectName.split(/\s+/);

  // Check if all keyword words appear in the subject name in order
  let subjectIndex = 0;

  for (let i = 0; i < keywordWords.length; i++) {
    const keywordWord = keywordWords[i];
    if (!keywordWord) continue;

    const isUpperCaseKeyword =
      keywordWord === keywordWord.toUpperCase() && keywordWord.length > 1;

    let found = false;

    // Look for the keyword word starting from the current position in subject
    for (let j = subjectIndex; j < subjectWords.length; j++) {
      const subjectWord = subjectWords[j];
      if (!subjectWord) continue;

      if (isUpperCaseKeyword) {
        // For uppercase keywords, require exact whole word match (case insensitive)
        if (subjectWord.toLowerCase() === keywordWord.toLowerCase()) {
          subjectIndex = j + 1; // Move to next word
          found = true;
          break;
        }
      } else {
        // For lowercase keywords, allow partial word matching
        if (subjectWord.toLowerCase().includes(keywordWord.toLowerCase())) {
          subjectIndex = j + 1; // Move to next word
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return false;
    }
  }

  return true;
}

export function prepareSubjectNameForEmojiRetrieval(name: string) {
  return name.replace(/\s+\d+(?:\/\d+)*$/, "").toLowerCase();
}
