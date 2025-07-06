import { AppleEmoji } from "@/components/misc/apple-emoji";
import { Card } from "@/components/ui/card";
import { cn } from "@/helpers/cn";
import { ReactNode } from "react";
export interface ErrorCardProps {
  children?: string | ReactNode;
  emoji?: string;
  shouldShowBorder?: boolean;
  className?: string;
}
export function ErrorCard({
  children = "Something went wrong.",
  emoji = "‼️",
  shouldShowBorder = true,
  className,
}: ErrorCardProps) {
  return (
    <Card
      className={cn(
        "p-3 flex flex-col gap-1.5 items-center",
        !shouldShowBorder && "border-none p-0",
        className
      )}
    >
      <AppleEmoji
        value={emoji}
        textClassName="text-3xl leading-none"
        imageClassName="size-[30px]"
      />

      <p className="text-sm text-center">{children}</p>
    </Card>
  );
}
