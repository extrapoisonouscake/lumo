import { serverAuthChecks } from "@/helpers/server-auth-checks";
import Cookies from "js-cookie";
import { cookies } from "next/headers";
import { ReactNode } from "react";
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
export async function AppSidebarWrapper({ children }: { children: ReactNode }) {
  const store = await cookies();
  const isLoggedIn = serverAuthChecks.isLoggedIn(store);
  const isGuest = serverAuthChecks.isInGuestMode(store);
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
