import { Skeleton } from "@/components/ui/skeleton";
import { formatCountdown } from "@/helpers/format-countdown";

export function CountdownTimer({
  timeToNextSubject,
  isBreak,
  hasClassesStarted,
}: {
  timeToNextSubject: number | null;
  isBreak: boolean;
  hasClassesStarted: boolean;
}) {
  if (!timeToNextSubject || !hasClassesStarted) return null;
  const countdown = formatCountdown(timeToNextSubject);
  return (
    <p
      id="schedule-countdown"
      className="row-start-1 col-start-1 flex items-center text-sm"
    >
      {isBreak ? `Next class in ${countdown}` : `${countdown} left`}
    </p>
  );
}
export function CountdownTimerSkeleton() {
  return (
    <Skeleton
      id="schedule-countdown"
      className="row-start-1 col-start-1 h-5 w-fit"
    >
      <p className="text-sm">00:00</p>
    </Skeleton>
  );
}
