type RichName = {
  prettified: string;
  actual: string;
  emoji: string | null;
};
export interface Subject {
  id: string;
  name: RichName;
  teachers: string[];
  room: string | null;

  term?: SubjectTerm;
}
//? name?
export type ScheduleSubject = Omit<Subject, "average" | "id" | "term"> & {
  startsAt: Date;
  endsAt: Date;
};
// TODO: distinguish between quarterly and semester terms
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
  letter: string | null;
};
export type GradeObject = {
  [key: string]: SubjectGrade | null;
  overall: SubjectGrade | null;
};
export type SubjectYear = "current" | "previous";
export interface SubjectSummary {
  id: string;
  name: RichName;
  term: SubjectTerm;
  //this is the only way to get the current term
  currentTermIndex: number | null;
  academics: {
    running: GradeObject;
    posted: GradeObject;
    categories: {
      id: string;
      name: string;
      average: SubjectGrade | null;
      derivedWeight: number | null;
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
  year: SubjectYear;
}
export type RichSubjectAttendance = {
  date: Date;
  code: string;
  reason?: string;
}[];
export type AnnouncementEntry = {
  text: string;
  isNew?: boolean;
};
export type AnnouncementSectionData =
  | { type: "list"; content: AnnouncementEntry[] }
  | { type: "table"; content: string[][] };
export type AnnouncementSection = {
  title: string;
  emoji: string;
} & AnnouncementSectionData;
export interface PersonalDetails {
  firstName: string;
  middleName?: string;
  lastName: string;
  studentNumber: string;
  personalEducationNumber: string;
  taRoom?: string;
  locker?: string;
  schoolName: string;
  nextSchoolName?: string;
  graduationYear: string;
  grade: number;
  parkingSpaceNumber?: string;
  licensePlateNumber?: string;
  photoURL?: string;
  addresses: {
    physical?: string;
    secondaryPhysical?: string;
    mailing?: string;
    other?: string;
    // label -> value
    custom: Record<string, string>;
  };
}
export enum AssignmentStatus {
  Graded,
  Missing,
  Exempt,
  Ungraded,
}
export type AssignmentSubmissionFile = {
  id: string;
  name: string;
  submittedAt: Date;
};
export type AssignmentSubmissionState = {
  isAllowed: boolean;
  file?: AssignmentSubmissionFile;
  isOpen: boolean;
};
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
export interface TranscriptEntry {
  year: number;
  grade: number;
  subjectName: string;
  finalGrade: number | null;
  creditAmount: number | null;
}
export interface CreditSummaryEntry {
  years: [number, number];
  grade: number;
  transcriptCredits: number;
  adjustedCredits: number;
  totalCredits: number;
}
export interface ProgramRequirement {
  name: string;
  code: string;
  entries: ProgramRequirementEntry[];
}
export enum ProgramRequirementEntryStatus {
  Included = "Included",
  Pending = "Pending",
  AlreadyCounted = "AlreadyCounted",
  Excluded = "Excluded",
}
export interface ProgramRequirementEntry {
  name: string;
  code: string;
  grade: number;
  years: [number, number];
  equivalentContentCode?: string;
  requirement: {
    name: string;
    code: string;
    totalEntries: number;
  };
  status: ProgramRequirementEntryStatus;
  alternativeEntry?: Omit<ProgramRequirementEntry, "alternativeEntry">;
  completedUnits: number;
}

export interface ProgramEntry {
  name: string;
  code: string;
  requiredUnits: number;
  completedUnits: number;
  pendingUnits?: number;
  excessUnits?: number;
  creditsWaived?: number;
  isIncluded: boolean;
  requirements?: Array<
    ProgramMinifiedRequirement & { requirements?: ProgramMinifiedRequirement[] }
  >;
}
export interface ProgramMinifiedRequirement {
  code: string;
  name?: string;
  requiredUnits: number;
  completedUnits: number;
  pendingUnits?: number;
  excessUnits?: number;
  creditsWaived: number;
}
export interface TranscriptEducationPlan {
  id: string;
  name: string;
  isInitial: boolean;
}
