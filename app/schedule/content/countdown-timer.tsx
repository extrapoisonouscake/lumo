import { Skeleton } from "@/components/ui/skeleton";

const pad = (num: number) => `${num}`.padStart(2, "0");
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
  let countdown;
  if (timeToNextSubject > 0) {
    const hours = Math.floor(timeToNextSubject / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeToNextSubject % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeToNextSubject % (1000 * 60)) / 1000);
    countdown = `${pad(minutes)}:${pad(seconds)}`;
    if (hours > 0) {
      countdown = `${pad(hours)}:${countdown}`;
    }
  } else {
    countdown = "00:00";
  }
  return (
    <p className="schedule-countdown row-start-1 col-start-1 flex items-center text-sm">
      {isBreak ? `Next class in ${countdown}` : `${countdown} left`}
    </p>
  );
}
export function CountdownTimerSkeleton() {
  return (
    <Skeleton className="schedule-countdown row-start-1 col-start-1 h-5 w-fit">
      <p className="text-sm">00:00</p>
    </Skeleton>
  );
}
