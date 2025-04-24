import { queryClient, trpc } from "@/app/trpc";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthStatusContext = createContext<{
  isLoggedIn: boolean;
  isGuest: boolean;

  refreshAuthStatus: () => void;
}>({
  isLoggedIn: false,
  isGuest: false,
  refreshAuthStatus: () => {},
});
const getAuthStatuses = () => {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  const isGuest = clientAuthChecks.isInGuestMode();
  return { isLoggedIn, isGuest };
};
export function AuthStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState(getAuthStatuses());
  const refreshAuthStatus = () => {
    setStatuses(getAuthStatuses());
  };
  useEffect(() => {
    if (statuses.isLoggedIn) {
      queryClient.prefetchQuery(trpc.user.getStudentDetails.queryOptions());
      queryClient.prefetchQuery(trpc.user.getSettings.queryOptions());
      queryClient.prefetchQuery(trpc.subjects.getSubjects.queryOptions());
    }
  }, [statuses]);
  return (
    <AuthStatusContext.Provider value={{ ...statuses, refreshAuthStatus }}>
      {children}
    </AuthStatusContext.Provider>
  );
}
export function useAuthStatus() {
  return useContext(AuthStatusContext);
}
