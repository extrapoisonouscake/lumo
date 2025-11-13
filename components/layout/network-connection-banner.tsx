import { cn } from "@/helpers/cn";

import {
  SignalFull02StrokeRounded,
  WifiDisconnected01StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNetworkStatus } from "../providers/network-status-provider";

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
export function NetworkConnectionBanner() {
  const { isOffline, isSlowConnection } = useNetworkStatus();

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
