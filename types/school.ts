export interface Subject {
  name: string;
  teachers: string[];
  room: string | null;
  gpa: number | null;
}
//? name?
export type ScheduleSubject = Partial<
  Pick<Subject, "name" | "room" | "teachers">
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
