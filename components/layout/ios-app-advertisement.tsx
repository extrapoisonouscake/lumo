import { isIOS, isIOSApp } from "@/constants/ui";
import { APP_STORE_APP_ID } from "@/constants/website";
import { cn } from "@/helpers/cn";
import AppStoreBadge from "@/public/assets/app-store-badge.svg";
import {
  Cancel01StrokeRounded,
  Tick02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { ArrowUpRight03StrokeStandard } from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";

import { useEffect, useState } from "react";
const LINK = `https://apps.apple.com/us/app/lumo/id${APP_STORE_APP_ID}`;
const IS_DISMISSED_KEY = "ios-app-advertisement-dismissed";
const features = [
  "Get notifications",
  "Add widgets to your home screen",
  "Change your app icon",
  "And more!",
];
export function IOSAppAdvertisement() {
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem(IS_DISMISSED_KEY) === "true" || !isIOS || isIOSApp
  );
  useEffect(() => {
    document.body.style.overflow = isDismissed ? "auto" : "hidden";
  }, [isDismissed]);
  if (isDismissed) return null;
  const onDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(IS_DISMISSED_KEY, "true");
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 size-full bg-background z-100">
      <div className="size-full relative px-4 py-12 flex items-center justify-center">
        <div
          className="absolute top-4 right-4 bg-background z-100 clickable"
          onClick={onDismiss}
        >
          <HugeiconsIcon
            icon={Cancel01StrokeRounded}
            className="size-6 text-muted-foreground"
          />
        </div>
        <div className="flex flex-col gap-6 items-center justify-between h-full">
          <div />
          <div className="flex flex-col gap-4 items-center">
            <AppStoreAppCombinedLogo />
            <h1 className="text-2xl font-semibold">Download our app</h1>
            <IOSAppFeaturesList />

            <IOSAppInstallButton />
          </div>
          <div
            onClick={onDismiss}
            className="flex gap-1 items-center clickable"
          >
            <p className="text-muted-foreground">Continue on the website</p>
            <HugeiconsIcon
              icon={ArrowUpRight03StrokeStandard}
              className="size-5 text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export function IOSAppFeaturesList() {
  return (
    <ul className="flex flex-col gap-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Tick02StrokeRounded}
            className="size-5 text-brand"
          />
          <p>{feature}</p>
        </li>
      ))}
    </ul>
  );
}
export function IOSAppInstallButton() {
  return (
    <a rel="noopener noreferrer" target="_blank" href={LINK}>
      <AppStoreBadge className="h-12" />
    </a>
  );
}
export function AppStoreAppCombinedLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative">
        <img
          src="/assets/app-store-icon.png"
          alt="App Store Icon"
          className="size-16 min-w-16 z-10"
        />
        <div className="absolute top-0 left-[-1px] size-full shadow-[10px_0px_10px_-2px_rgb(0_0_0_/_0.15)]! rounded-[16px]"></div>
      </div>

      <img
        src="/assets/app-store-app-icon.png"
        alt="Lumo App Icon"
        className="size-14 -ml-4"
      />
    </div>
  );
}
