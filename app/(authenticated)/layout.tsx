import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { cookies } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const sidebarState = store.get("sidebar:state")?.value;
  const isSidebarExpanded = sidebarState ? sidebarState === "true" : true;
  return (
    <AppSidebarWrapper initialIsExpanded={isSidebarExpanded}>
      {children}
    </AppSidebarWrapper>
  );
}
