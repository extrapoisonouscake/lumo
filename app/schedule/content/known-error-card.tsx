import { AppleEmoji } from "@/components/misc/apple-emoji";
import { Card } from "@/components/ui/card";

const visualizableErrors: Record<string, [string, string]> = {
  "School is not in session on that date.": ["No school today!", "😴"],
};
export function ScheduleKnownErrorCard({ message }: { message: string }) {
  const visualData = visualizableErrors[message];
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
