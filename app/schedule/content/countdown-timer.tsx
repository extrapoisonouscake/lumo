const pad = (num: number) => `${num}`.padStart(2, "0");
const MAX_MINUTES = 90;
export function CountdownTimer({
  timeToNextSubject,
}: {
  timeToNextSubject: number | null;
}) {
  if (!timeToNextSubject || timeToNextSubject > 1000 * 60 * MAX_MINUTES)
    return null;

  const hours = Math.floor(timeToNextSubject / (1000 * 60 * 60));
  const minutes = Math.floor(
    (timeToNextSubject % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((timeToNextSubject % (1000 * 60)) / 1000);
  return (
    <p className="row-start-1 col-start-1 flex items-center">
      {pad(hours)}:{pad(minutes)}:{pad(seconds)} left
    </p>
  );
}
