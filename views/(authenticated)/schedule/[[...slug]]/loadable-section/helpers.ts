import { prepareTableDataForSorting } from "@/helpers/prepareTableDataForSorting";
import { timezonedDayJS } from "@/instances/dayjs";
import { ScheduleSubject } from "@/types/school";
import {
  ScheduleBreakRowType,
  ScheduleRow,
} from "@/views/(authenticated)/schedule/[[...slug]]/loadable-section/types";

export const addBreaksToSchedule = (data: ScheduleSubject[]): ScheduleRow[] => {
  const preparedData = prepareTableDataForSorting(data);
  const filledIntervals: ScheduleRow[] = [];
  let wasLunchFound = false;
  for (let i = 0; i < preparedData.length; i++) {
    const currentElement = preparedData[i]!;
    filledIntervals.push({ type: "subject", ...currentElement });

    if (i < preparedData.length - 1) {
      const currentEnd = currentElement.endsAt;
      const nextStart = preparedData[i + 1]!.startsAt;

      if (currentEnd < nextStart) {
        let type: ScheduleBreakRowType;
        const minutesDiff = timezonedDayJS(nextStart).diff(
          currentEnd,
          "minutes"
        );
        if (minutesDiff >= 10) {
          if (minutesDiff >= 20) {
            if (wasLunchFound) {
              type = "long-break";
            } else {
              type = "lunch";
              wasLunchFound = true;
            }
          } else {
            type = "long-break";
          }
        } else {
          type = "short-break";
        }

        filledIntervals.push({
          type,
          startsAt: currentEnd,
          endsAt: nextStart,
        });
      }
    }
  }
  return filledIntervals;
};
