import { useEffect, useMemo, useState } from "react";
export function CountdownTimer({
  timeToNextSubject,
}: {
  timeToNextSubject: number | null;
}) {
  if (!timeToNextSubject || timeToNextSubject > 1000 * 60 * 60) return null;
  const [key, setKey] = useState(Date.now());
  useEffect(() => {
    setKey(Date.now());
  }, [timeToNextSubject]);
  
  const seconds = useMemo(
    () => Math.max(Math.floor(timeToNextSubject / 1000), 0),
    [key]
  );
  const minutes = Math.max(Math.floor(seconds / 60), 0);
  return (
    <p>
      {`${minutes}`.padStart(2, "0")}:{`${seconds % 60}`.padStart(2, "0")} left
    </p>
  );
}
