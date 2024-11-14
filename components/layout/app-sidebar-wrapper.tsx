import { isUserAuthenticated } from "@/helpers/isUserAuthenticated";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";

import { PageHeading } from "./page-heading";
const Inset = ({ children }: { children: ReactNode }) => (
  <SidebarInset className="p-4 flex flex-col gap-4 min-w-0">
    {children}
  </SidebarInset>
);
export function AppSidebarWrapper({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const isAuthenticated = isUserAuthenticated(cookieStore);
  if (!isAuthenticated) return <Inset>{children}</Inset>;
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <Inset>
        <PageHeading />
        {children}
      </Inset>
    </SidebarProvider>
  );
}
