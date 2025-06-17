export interface Subject {
  id: string;
  name: string;
  teachers: string[];
  room: string | null;
  actualName: string;
  term?: SubjectTerm;
}
//? name?
export type ScheduleSubject = Omit<Subject, "average" | "id" | "term"> & {
  startsAt: Date;
  endsAt: Date;
};
export enum SubjectTerm {
  FirstSemester = "FIRST_SEMESTER",
  SecondSemester = "SECOND_SEMESTER",
  FullYear = "FULL_YEAR",
  FirstQuarter = "FIRST_QUARTER",
  SecondQuarter = "SECOND_QUARTER",
  ThirdQuarter = "THIRD_QUARTER",
  FourthQuarter = "FOURTH_QUARTER",
}
export type SubjectGrade = {
  mark: number;
  letter?: string;
};
export interface SubjectSummary {
  id: string;
  name: string;
  term: SubjectTerm;
  academics: {
    averages: {
      [key: string]: SubjectGrade | null;
      overall: SubjectGrade | null;
    };
    posted: SubjectGrade | null;
    categories: {
      id: string;
      name: string;
      average: SubjectGrade | null;
      terms: {
        name: string;
        weight: number | null;
        average: SubjectGrade | null;
      }[];
    }[];
  };
  attendance: {
    tardy: number;
    absent: number;
    dismissed: number;
  };
}
export type AnnouncementSectionData =
  | { type: "list"; content: string[] }
  | { type: "table"; content: string[][] };
export type AnnouncementSection = {
  title: string;
  emoji: string;
} & AnnouncementSectionData;
export interface PersonalDetails {
  firstName: string;
  middleName?: string;
  lastName: string;
  studentNumber: number;
  personalEducationNumber: number;
  taRoom?: string;
  locker?: string;
  schoolName: string;
  nextSchoolName?: string;
  graduationYear: number;
  grade: number;
  parkingSpaceNumber?: number;
  licensePlateNumber?: number;
  photoURL?: string;
}
export enum AssignmentStatus {
  Unknown,
  Ungraded,
  Graded,
  Missing,
  Exempt,
}
export type Assignment = {
  id: string;
  name: string;
  dueAt: Date;
  assignedAt: Date;
  weight?: number;
  feedback: string | null;
  classAverage: number | null;
  categoryId: string;
  maxScore: number;
} & (
  | {
      status: AssignmentStatus.Graded;
      score: number;
    }
  | {
      status: Exclude<AssignmentStatus, AssignmentStatus.Graded>;
      score: number | null;
    }
);
export interface TermEntry {
  id: string;
  name: string;
}
