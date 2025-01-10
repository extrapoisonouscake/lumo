export interface Subject {
  name: string;
  teachers: string[];
  room: string | null;
  gpa: number | null;
  actualName: string;
}
//? name?
export type ScheduleSubject = Partial<
  Pick<Subject, "name" | "room" | "teachers" | "actualName">
> & {
  startsAt: Date;
  endsAt: Date;
};
export type AnnouncementSection = {
  heading: string;
  emoji: string;
} & (
  | {
      items: string[];
    }
  | { table: string[][] }
);
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
export interface Assignment {
  name: string;
  dueAt: Date;
  assignedAt: Date;
  weight?: number;
  feedback: string | null;
  status: AssignmentStatus;
  score: number | null;
  maxScore: number | null;
}
