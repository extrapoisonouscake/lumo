import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { isIOSApp } from "@/constants/ui";
import { WEBSITE_ROOT } from "@/constants/website";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import { CapacitorHttp } from "@capacitor/core";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
export default function AuthenticatedLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  useEffect(() => {
    if (isIOSApp) {
      import("@aparajita/capacitor-ios-silent-notifications").then(
        ({ IosSilentNotifications }) => {
          IosSilentNotifications.addListener(
            "onSilentNotification",
            (notification: Notification) => {
              CapacitorHttp.post({
                url: `${WEBSITE_ROOT}/api/notifications/check`,
              }).then();
            }
          );
        }
      );
    }
  }, []);
  const sidebarState = Cookies.get("sidebar:state");
  const isSidebarExpanded = sidebarState ? sidebarState === "true" : true;
  return (
    <AppSidebarWrapper initialIsExpanded={isSidebarExpanded}>
      {children ?? <Outlet />}
    </AppSidebarWrapper>
  );
}
