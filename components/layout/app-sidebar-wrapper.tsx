"use client";
import { cn } from "@/helpers/cn";
import { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { OfflineBanner } from "./offline-banner";

const Inset = ({
  children,
  topContent,
  className,
}: {
  children: ReactNode;
  topContent: ReactNode;
  className?: string;
}) => (
  <SidebarInset className={cn("min-w-0", className)}>
    {topContent}
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
      topContent={<OfflineBanner />}
      className="pb-(--mobile-menu-height) sm:pb-0"
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
