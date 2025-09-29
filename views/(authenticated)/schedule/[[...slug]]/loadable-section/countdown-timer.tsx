import { Skeleton } from "@/components/ui/skeleton";
import { formatCountdown } from "@/helpers/format-countdown";

const MAX_MINUTES = 90;
export function CountdownTimer({
  timeToNextSubject,
  isBreak,
}: {
  timeToNextSubject: number | null;
  isBreak: boolean;
}) {
  if (!timeToNextSubject || timeToNextSubject > 1000 * 60 * MAX_MINUTES)
    return null;
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
