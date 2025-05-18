import { SubjectGrade } from "@/types/school";

const GRADES_CONFIG = [
  { threshold: 80, color: "green-500", letter: "A" },
  { threshold: 70, color: "yellow-400", letter: "B" },
  { threshold: 60, color: "orange-500", letter: "C" },
  { threshold: 50, color: "red-500", letter: "D" },
  { threshold: 0, color: "red-600", letter: "F" },
];

export function getGradeInfo(value: SubjectGrade) {
  return (
    GRADES_CONFIG.find((grade) => value.mark >= grade.threshold) ||
    GRADES_CONFIG[GRADES_CONFIG.length - 1]!
  );
}
