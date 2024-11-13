export interface Subject {
  name: string;
  teachers: string[];
  room: string;
  gpa: number | null;
}
//? name?
export type ScheduleSubject = Partial<
  Pick<Subject, "name" | "room" | "teachers">
> & {
  startsAt: string;
  endsAt: string;
};
