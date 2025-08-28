"use client";

import { cn } from "@/helpers/cn";
import * as React from "react";

export interface ScrollShadowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Shadow color. Can be a Tailwind color class or CSS color value.
   * @default "from-background/80 to-transparent"
   */
  shadowColor?: string;
  /**
   * Height/thickness of the shadow in pixels
   * @default 20
   */
  shadowSize?: number;
  /**
   * Whether to show shadow at the top
   * @default true
   */
  showTopShadow?: boolean;
  /**
   * Whether to show shadow at the bottom
   * @default true
   */
  showBottomShadow?: boolean;
  /**
   * Custom class for the scrollable content container
   */
  containerClassName?: string;
}

export const ScrollShadow = React.forwardRef<HTMLDivElement, ScrollShadowProps>(
  (
    {
      className,
      children,
      shadowColor = "from-background/80 to-transparent",
      shadowSize = 20,
      showTopShadow = true,
      showBottomShadow = true,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [showTop, setShowTop] = React.useState(false);
    const [showBottom, setShowBottom] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Minimal JS to detect scroll position
    const handleScroll = React.useCallback(() => {
      const element = scrollRef.current;
      if (!element) return;

      const { scrollTop, scrollHeight, clientHeight } = element;

      // Debug info (remove in production)
      console.log("Scroll Debug:", {
        scrollTop,
        scrollHeight,
        clientHeight,
        canScrollTop: scrollTop > 5,
        canScrollBottom: scrollTop < scrollHeight - clientHeight - 5,
      });

      // Show top shadow if scrolled down
      setShowTop(scrollTop > 5);

      // Show bottom shadow if not at bottom
      setShowBottom(scrollTop < scrollHeight - clientHeight - 5);
    }, []);

    React.useEffect(() => {
      const element = scrollRef.current;
      if (!element) return;

      console.log("Setting up scroll listener on:", element);

      // Initial check
      handleScroll();

      // Test that the element is actually scrollable
      const isScrollable = element.scrollHeight > element.clientHeight;
      console.log(
        "Element is scrollable:",
        isScrollable,
        "scrollHeight:",
        element.scrollHeight,
        "clientHeight:",
        element.clientHeight
      );

      element.addEventListener("scroll", handleScroll, { passive: true });

      // Also check on resize
      const resizeObserver = new ResizeObserver(() => {
        console.log("ResizeObserver triggered");
        handleScroll();
      });
      resizeObserver.observe(element);

      return () => {
        element.removeEventListener("scroll", handleScroll);
        resizeObserver.disconnect();
      };
    }, [handleScroll]);

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className={cn(
            "overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
            containerClassName
          )}
          style={{
            height: "100%",
          }}
        >
          {children}
        </div>

        {/* Top shadow - CSS gradient approach */}
        {showTopShadow && (
          <div
            className={cn(
              "pointer-events-none absolute left-0 right-0 top-0 z-10 transition-opacity duration-200",
              showTop ? "opacity-100" : "opacity-0"
            )}
            style={{
              height: `${shadowSize}px`,
              background: `linear-gradient(to bottom, var(--background) 0%, transparent 100%)`,
              backdropFilter: "blur(1px)",
            }}
          />
        )}

        {/* Bottom shadow - CSS gradient approach */}
        {showBottomShadow && (
          <div
            className={cn(
              "pointer-events-none absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-200",
              showBottom ? "opacity-100" : "opacity-0"
            )}
            style={{
              height: `${shadowSize}px`,
              background: `linear-gradient(to top, var(--background) 0%, transparent 100%)`,
              backdropFilter: "blur(1px)",
            }}
          />
        )}
      </div>
    );
  }
);

ScrollShadow.displayName = "ScrollShadow";
