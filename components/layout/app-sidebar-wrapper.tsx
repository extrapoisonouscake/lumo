"use client";
import { cn } from "@/helpers/cn";
import { ReactNode } from "react";
import { useAuthStatus } from "../providers/auth-status-provider";
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
    <div className="p-4 flex flex-col gap-4">{children}</div>
  </SidebarInset>
);

export function AppSidebarWrapper({
  children,
  initialIsExpanded,
}: {
  children: ReactNode;
  initialIsExpanded: boolean;
}) {
  const { isLoggedIn, isGuest } = useAuthStatus();
  if (!isLoggedIn && !isGuest)
    return (
      <>
        <Inset topLoader={<TopLoader />}>{children}</Inset>
      </>
    );

  return (
    <SidebarProvider defaultOpen={initialIsExpanded}>
      <AppSidebar />

      <Inset topLoader={<TopLoader />} className="pb-16 sm:pb-0">
        {children}
      </Inset>
    </SidebarProvider>
  );
}
