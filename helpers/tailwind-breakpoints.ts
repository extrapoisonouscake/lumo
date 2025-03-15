// Tailwind's default breakpoints
// https://tailwindcss.com/docs/screens
export const tailwindBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof tailwindBreakpoints;

/**
 * Get the pixel value for a Tailwind breakpoint
 */
export function getBreakpointValue(breakpoint: BreakpointKey): number {
  return tailwindBreakpoints[breakpoint];
}

/**
 * Create a media query string for a Tailwind breakpoint
 * @param breakpoint The breakpoint name (sm, md, lg, xl, 2xl)
 * @param type 'min' for min-width, 'max' for max-width
 * @returns A media query string
 */
export function createBreakpointQuery(
  breakpoint: BreakpointKey,
  type: "min" | "max" = "min"
): string {
  const value = getBreakpointValue(breakpoint);
  // For max-width queries, subtract 0.1px to avoid conflicts with min-width queries at the same breakpoint
  const adjustedValue = type === "max" ? value - 0.1 : value;
  return `(${type}-width: ${adjustedValue}px)`;
}
