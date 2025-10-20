import { SubjectGrade } from "@/types/school";

export const GRADES_VISUAL_CONFIG: Record<
  string,
  { threshold: number; color: string }
> = {
  A: { threshold: 86, color: "green-500" },
  B: { threshold: 73, color: "green-500" },
  "C+": { threshold: 67, color: "yellow-400" },
  C: { threshold: 60, color: "amber-500" },
  "C-": { threshold: 50, color: "orange-500" },
  F: { threshold: 0, color: "red-500" },
};
const getGradeInfoByMark = (mark: number) => {
  const closestMatch = Object.entries(GRADES_VISUAL_CONFIG).find(
    ([_, config]) => mark >= config.threshold
  );
  if (!closestMatch) return null;
  return { letter: closestMatch[0], ...closestMatch[1] };
};
export const getGradeLetter = (mark: number) => {
  const closestMatch = getGradeInfoByMark(mark);
  return closestMatch?.letter ?? null;
};
export function getGradeInfo(value: number | SubjectGrade) {
  const isObject = typeof value === "object";
  if (isObject && value.letter) {
    const exactMatch = GRADES_VISUAL_CONFIG[value.letter];
    if (exactMatch) return { ...exactMatch, letter: value.letter };
  }
  const closestMatch = getGradeInfoByMark(isObject ? value.mark : value);
  return closestMatch;
}
