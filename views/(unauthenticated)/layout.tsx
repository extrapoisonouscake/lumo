import { NetworkConnectionBanner } from "@/components/layout/network-connection-banner";
import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { reconcileMobileAppIcon } from "../(authenticated)/settings/theme-picker";

export default function UnauthenticatedLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  useEffect(() => {
    reconcileMobileAppIcon(USER_SETTINGS_DEFAULT_VALUES.themeColor);
  }, []);
  if (isLoggedIn) {
    return <Navigate to="/" />;
  }
  return (
    <div className="root-container">
      <NetworkConnectionBanner />
      {children ?? <Outlet />}
    </div>
  );
}
