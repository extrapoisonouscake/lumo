export interface Subject {
  id: string;
  name: string;
  teachers: string[];
  room: string | null;
  actualName: string;
  gpa: number | null;
}
//? name?
export type ScheduleSubject = Omit<Subject, "gpa" | "id"> & {
  startsAt: Date;
  endsAt: Date;
};
export type AnnouncementSectionItemsFragment = {
  items: string[];
};
export type AnnouncementSection = {
  heading: string;
  emoji: string;
} & (AnnouncementSectionItemsFragment | { table: string[][] });
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
  id: string;
  name: string;
  dueAt: Date;
  assignedAt: Date;
  weight?: number;
  feedback: string | null;
  status: AssignmentStatus;
  score: number | null;
  maxScore: number | null;
  classAverage: number | null;
}
export interface Term {
  id: string;
  name: string;
}
