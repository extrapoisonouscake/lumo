import { AppleEmoji } from "@/components/misc/apple-emoji";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

export function ErrorCard({
  children = "Something went wrong.",
  emoji = "‼️",
}: {
  children?: string | ReactNode;
  emoji?: string;
}) {
  return (
    <Card className="p-3 flex flex-col gap-1.5">
      <AppleEmoji
        value={emoji}
        textClassName="text-3xl leading-8"
        imageClassName="size-[30px]"
      />

      <p className="text-sm">{children}</p>
    </Card>
  );
}
