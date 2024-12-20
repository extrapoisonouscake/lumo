import { useEffect, useMemo, useState } from "react";
export function CountdownTimer({
  timeToNextSubject,
}: {
  timeToNextSubject: number | null;
}) {
  if (!timeToNextSubject || timeToNextSubject > 1000 * 60 * 60) return null;
  const [key, setKey] = useState(Date.now());
  useEffect(() => {
    console.log({ timeToNextSubject });
    setKey(Date.now());
  }, [timeToNextSubject]);
  console.log({ key });
  const seconds = useMemo(
    () => Math.max(Math.floor(timeToNextSubject / 1000), 0),
    [key]
  );
  const minutes = Math.max(Math.floor(seconds / 60), 0);
  return (
    <div>
      {`${minutes}`.padStart(2, "0")}:{`${seconds % 60}`.padStart(2, "0")}
    </div>
  );
}
