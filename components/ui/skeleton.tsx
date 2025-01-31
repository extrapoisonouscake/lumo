import { cn } from "@/helpers/cn";
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
      
        <div className={cn("pointer-events-none absolute inset-0 w-full h-full bg-accent rounded-lg r animate-pulse opacity-0 transition-opacity",{"opacity-1":isLoading})}></div>
      
      <div
        className={isLoading ? "invisible flex [&>*]:leading-none" : "visible"}
      >
        {children}
      </div>
    </div>
  );
};
