import { isGuestMode, isUserAuthenticated } from "@/helpers/auth-statuses";
import { cookies } from "next/headers";
import { ReactNode, Suspense } from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopLoader } from "./top-loader";
import { UserHeader, UserHeaderSkeleton } from "./user-header";

const Inset = ({ children }: { children: ReactNode }) => (
  <SidebarInset className="p-4 flex flex-col gap-4 min-w-0">
    {children}
  </SidebarInset>
);
export function AppSidebarWrapper({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const isAuthenticated = isUserAuthenticated(cookieStore);
  const isGuest = isGuestMode(cookieStore);
  if (!isAuthenticated && !isGuest) return <Inset>{children}</Inset>;
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        isGuest={isGuest}
        userHeader={
          !isGuest ? (
            <Suspense fallback={<UserHeaderSkeleton />}>
              <UserHeader />
            </Suspense>
          ) : null
        }
      />
      <Inset>
        <TopLoader />
        {children}
      </Inset>
    </SidebarProvider>
  );
}
