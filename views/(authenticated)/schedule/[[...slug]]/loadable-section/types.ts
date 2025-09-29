import { ScheduleSubject } from "@/types/school";

export type ScheduleRowType =
  | "subject"
  | "short-break"
  | "long-break"
  | "lunch";
export type ScheduleBreakRowType = Exclude<ScheduleRowType, "subject">;
export type ExtendedScheduleSubject = ScheduleSubject & { id?: string };
export type ScheduleRowSubject = {
  type: Extract<ScheduleRowType, "subject">;
} & ExtendedScheduleSubject;

export type ScheduleRow =
  | ScheduleRowSubject
  | ({ type: ScheduleBreakRowType } & Pick<
      ScheduleSubject,
      "startsAt" | "endsAt"
    >);
