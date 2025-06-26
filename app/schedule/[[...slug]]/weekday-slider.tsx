import { cn } from "@/helpers/cn";
import { timezonedDayJS } from "@/instances/dayjs";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function WeekdaySlider({
  startDate,
  currentDate,
  setDate,
}: {
  startDate: Date;
  currentDate: Date;
  setDate: (date: Date) => void;
}) {
  // Track the center week offset for sliding window
  const [centerWeekOffset, setCenterWeekOffset] = useState(0);

  // Use embla with infinite loop
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: 2, // Start at the center week (index 2 of 5 weeks)
  });

  // Create a sliding window of 5 weeks around the current center
  const weeks = useMemo(
    () =>
      [-2, -1, 0, 1, 2].map((weekOffset) =>
        [...Array(7)].map((_, i) => {
          const date = timezonedDayJS(startDate)
            .add(centerWeekOffset + weekOffset, "week")
            .add(i, "day");
          return { name: date.format("dd"), day: date.date(), date };
        })
      ),
    [startDate, centerWeekOffset]
  );

  // Handle slide changes to update the sliding window
  const onSlideChange = useCallback(() => {
    if (!emblaApi) return;

    const selectedIndex = emblaApi.selectedScrollSnap();

    // When we're at the edges, shift the sliding window
    if (selectedIndex === 0) {
      // Scrolled to first week, shift window backward
      setCenterWeekOffset((prev) => prev - 1);
      emblaApi.scrollTo(2, false); // Jump to center without animation
    } else if (selectedIndex === 4) {
      // Scrolled to last week, shift window forward
      setCenterWeekOffset((prev) => prev + 1);
      emblaApi.scrollTo(2, false); // Jump to center without animation
    }
  }, [emblaApi]);

  // Set up event listeners
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSlideChange);

    return () => {
      emblaApi.off("select", onSlideChange);
    };
  }, [emblaApi, onSlideChange]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {weeks.map((days, weekIndex) => (
          <div
            key={`${centerWeekOffset + weekIndex - 2}`}
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
