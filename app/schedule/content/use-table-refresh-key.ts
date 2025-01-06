import { dayjs, timezonedDayJS } from "@/instances/dayjs";
import { ScheduleSubject } from "@/types/school";
import { useEffect, useState } from "react";

export function useTableRefreshKey({
  isLoading,
  data,
}: {
  isLoading: boolean;
  data: ScheduleSubject[];
}) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const [dataKey, setDataKey] = useState(Date.now());
  const [timeToNextSubject, setTimeToNextSubject] = useState<number | null>();
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
      const now = timezonedDayJS();
      const currentSubjectIndex = data.findIndex((subject) =>
        now.isBetween(subject.startsAt, subject.endsAt)
      );
      if (
        currentSubjectIndex === -1 &&
        !dayjs(data[0]?.startsAt).isAfter(new Date())
      ) {
        setTimeToNextSubject(null);
        return;
      }
      const nextSubjectTime = timezonedDayJS(
        currentSubjectIndex === data.length - 1
          ? data[currentSubjectIndex].endsAt
          : data[currentSubjectIndex + 1].startsAt
      );
      const millisecondsToNextSubject = nextSubjectTime.diff(
        now,
        "milliseconds"
      );
      setTimeToNextSubject(millisecondsToNextSubject);

      if (timeoutId) clearTimeout(timeoutId);
      newTimeoutId = setTimeout(() => {
        setDataKey(Date.now());
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

  return { dataKey, timeToNextSubject };
}
