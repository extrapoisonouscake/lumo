import {
  BreakpointKey,
  createBreakpointQuery,
  getBreakpointValue,
} from "@/helpers/tailwind-breakpoints";
import * as React from "react";

type BreakpointComparison = "smaller" | "larger";

/**
 * Hook to check if the current viewport is smaller or larger than a specific breakpoint
 * @param breakpoint The Tailwind breakpoint to compare against (sm, md, lg, xl, 2xl)
 * @param comparison Whether to check if viewport is smaller or larger than the breakpoint
 * @returns Boolean indicating if the condition is met
 */
export function useBreakpoint(
  breakpoint: BreakpointKey,
  comparison: BreakpointComparison = "smaller"
) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const breakpointValue = getBreakpointValue(breakpoint);
    // For 'smaller', we want max-width; for 'larger', we want min-width
    const queryType = comparison === "smaller" ? "max" : "min";
    const mediaQuery = createBreakpointQuery(breakpoint, queryType);

    const mql = window.matchMedia(mediaQuery);

    const onChange = () => {
      if (comparison === "smaller") {
        setMatches(window.innerWidth < breakpointValue);
      } else {
        setMatches(window.innerWidth >= breakpointValue);
      }
    };

    mql.addEventListener("change", onChange);
    onChange(); // Set initial value

    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint, comparison]);

  return !!matches;
}
