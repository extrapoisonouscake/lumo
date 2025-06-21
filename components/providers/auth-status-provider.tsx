import { queryClient, trpc } from "@/app/trpc";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
export type AuthStatusContext={
  isLoggedIn: boolean;

  refreshAuthStatus: () => void;
}
const AuthStatusContext = createContext<AuthStatusContext>({
  isLoggedIn: false,
  refreshAuthStatus: () => {},
});

const getAuthStatuses = () => {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  return { isLoggedIn };
};
export function AuthStatusProvider({
  children,
  initialCookieValues,
}: {
  children: ReactNode;
  initialCookieValues: { isLoggedIn: boolean };
}) {
  const [statuses, setStatuses] = useState(initialCookieValues);
  const refreshAuthStatus = () => {
    setStatuses(getAuthStatuses());
  };
  useEffect(() => {
    if (statuses.isLoggedIn) {
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
