import { cn } from "@/helpers/cn";

export function MiniTableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-4 py-3 border flex items-center gap-4 rounded-lg justify-between text-sm font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
