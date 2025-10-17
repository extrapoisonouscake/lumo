import { NetworkConnectionBanner } from "@/components/layout/network-connection-banner";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import { Navigate, Outlet } from "react-router";

export default function UnauthenticatedLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
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
