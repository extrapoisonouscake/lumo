"use client";
import Cookies from "js-cookie";
import { ReactNode } from "react";
import { useAuthStatus } from "../providers/auth-status-provider";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopLoader } from "./top-loader";

const Inset = ({
  children,
  topLoader,
}: {
  children: ReactNode;
  topLoader: ReactNode;
}) => (
  <SidebarInset className="min-w-0">
    {topLoader}
    <div className="p-4 flex flex-col gap-4">{children}</div>
  </SidebarInset>
);

export function AppSidebarWrapper({ children }: { children: ReactNode }) {
  const { isLoggedIn, isGuest } = useAuthStatus();
  if (!isLoggedIn && !isGuest)
    return (
      <>
        <Inset topLoader={<TopLoader />}>{children}</Inset>
      </>
    );
  const defaultOpen = Cookies.get("sidebar:state") === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />

      <Inset topLoader={<TopLoader />}>{children}</Inset>
    </SidebarProvider>
  );
}
