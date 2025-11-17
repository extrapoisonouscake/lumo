import { isTeacherAdvisory } from "@/helpers/prettifyEducationalName";
import { timezonedDayJS } from "@/instances/dayjs";
import {} from "@/types/school";
import { useEffect, useState } from "react";
import { isRowScheduleSubject } from "./table";
import { ScheduleRow } from "./types";

export function useTTNextSubject(data?: ScheduleRow[]) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const [timeToNextSubject, setTimeToNextSubject] = useState<number | null>(
    null
  );
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null);

  useEffect(() => {
    const getInterval = () => {
      return setInterval(() => {
        if (data && timeToNextSubject !== null) {
          setTimeToNextSubject((prev) =>
            typeof prev === "number" ? prev - 1000 : null
          );
        }
      }, 1000);
    };
    let intervalId = getInterval();
    let newTimeoutId: NodeJS.Timeout;
    const refresh = () => {
      if (!data) return;
      const setNullValues = () => {
        setTimeToNextSubject(null);
        setCurrentRowIndex(null);
      };
      const now = timezonedDayJS();
      if (data.length === 0) {
        setNullValues();
        return;
      }
      const newCurrentRowIndex = data.findIndex((subject) =>
        now.isBetween(subject.startsAt, subject.endsAt)
      );
      let visibleMillisecondsToNextSubject: number,
        millisecondsToNextSubject: number;
      if (newCurrentRowIndex === -1) {
        const firstSubjectStartsAt = timezonedDayJS(data[0]!.startsAt);

        if (
          now.isBefore(firstSubjectStartsAt) &&
          firstSubjectStartsAt.diff(now, "days") === 0
        ) {
          millisecondsToNextSubject = firstSubjectStartsAt.diff(
            now,
            "milliseconds"
          );
          visibleMillisecondsToNextSubject = millisecondsToNextSubject;
        } else {
          setNullValues();
          return;
        }
      } else {
        setCurrentRowIndex(newCurrentRowIndex);
        let nextRowStartingTimestamp, visibleNextRowStartingTimestamp;
        const currentRow = data[newCurrentRowIndex]!;
        const nextRow = data[newCurrentRowIndex + 1]!;
        if (newCurrentRowIndex === data.length - 1) {
          nextRowStartingTimestamp = currentRow.endsAt;
          visibleNextRowStartingTimestamp = nextRowStartingTimestamp;
        } else {
          nextRowStartingTimestamp = nextRow.startsAt;
          visibleNextRowStartingTimestamp = data
            .slice(newCurrentRowIndex + 1)
            .find(
              (row) =>
                isRowScheduleSubject(row) &&
                !row.isSpareBlock &&
                !isTeacherAdvisory(row.name.actual)
            )!.startsAt; //TA is never the last class, no need to check for undefined
        }
        const timeToNextRow = timezonedDayJS(nextRowStartingTimestamp);
        const visibleTimeToNextRow = timezonedDayJS(
          visibleNextRowStartingTimestamp
        );
        millisecondsToNextSubject = timeToNextRow.diff(now, "milliseconds");
        visibleMillisecondsToNextSubject = visibleTimeToNextRow.diff(
          now,
          "milliseconds"
        );
      }

      setTimeToNextSubject(visibleMillisecondsToNextSubject);

      clearInterval(intervalId);
      intervalId = getInterval();

      if (timeoutId) clearTimeout(timeoutId);
      newTimeoutId = setTimeout(() => {
        refresh();
      }, millisecondsToNextSubject);
      setTimeoutId(newTimeoutId);
    };
    refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearTimeout(newTimeoutId);
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [data, !!timeToNextSubject]);

  return { timeToNextSubject, currentRowIndex };
}
