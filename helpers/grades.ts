import { SubjectGrade } from "@/types/school";

export const GRADES_VISUAL_CONFIG: Record<
  string,
  {
    threshold: number;
    textClassName: string;
    secondaryTextClassName: string;
    backgroundClassName: string;
    fillClassName: string;
    plainColor: string;
  }
> = {
  A: {
    threshold: 86,
    textClassName: "text-green-500",
    secondaryTextClassName: "text-green-500",
    backgroundClassName: "bg-green-500",
    fillClassName: "fill-green-500",
    plainColor: "var(--color-green-500)",
  },
  B: {
    threshold: 73,
    textClassName: "text-green-500",
    secondaryTextClassName: "text-green-500",
    backgroundClassName: "bg-green-500",
    fillClassName: "fill-green-500",
    plainColor: "var(--color-green-500)",
  },
  "C+": {
    threshold: 67,
    textClassName: "text-yellow-500",
    secondaryTextClassName: "text-yellow-400",
    backgroundClassName: "bg-yellow-400",
    fillClassName: "fill-yellow-400",
    plainColor: "var(--color-yellow-400)",
  },
  C: {
    threshold: 60,
    secondaryTextClassName: "text-amber-500",
    textClassName: "text-amber-500",
    backgroundClassName: "bg-amber-500",
    fillClassName: "fill-amber-500",
    plainColor: "var(--color-amber-500)",
  },
  "C-": {
    threshold: 50,
    secondaryTextClassName: "text-orange-500",
    textClassName: "text-orange-500",
    backgroundClassName: "bg-orange-500",
    fillClassName: "fill-orange-500",
    plainColor: "var(--color-orange-500)",
  },
  F: {
    threshold: 0,
    secondaryTextClassName: "text-red-500",
    textClassName: "text-red-500",
    backgroundClassName: "bg-red-500",
    fillClassName: "fill-red-500",
    plainColor: "var(--color-red-500)",
  },
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
