import { isMobileApp } from "@/constants/ui";
import { WEBSITE_TITLE } from "@/constants/website";
import { trpcClient } from "@/views/trpc";
import { App } from "@capacitor/app";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { IOSAppInstallButton } from "../layout/ios-app-advertisement";
const regExStrip0 = /(\.0+)+$/;
function cmpVersions(a: string, b: string) {
  let i: number, diff: number;
  const segmentsA = a.replace(regExStrip0, "").split(".");
  const segmentsB = b.replace(regExStrip0, "").split(".");
  const l = Math.min(segmentsA.length, segmentsB.length);

  for (i = 0; i < l; i++) {
    diff = parseInt(segmentsA[i]!, 10) - parseInt(segmentsB[i]!, 10);
    if (diff) {
      return diff;
    }
  }
  return segmentsA.length - segmentsB.length;
}
export function AppUpdatePromptProvider({ children }: { children: ReactNode }) {
  const [earliestSupportedVersion, setEarliestSupportedVersion] = useState<
    string | null
  >(null);

  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  useEffect(() => {
    if (!isMobileApp) return;
    App.getInfo().then(({ version }) => {
      setCurrentVersion(version);
    });

    trpcClient.core.updates.getEarliestSupportedVersion
      .query()
      .then((version) => {
        setEarliestSupportedVersion(version);
      });
  }, []);

  if (!isMobileApp || !earliestSupportedVersion || !currentVersion)
    return children;
  const isOutdated = useMemo(
    () => cmpVersions(earliestSupportedVersion, currentVersion) > 0,
    [earliestSupportedVersion, currentVersion]
  );
  if (!isOutdated) return children;
  return (
    <div className="w-full p-4 h-dvh flex flex-col items-center justify-center gap-4">
      <img
        src="/assets/app-store-app-icon.png"
        alt={`${WEBSITE_TITLE} App Icon`}
        className="size-14"
      />
      <div className="flex items-center flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">Update Required</h1>
        <p className="text-muted-foreground text-center">
          Please update to the latest version of the app to continue using{" "}
          {WEBSITE_TITLE}.
        </p>
      </div>
      <IOSAppInstallButton />
      <p className="text-xs text-muted-foreground">
        App Store is a trademark of Apple Inc.
      </p>
    </div>
  );
}
