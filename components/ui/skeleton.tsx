import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse bg-red rounded-md group relative overflow-hidden pointer-events-none before:opacity-100 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-content4/30 before:bg-gradient-to-r before:from-transparent before:via-content4 dark:before:via-default-700/10 before:to-transparentafter:opacity-100 after:absolute after:inset-0 after:-z-10 after:bg-content3 dark:after:bg-content2  data-[loaded=true]:pointer-events-auto data-[loaded=true]:overflow-visible data-[loaded=true]:!bg-transparent data-[loaded=true]:before:opacity-0 data-[loaded=true]:before:-z-10 data-[loaded=true]:before:animate-none data-[loaded=true]:after:opacity-0",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
