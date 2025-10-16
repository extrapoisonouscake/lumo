import { WEBSITE_ROOT } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { ConnectionStatus, Network } from "@capacitor/network";

import {
  SignalFull02StrokeRounded,
  WifiDisconnected01StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

const THRESHOLD_MS = 3000;
const bannerData = {
  offline: {
    icon: WifiDisconnected01StrokeRounded,
    text: "You are offline.",
    className: "bg-red-500/10 text-red-500",
  },
  "slow-connection": {
    icon: SignalFull02StrokeRounded,
    text: "You are on a slow connection.",
    className: "bg-yellow-100 text-yellow-800",
  },
};
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const detectSlowConnection = async () => {
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
  };
  const setOffline = (status: ConnectionStatus) => {
    setIsOffline(status.connected === false);
  };
  useEffect(() => {
    Network.getStatus().then(setOffline);
    Network.addListener("networkStatusChange", setOffline);
    detectSlowConnection();
  }, []);
  if (!isOffline && !isSlowConnection) return null;
  const data = isOffline ? bannerData.offline : bannerData["slow-connection"];
  return (
    <div
      className={cn(
        "sticky top-0 left-0 right-0 px-4 py-3 text-sm",
        data.className,
        "text-center flex items-center gap-4 justify-center"
      )}
    >
      <HugeiconsIcon icon={data.icon} className="size-5" />
      {data.text}
    </div>
  );
}
