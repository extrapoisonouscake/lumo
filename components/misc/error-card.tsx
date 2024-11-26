import { AppleEmoji } from "@/components/misc/apple-emoji";
import { Card } from "@/components/ui/card";

export function ErrorCard({
  message = "Something went wrong.",
  emoji = "‼️",
}: {
  message?: string;
  emoji?: string;
}) {
  return (
    <Card className="p-3 flex flex-col gap-1.5">
      <AppleEmoji
        value={emoji}
        textClassName="text-3xl leading-8"
        imageClassName="size-[30px]"
      />

      <p className="text-sm">{message}</p>
    </Card>
  );
}
