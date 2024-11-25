import { AppleEmoji } from "@/components/misc/apple-emoji";
import { Card } from "@/components/ui/card";
import { timezonedDayJS } from "@/instances/dayjs";
const getChristmasBreakDates = (year: number) =>
  [
    timezonedDayJS(`${year}-12-25`),
    timezonedDayJS(`${year + 1}-01-05`),
  ] as const;

const visualizableErrors: Record<
  string,
  ({ day }: { day: string | undefined }) => [string, string]
> = {
  "School is not in session on that date.": ({ day }) => {
    const dateObject = timezonedDayJS(day);
    let message,
      emoji = "😴";
    const christmasDates = getChristmasBreakDates(dateObject.year());
    if (
      dateObject.isBetween(christmasDates[0], christmasDates[1], "date", "[]")
    ) {
      message = "It's Christmas!";
      emoji = "🎄";
    } else {
      message = "No school ";
      if (timezonedDayJS().isSame(dateObject, "date")) {
        message += "today!";
      } else {
        message += "on this day.";
      }
    }
    return [message, emoji];
  },
};
export function ScheduleKnownErrorCard({
  message,
  day,
}: {
  message: string;
  day: string | undefined;
}) {
  const visualData = visualizableErrors[message]?.({ day });
  return (
    <Card className="p-3 flex flex-col gap-1.5">
      <AppleEmoji
        value={visualData ? visualData[1] : "‼️"}
        textClassName="text-3xl leading-8"
        imageClassName="size-[30px]"
      />

      <p className="text-sm">{visualData ? visualData[0] : message}</p>
    </Card>
  );
}
