import { isIOS, isIOSWebView } from "@/constants/ui";
import AppStoreBadge from "@/public/app-store-badge.svg";
import { ArrowUpRight, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
const LINK = "https://apps.apple.com/us/app/lumo/id6752838080";
const IS_DISMISSED_KEY = "ios-app-advertisement-dismissed";
const features = [
  "Get notifications",
  "Add widgets to your home screen",
  "Change your app icon",
  "And more!",
];
export function IOSAppAdvertisement() {
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem(IS_DISMISSED_KEY) === "true" || !isIOS || isIOSWebView
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
      <div className="size-full relative p-4 flex items-center justify-center">
        <div
          className="absolute top-4 right-4 bg-background z-100 clickable"
          onClick={onDismiss}
        >
          <X className="size-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="flex flex-col gap-4 items-center">
            <img
              src="/app-store-app-icon.png"
              alt="Lumo App Icon"
              className="size-16"
            />
            <h1 className="text-2xl font-semibold">Download our app</h1>

            <ul className="flex flex-col gap-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="size-5 text-brand" />
                  <p>{feature}</p>
                </li>
              ))}
            </ul>
            <a rel="noopener noreferrer" target="_blank" href={LINK}>
              <AppStoreBadge className="h-13" />
            </a>
          </div>
          <div
            onClick={onDismiss}
            className="flex gap-1 items-center clickable"
          >
            <p className="text-muted-foreground">Continue on the website</p>
            <ArrowUpRight className="size-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
