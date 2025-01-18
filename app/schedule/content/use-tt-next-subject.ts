import { TEACHER_ADVISORY_ABBREVIATION } from "@/helpers/prettifySubjectName";
import { timezonedDayJS } from "@/instances/dayjs";
import {  } from "@/types/school";
import { useEffect, useState } from "react";
import { isRowScheduleSubject, ScheduleSubjectRow } from "./table";

export function useTTNextSubject({
  isLoading,
  data,
}: {
  isLoading: boolean;
  data: ScheduleSubjectRow[];
}) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const [timeToNextSubject, setTimeToNextSubject] = useState<number | null>();
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>();
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isLoading && timeToNextSubject !== null) {
        setTimeToNextSubject((prev) =>
          typeof prev === "number" ? prev - 1000 : null
        );
      }
    }, 1000);
    let newTimeoutId: NodeJS.Timeout;
    const refresh = () => {
      if (isLoading) return;
      const setNullValues = () => {
        setTimeToNextSubject(null);
        setCurrentRowIndex(null);
      };
      const now = timezonedDayJS();
      if (
        data.length === 0 ||
        !now.isBetween(data[0].startsAt, data.at(-1)?.endsAt)
      ) {
        setNullValues();
        return;
      }
      const newCurrentRowIndex = data.findIndex((subject) =>
        now.isBetween(subject.startsAt, subject.endsAt)
      );

      if (newCurrentRowIndex === -1) {
        setNullValues();
        return;
      }
      setCurrentRowIndex(newCurrentRowIndex);
      let nextRowStartingTimestamp, visibleNextRowStartingTimestamp;
      const currentRow = data[newCurrentRowIndex];
      const nextRow = data[newCurrentRowIndex + 1];
      if (newCurrentRowIndex === data.length - 1) {
        nextRowStartingTimestamp = currentRow.endsAt;
        visibleNextRowStartingTimestamp = nextRowStartingTimestamp;
      } else {
        let rowsToSkip = 1;
        if (isRowScheduleSubject(nextRow) && nextRow.name === TEACHER_ADVISORY_ABBREVIATION) {
          rowsToSkip = 3;
        } else if (isRowScheduleSubject(currentRow) && currentRow.name === TEACHER_ADVISORY_ABBREVIATION) {
          rowsToSkip = 2;
        }
        nextRowStartingTimestamp = nextRow.startsAt;
        visibleNextRowStartingTimestamp =
          data[newCurrentRowIndex + rowsToSkip].startsAt; //TA is never the last class, no need to check for undefined
      }
      const timeToNextRow = timezonedDayJS(nextRowStartingTimestamp);
      const visibleTimeToNextRow = timezonedDayJS(
        visibleNextRowStartingTimestamp
      );
      const millisecondsToNextSubject = timeToNextRow.diff(now, "milliseconds");
      const visibleMillisecondsToNextSubject = visibleTimeToNextRow.diff(
        now,
        "milliseconds"
      );
      setTimeToNextSubject(visibleMillisecondsToNextSubject);

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
  }, [isLoading, data, !!timeToNextSubject]);

  return { timeToNextSubject, currentRowIndex };
}
