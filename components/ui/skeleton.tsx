import { cn } from "@/lib/utils";
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

export const Skeleton = ({
  isLoading = true,
  children,
  className,
  ...props
}: {
  isLoading?: boolean;
  children?: ReactNode | ReactNode[];
  className?: string;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  return (
    <div
      className={cn("relative inline-block overflow-hidden", className)}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 w-full h-full bg-accent rounded-md animate-pulse"></div>
      )}
      <div className={isLoading ? "invisible" : "visible"}>{children}</div>
    </div>
  );
};
