"use client";
import { cn } from "@/helpers/cn";
import { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopLoader } from "./top-loader";

const Inset = ({
  children,
  topLoader,
  className,
}: {
  children: ReactNode;
  topLoader: ReactNode;
  className?: string;
}) => (
  <SidebarInset className={cn("min-w-0", className)}>
    {topLoader}
    <div className="root-container">{children}</div>
  </SidebarInset>
);

export function AppSidebarWrapper({
  children,
  initialIsExpanded,
  renderInset,
}: {
  children: ReactNode;
  initialIsExpanded: boolean;
  renderInset?: (children: ReactNode) => ReactNode;
}) {
  const insetSlot = (
    <Inset
      topLoader={<TopLoader />}
      className="pb-(--mobile-menu-height) pt-[env(safe-area-inset-top,0)] sm:pb-0"
    >
      {children}
    </Inset>
  );
  return (
    <SidebarProvider defaultOpen={initialIsExpanded}>
      <AppSidebar />

      {renderInset ? renderInset(insetSlot) : insetSlot}
    </SidebarProvider>
  );
}
