"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { isIOSWebView } from "@/constants/ui";

import { cn } from "@/helpers/cn";
import { callNative } from "@/helpers/ios-bridge";
import { prepareThemeColor } from "@/helpers/prepare-theme-color";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useUpdateGenericUserSetting } from "@/hooks/trpc/use-update-generic-user-setting";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const AVAILABLE_THEMES = [
  USER_SETTINGS_DEFAULT_VALUES.themeColor,
  "350 72% 52%",
  "338 49% 43%",
  "345 100% 78%",
  "31 100% 48%",
  "40 97% 64%",
  "90 34% 63%",
  "201 100% 36%",
  "206 46% 37%",
  "239 77% 70%",
];

export function ThemePicker({ initialValue }: { initialValue: string }) {
  const [currentTheme, setCurrentTheme] = useState(initialValue);
  useEffect(() => {
    if (isIOSWebView) {
      callNative<string>("getAppTheme").then((theme) => {
        if (currentTheme !== theme) {
          callNative("setAppTheme", { hsl: currentTheme });
        }
      });
    }
  }, []);
  const updateUserSettingMutation = useUpdateGenericUserSetting();
  const updateThemeLocally = (theme: string) => {
    setCurrentTheme(theme);
    (document.querySelector(":root") as HTMLElement).style.setProperty(
      "--brand",
      theme
    );
    updateUserSettingState("themeColor", theme);
  };
  const onChangeHandler = async (theme: string) => {
    updateThemeLocally(theme);
    const oldValue = currentTheme;
    try {
      const promises = [];
      promises.push(
        updateUserSettingMutation.mutateAsync({
          key: "themeColor",
          value: theme,
        })
      );
      if (isIOSWebView) {
        promises.push(
          callNative("setAppTheme", {
            hsl: theme,
          })
        );
      }
      await Promise.all(promises);
    } catch (e) {
      updateThemeLocally(oldValue);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-normal">Theme colour</Label>
      <Card className="p-3 overflow-x-auto w-full max-w-full">
        <div className="flex flex-row gap-2">
          {AVAILABLE_THEMES.map((color) => (
            <div
              key={color}
              className={cn(
                "size-8 min-w-8 rounded-full cursor-pointer transition-transform flex justify-center items-center hover:scale-110",
                {
                  "ring-2 ring-white ring-offset-2 scale-110 shadow-md":
                    currentTheme === color,
                }
              )}
              style={{ backgroundColor: prepareThemeColor(color) }}
              onClick={() => onChangeHandler(color)}
            >
              {currentTheme === color && (
                <Check className="text-white drop-shadow-md" size={18} />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
