import { AppleEmoji } from "@/components/misc/apple-emoji";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
export interface ErrorCardProps {
  children?: string | ReactNode;
  emoji?: string;
}
export function ErrorCard({
  children = "Something went wrong.",
  emoji = "‼️",
}: ErrorCardProps) {
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
