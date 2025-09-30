import { cn } from "@/helpers/cn";

export function ListItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex items-start before:mt-[calc((1.5rem-4.5px)/2)] before:content-[''] before:size-[4.5px] before:min-w-[4.5px] before:rounded-full before:bg-foreground gap-3.5",
        className
      )}
    >
      {children}
    </li>
  );
}
