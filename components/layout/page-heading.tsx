"use client";
import { websitePagesWithStaticPaths } from "@/constants/website";
import { Link, useLocation } from "react-router";

import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
import { Settings02StrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logo } from "../misc/logo";
import { BackButton } from "../ui/back-button";
import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "./theme-toggle";
import { UserHeader } from "./user-header";

export function PageHeading({
  leftContent,
  rightContent,
  dynamicContent,
  className,
  shouldShowBackButton = true,
}: {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  dynamicContent?: React.ReactNode;
  className?: string;
  shouldShowBackButton?: boolean;
}) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "no-print flex justify-between gap-4 items-start",
        className
      )}
    >
      {leftContent ?? (isMobile ? dynamicContent : null) ?? (
        <DefaultLeftContent shouldShowBackButton={shouldShowBackButton} />
      )}

      <div className="w-fit flex gap-2.5 items-center">
        {rightContent ?? (!isMobile ? dynamicContent : null)}
        <div className="w-fit flex sm:hidden gap-3 items-center">
          <Link to="/settings">
            <Button
              variant="ghost"
              size="smallIcon"
              className="w-fit hover:bg-transparent"
            >
              <HugeiconsIcon icon={Settings02StrokeRounded} />
            </Button>
          </Link>
          <ThemeToggle isInSidebar={false} shouldShowText={false} />

          <UserHeader className="w-fit" />
        </div>
      </div>
    </div>
  );
}
function DefaultLeftContent({
  shouldShowBackButton = true,
}: {
  shouldShowBackButton?: boolean;
}) {
  const { pathname } = useLocation();
  const hasBackButton = !websitePagesWithStaticPaths[pathname];
  return (
    <div className="flex items-center gap-2.5 h-full">
      <SidebarTrigger />
      {hasBackButton ? (
        shouldShowBackButton && <BackButton className="h-full" />
      ) : (
        <Link to="/">
          <Logo className="sm:hidden size-7 text-brand" />
        </Link>
      )}
    </div>
  );
}
