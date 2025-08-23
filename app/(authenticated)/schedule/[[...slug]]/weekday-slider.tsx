import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/helpers/cn";
import { timezonedDayJS } from "@/instances/dayjs";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TOTAL_WEEKS = 21;
const LOADING_SLIDES = 2; // One at each end
const TOTAL_SLIDES = TOTAL_WEEKS + LOADING_SLIDES;
const CENTER_INDEX = Math.floor(TOTAL_SLIDES / 2);
const PRELOAD_THRESHOLD = 3;

export function WeekdaySlider({
  startDate,
  currentDate,
  setDate,
}: {
  startDate: Date;
  currentDate: Date;
  setDate: (date: Date) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(-Math.floor(TOTAL_WEEKS / 2));
  const lastRebuildRef = useRef(0);
  const baseStartDateRef = useRef(startDate);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: CENTER_INDEX,
    skipSnaps: false,
  });

  const slides = useMemo(
    () => {
      const weekSlides = Array.from({ length: TOTAL_WEEKS }, (_, weekIndex) =>
        [...Array(7)].map((_, dayIndex) => {
          const date = timezonedDayJS(baseStartDateRef.current)
            .add(weekOffset + weekIndex, "week")
            .add(dayIndex, "day");
          return { name: date.format("dd"), day: date.date(), date };
        })
      );

      // null indicates loading slide
      return [null, ...weekSlides, null];
    },
    [weekOffset] // Only depend on weekOffset
  );

  const handlePreload = useCallback(
    (selectedIndex: number) => {
      const now = Date.now();

      // Prevent rapid rebuilds (debounce by 300ms)
      if (now - lastRebuildRef.current < 300) return;

      let shouldRebuild = false;
      let newWeekOffset = weekOffset;
      let newStartIndex = selectedIndex;

      // Check if user is on loading slides or close to them
      if (selectedIndex === 0 || selectedIndex <= PRELOAD_THRESHOLD + 1) {
        // User is on first loading slide or close to beginning, extend backward
        const shiftAmount = Math.floor(TOTAL_WEEKS / 2);
        newWeekOffset = weekOffset - shiftAmount;
        newStartIndex = selectedIndex + shiftAmount;
        shouldRebuild = true;
      } else if (
        selectedIndex === TOTAL_SLIDES - 1 ||
        selectedIndex >= TOTAL_SLIDES - PRELOAD_THRESHOLD - 2
      ) {
        // User is on last loading slide or close to end, extend forward
        const shiftAmount = Math.floor(TOTAL_WEEKS / 2);
        newWeekOffset = weekOffset + shiftAmount;
        newStartIndex = selectedIndex - shiftAmount;
        shouldRebuild = true;
      }

      if (shouldRebuild && emblaApi) {
        lastRebuildRef.current = now;
        setWeekOffset(newWeekOffset);

        // Rebuild after state update
        setTimeout(() => {
          if (emblaApi) {
            emblaApi.reInit();
            emblaApi.scrollTo(newStartIndex, false);
          }
        }, 0);
      }
    },
    [emblaApi, weekOffset]
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

  // Loading slide component

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((days, slideIndex) => (
          <div
            key={`week-${weekOffset + slideIndex - 1}`} // -1 because first slide is loading
            className="flex-[0_0_100%] flex justify-center"
          >
            <div className="flex gap-2 justify-between flex-1 max-w-[470px]">
              {days ? (
                days.map((day) => {
                  const isCurrent = day.date.isSame(currentDate, "day");
                  const isToday = day.date.isSame(new Date(), "day");
                  return (
                    <div
                      key={day.date.format("YYYY-MM-DD")}
                      className={cn(
                        "flex flex-col items-center gap-1 cursor-pointer"
                      )}
                      onClick={() => {
                        // Ensure consistent timezone handling by using startOf('day')
                        const clickedDate = day.date.startOf("day").toDate();
                        setDate(clickedDate);
                      }}
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
                          "p-1.5 leading-tight size-9 flex items-center justify-center rounded-full transition-all duration-200 text-foreground hover:bg-muted/20",
                          {
                            "bg-primary text-primary-foreground shadow-sm hover:bg-primary/75":
                              isCurrent,
                          },
                          {
                            "bg-secondary hover:bg-secondary/75":
                              isToday && !isCurrent,
                          }
                        )}
                      >
                        {day.day}
                      </div>
                    </div>
                  );
                })
              ) : (
                <WeekdaysSkeleton />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const WeekdaysSkeleton = () =>
  Array.from({ length: 7 }).map((_, dayIndex) => (
    <div key={dayIndex} className="flex flex-col items-center gap-1 my-1.5">
      <Skeleton className="h-2 w-4" />
      <Skeleton className="p-1.5 leading-tight size-9 flex items-center justify-center rounded-full text-muted-foreground/50"></Skeleton>
    </div>
  ));
