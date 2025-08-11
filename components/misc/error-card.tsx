import { AppleEmoji } from "@/components/misc/apple-emoji";
import { Card } from "@/components/ui/card";
import { cn } from "@/helpers/cn";
import { cva } from "class-variance-authority";
import { ReactNode } from "react";
export interface ErrorCardProps {
  children?: string | ReactNode;
  emoji?: string;
  variant?: "default" | "ghost";
  className?: string;
  size?: "sm" | "md";
}
const errorCardVariants = cva(
  "p-3 flex flex-col gap-1.5 items-center justify-center",
  {
    variants: {
      variant: {
        default: "p-3",
        ghost: "border-none p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
export function ErrorCard({
  size = "md",
  children = "Something went wrong.",
  emoji = "‼️",
  variant = "default",
  className,
}: ErrorCardProps) {
  return (
    <Card className={cn(errorCardVariants({ variant, className }))}>
      <AppleEmoji
        value={emoji}
        textClassName={cn(
          "text-3xl",
          size === "sm" && "text-2xl",
          "leading-none"
        )}
        imageClassName={cn("size-[30px]", size === "sm" && "size-[20px]")}
      />

      <p className="text-sm text-center">{children}</p>
    </Card>
  );
}
