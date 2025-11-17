import { WEBSITE_ROOT } from "@/constants/website";
import { ConnectionStatus, Network } from "@capacitor/network";
import { useShallow } from "zustand/shallow";

import { ReactNode, useCallback, useEffect } from "react";
import { create } from "zustand";

export const SLOW_CONNECTION_THRESHOLD_MS = 5000;

export const useNetworkStatusStore = create<{
  isOffline: boolean;
  isSlowConnection: boolean;
  setIsOffline: (isOffline: boolean) => void;
  setIsSlowConnection: (isSlowConnection: boolean) => void;
}>((set) => ({
  isOffline: false,
  isSlowConnection: false,
  setIsOffline: (isOffline: boolean) => set({ isOffline }),
  setIsSlowConnection: (isSlowConnection: boolean) => set({ isSlowConnection }),
}));
export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const [setIsOffline, isSlowConnection, setIsSlowConnection] =
    useNetworkStatusStore(
      useShallow((state) => [
        state.setIsOffline,
        state.isSlowConnection,
        state.setIsSlowConnection,
      ])
    );
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
        if (duration > SLOW_CONNECTION_THRESHOLD_MS) {
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
  }, []);
  useEffect(() => {
    if (isSlowConnection) {
      setTimeout(() => {
        detectSlowConnection();
      }, 5000);
    }
  }, [isSlowConnection]);
  return children;
}
export function useNetworkStatus() {
  const { isOffline, isSlowConnection } = useNetworkStatusStore();
  return { isOffline, isSlowConnection };
}
