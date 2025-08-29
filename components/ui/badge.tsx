import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/helpers/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors w-fit",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-primary-foreground",
        secondary: "border-transparent bg-brand/10 text-brand",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
