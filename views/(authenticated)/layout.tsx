import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import Cookies from "js-cookie";
import { Navigate, Outlet } from "react-router";
export default function AuthenticatedLayout() {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  const sidebarState = Cookies.get("sidebar:state");
  const isSidebarExpanded = sidebarState ? sidebarState === "true" : true;
  return (
    <AppSidebarWrapper initialIsExpanded={isSidebarExpanded}>
      <Outlet />
    </AppSidebarWrapper>
  );
}
