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
export function AuthStatusProvider({
  children,
  initialCookieValues,
}: {
  children: ReactNode;
  initialCookieValues: { isLoggedIn: boolean; isGuest: boolean };
}) {
  const [statuses, setStatuses] = useState(initialCookieValues);
  const refreshAuthStatus = () => {
    setStatuses(getAuthStatuses());
  };
  useEffect(() => {
    if (statuses.isLoggedIn) {
      console.log("prefetching queries");
      queryClient.prefetchQuery(
        trpc.myed.user.getStudentDetails.queryOptions()
      );
      queryClient.prefetchQuery(trpc.core.settings.getSettings.queryOptions());
      queryClient.prefetchQuery(
        trpc.myed.subjects.getSubjects.queryOptions({
          isPreviousYear: false,
          termId: undefined,
        })
      );
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
