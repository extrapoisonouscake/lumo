import { useBreakpoint } from "./use-breakpoint";

export function useIsMobile() {
  return useBreakpoint("md", "smaller");
}
