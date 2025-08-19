const pad = (num: number) => `${num}`.padStart(2, "0");

export function formatCountdown(targetTime: number) {
  let countdown;
  if (targetTime > 0) {
    const hours = Math.floor(targetTime / (1000 * 60 * 60));
    const minutes = Math.floor((targetTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((targetTime % (1000 * 60)) / 1000);
    countdown = `${pad(minutes)}:${pad(seconds)}`;
    if (hours > 0) {
      countdown = `${pad(hours)}:${countdown}`;
    }
  } else {
    countdown = "00:00";
  }
  return countdown;
}
