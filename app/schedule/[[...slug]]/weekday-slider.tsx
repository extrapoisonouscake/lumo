import { cn } from "@/helpers/cn";
import { timezonedDayJS } from "@/instances/dayjs";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function WeekdaySlider({
  startDate,
  currentDate,
  setDate,
}: {
  startDate: Date;
  currentDate: Date;
  setDate: (date: Date) => void;
}) {
  // Use a large buffer to minimize rebuilds - 21 weeks total
  const TOTAL_WEEKS = 21;
  const CENTER_INDEX = 10; // Middle of 21 weeks
  const PRELOAD_THRESHOLD = 3; // Start preloading when within 3 weeks of edge

  const [baseWeekOffset, setBaseWeekOffset] = useState(-CENTER_INDEX); // Start at center
  const lastRebuildRef = useRef(0); // Prevent rapid rebuilds

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: CENTER_INDEX,
    skipSnaps: false,
  });

  // Create buffer of weeks
  const weeks = useMemo(
    () =>
      Array.from({ length: TOTAL_WEEKS }, (_, weekIndex) =>
        [...Array(7)].map((_, dayIndex) => {
          const date = timezonedDayJS(startDate)
            .add(baseWeekOffset + weekIndex, "week")
            .add(dayIndex, "day");
          return { name: date.format("dd"), day: date.date(), date };
        })
      ),
    [startDate, baseWeekOffset]
  );

  // Rebuild carousel with new date range when user gets close to edges
  const handlePreload = useCallback(
    (selectedIndex: number) => {
      const now = Date.now();

      // Prevent rapid rebuilds (debounce by 300ms)
      if (now - lastRebuildRef.current < 300) return;

      let shouldRebuild = false;
      let newBaseOffset = baseWeekOffset;
      let newStartIndex = selectedIndex;

      if (selectedIndex <= PRELOAD_THRESHOLD) {
        // User is close to beginning, shift backward
        const shiftAmount = CENTER_INDEX - PRELOAD_THRESHOLD;
        newBaseOffset = baseWeekOffset - shiftAmount;
        newStartIndex = selectedIndex + shiftAmount;
        shouldRebuild = true;
      } else if (selectedIndex >= TOTAL_WEEKS - PRELOAD_THRESHOLD - 1) {
        // User is close to end, shift forward
        const shiftAmount = CENTER_INDEX - PRELOAD_THRESHOLD;
        newBaseOffset = baseWeekOffset + shiftAmount;
        newStartIndex = selectedIndex - shiftAmount;
        shouldRebuild = true;
      }

      if (shouldRebuild && emblaApi) {
        lastRebuildRef.current = now;
        setBaseWeekOffset(newBaseOffset);

        // Rebuild after state update
        setTimeout(() => {
          if (emblaApi) {
            emblaApi.reInit();
            emblaApi.scrollTo(newStartIndex, false); // Jump without animation after rebuild
          }
        }, 0);
      }
    },
    [emblaApi, baseWeekOffset]
  );

  // Handle slide changes - only trigger preload after user settles
  const onSlideSettle = useCallback(() => {
    if (!emblaApi) return;

    const selectedIndex = emblaApi.selectedScrollSnap();
    handlePreload(selectedIndex);
  }, [emblaApi, handlePreload]);

  // Set up event listeners
  useEffect(() => {
    if (!emblaApi) return;

    // Only listen to 'settle' to avoid interrupting animations
    emblaApi.on("settle", onSlideSettle);

    return () => {
      emblaApi.off("settle", onSlideSettle);
    };
  }, [emblaApi, onSlideSettle]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {weeks.map((days, weekIndex) => (
          <div
            key={`week-${baseWeekOffset + weekIndex}`}
            className="flex-[0_0_100%] flex justify-center"
          >
            <div className="flex gap-2 justify-between flex-1 max-w-[470px]">
              {days.map((day) => {
                const isCurrent = day.date.isSame(currentDate, "day");
                return (
                  <div
                    key={day.date.format("YYYY-MM-DD")}
                    className={cn(
                      "flex flex-col items-center gap-1 cursor-pointer"
                    )}
                    onClick={() => setDate(day.date.toDate())}
                  >
                    <p
                      className={cn(
                        "text-sm transition-colors duration-200",
                        isCurrent
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {day.name}
                    </p>
                    <div
                      className={cn(
                        "p-1.5 leading-tight size-9 flex items-center justify-center rounded-full transition-all duration-200",
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:border-muted-foreground/50 hover:bg-muted/20"
                      )}
                    >
                      {day.day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
