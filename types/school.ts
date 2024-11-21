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
export type AnnouncementSection = { heading: string; items: string[] };
