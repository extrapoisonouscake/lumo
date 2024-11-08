import { ReactNode } from "react";

export const Skeleton = ({
  isLoading = true,
  children,
}: {
  isLoading?: boolean;
  children: ReactNode | ReactNode[];
}) => {
  return (
    <div className="relative inline-block overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 w-full h-full bg-gray-200 rounded-md animate-pulse"></div>
      )}
      <div className={isLoading ? "invisible" : "visible"}>{children}</div>
    </div>
  );
};
