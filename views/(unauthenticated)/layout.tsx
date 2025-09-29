import { clientAuthChecks } from "@/helpers/client-auth-checks";
import { Navigate, Outlet } from "react-router";

export default function UnauthenticatedLayout() {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  if (isLoggedIn) {
    return <Navigate to="/" />;
  }
  return (
    <div className="root-container">
      <Outlet />
    </div>
  );
}
