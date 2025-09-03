import { cn } from "@/helpers/cn";
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

export const Skeleton = ({
  isLoading = true,
  children,
  className,
  shouldShrink = true,
  ...props
}: {
  isLoading?: boolean;
  children?: ReactNode | ReactNode[];
  className?: string;
  shouldShrink?: boolean;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  return (
    <div
      className={cn("relative inline-block overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 w-full h-full bg-accent rounded-xl r opacity-0 transition-opacity",
          { "opacity-1 animate-pulse": isLoading }
        )}
      ></div>

      <div
        className={cn(isLoading ? "invisible flex" : "visible", {
          "leading-none [&>*]:leading-none": shouldShrink,
        })}
      >
        {children}
      </div>
    </div>
  );
};
