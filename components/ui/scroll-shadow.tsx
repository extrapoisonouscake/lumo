"use client";

import { cn } from "@/helpers/cn";
import * as React from "react";

export interface ScrollShadowProps
  extends React.HTMLAttributes<HTMLDivElement> {
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

export const ScrollShadow = ({
  className,
  children,

  shadowSize = 60,
  showTopShadow = true,
  showBottomShadow = true,
  containerClassName,
  ...props
}: ScrollShadowProps) => {
  const [showTop, setShowTop] = React.useState(false);
  const [showBottom, setShowBottom] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const topSentinelRef = React.useRef<HTMLDivElement>(null);
  const bottomSentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    const topSentinel = topSentinelRef.current;
    const bottomSentinel = bottomSentinelRef.current;

    if (!scrollContainer || !topSentinel || !bottomSentinel) return;

    // Create intersection observer for the top sentinel
    const topObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // When top sentinel is visible, hide top shadow
        // When top sentinel is hidden, show top shadow
        setShowTop(!entry.isIntersecting);
      },
      {
        root: scrollContainer,
        threshold: 0,
        // Small negative margin to trigger slightly before reaching the edge
        rootMargin: "-1px 0px 0px 0px",
      }
    );

    // Create intersection observer for the bottom sentinel
    const bottomObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // When bottom sentinel is visible, hide bottom shadow
        // When bottom sentinel is hidden, show bottom shadow
        setShowBottom(!entry.isIntersecting);
      },
      {
        root: scrollContainer,
        threshold: 0,
        // Small negative margin to trigger slightly before reaching the edge
        rootMargin: "0px 0px -1px 0px",
      }
    );

    topObserver.observe(topSentinel);
    bottomObserver.observe(bottomSentinel);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, []);
  return (
    <div
      className={cn(
        "relative flex-1 min-h-0 overflow-hidden flex flex-col",
        containerClassName
      )}
      {...props}
    >
      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border h-full w-full"
      >
        {/* Top sentinel - invisible element at the start */}
        <div
          ref={topSentinelRef}
          className="h-px w-full pointer-events-none"
          aria-hidden="true"
        />
        <div className={cn("flex flex-col", className)}>{children}</div>
        {/* Bottom sentinel - invisible element at the end */}
        <div
          ref={bottomSentinelRef}
          className="h-px w-full pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Top shadow - gradient from transparent to background */}
      {showTopShadow && (
        <Shadow
          size={shadowSize}
          className="top-0"
          isVisible={showTop}
          direction="top"
        />
      )}

      {/* Bottom shadow - gradient from transparent to background */}
      {showBottomShadow && (
        <Shadow
          size={shadowSize}
          className="bottom-0"
          isVisible={showBottom}
          direction="bottom"
        />
      )}
    </div>
  );
};
function Shadow({
  className,
  size,
  isVisible,
  direction,
}: React.HTMLAttributes<HTMLDivElement> & {
  size: number;
  isVisible: boolean;
  direction: "top" | "bottom";
}) {
  const gradientDirection = direction === "top" ? "to top" : "to bottom";

  return (
    <div
      className={cn(
        "w-full opacity-0 pointer-events-none absolute left-0 right-0 z-[100] transition-opacity duration-200",
        { "opacity-100": isVisible },
        className
      )}
      style={{
        height: `${size}px`,
        background: `linear-gradient(${gradientDirection}, transparent 0%, hsl(var(--background)) 100%)`,
      }}
    />
  );
}
