import { WEBSITE_ROOT } from "@/constants/website";
import { ConnectionStatus, Network } from "@capacitor/network";

import {
  SignalFull02StrokeRounded,
  WifiDisconnected01StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const THRESHOLD_MS = 3000;
const bannerData = {
  offline: {
    icon: WifiDisconnected01StrokeRounded,
    text: "You are offline.",
    className: "bg-destructive/10 text-destructive",
  },
  "slow-connection": {
    icon: SignalFull02StrokeRounded,
    text: "You are on a slow connection.",
    className: "bg-yellow-100 text-yellow-800",
  },
};
const NetworkStatusContext = createContext<{
  isOffline: boolean;
  isSlowConnection: boolean;
}>({
  isOffline: false,
  isSlowConnection: false,
});
export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const detectSlowConnection = useCallback(
    () => async () => {
      const startTime = performance.now();
      try {
        const response = await fetch(`${WEBSITE_ROOT}/api/ping`);
        if (!response.ok) {
          throw new Error("Failed to fetch test resource");
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        if (duration > THRESHOLD_MS) {
          setIsSlowConnection(true);
          setTimeout(() => {
            detectSlowConnection();
          }, 5000);
        } else {
          setIsSlowConnection(false);
        }
      } catch (error) {}
    },
    []
  );
  const setOffline = (status: ConnectionStatus) => {
    setIsOffline(status.connected === false);
  };
  useEffect(() => {
    Network.getStatus().then(setOffline);
    Network.addListener("networkStatusChange", setOffline);
    detectSlowConnection();
  }, []);
  return (
    <NetworkStatusContext.Provider value={{ isOffline, isSlowConnection }}>
      {children}
    </NetworkStatusContext.Provider>
  );
}
export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error(
      "useNetworkStatus must be used within a NetworkStatusProvider"
    );
  }
  return context;
}
