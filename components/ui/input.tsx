import * as React from "react";

import { cn } from "@/helpers/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightIconContainerProps?: React.HTMLAttributes<HTMLDivElement>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, leftIcon, rightIcon, rightIconContainerProps, ...props },
    ref
  ) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg r border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div
            {...rightIconContainerProps}
            className={cn(
              "absolute rounded-lg right-[1px] px-3 top-[1px] bottom-[1px] h-[calc(100%-2px)] flex items-center justify-center bg-background",
              rightIconContainerProps?.className
            )}
          >
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
