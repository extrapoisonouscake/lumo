"use client";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import Cookies from "js-cookie";
import { createContext, ReactNode, useContext, useState } from "react";
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
const SidebarVisibilityContext = createContext<{
  isSidebarVisible: boolean;
  setIsSidebarVisible: (isVisible: boolean) => void;
}>({
  isSidebarVisible: false,
  setIsSidebarVisible: () => {},
});
export function AppSidebarWrapper({ children }: { children: ReactNode }) {
  const { isSidebarVisible } = useSidebarVisibility();
  if (!isSidebarVisible)
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
export function SidebarVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  const isGuest = clientAuthChecks.isInGuestMode();
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    isLoggedIn || isGuest
  );
  return (
    <SidebarVisibilityContext.Provider
      value={{ isSidebarVisible, setIsSidebarVisible }}
    >
      {children}
    </SidebarVisibilityContext.Provider>
  );
}
export function useSidebarVisibility() {
  return useContext(SidebarVisibilityContext);
}
