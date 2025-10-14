import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/helpers/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border text-xs font-medium transition-colors w-fit whitespace-nowrap [&_svg]:size-4 [&_svg]:min-w-4 gap-1.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-primary-foreground",
        secondary: "border-transparent bg-brand/10 text-brand",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
      size: {
        default: "px-2 py-1",
        sm: "px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
