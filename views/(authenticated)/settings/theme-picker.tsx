"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { isIOSApp, isMobileApp } from "@/constants/ui";

import { cn } from "@/helpers/cn";
import { prepareThemeColor, setThemeColorCSSVariable } from "@/helpers/theme";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useUpdateGenericUserSetting } from "@/hooks/trpc/use-update-generic-user-setting";
import { AppIcon } from "@capacitor-community/app-icon";
import { Tick02StrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { capitalize } from "../../../helpers/prettifyEducationalName";
const AVAILABLE_THEMES = {
  default: USER_SETTINGS_DEFAULT_VALUES.themeColor,
  red: "350 72% 52%",
  burgundy: "338 49% 43%",
  pink: "345 100% 78%",
  orange: "31 100% 48%",
  yellow: "40 97% 64%",
  lightGreen: "90 34% 63%",
  blue: "201 100% 36%",
  navy: "206 46% 37%",
  purple: "239 77% 70%",
};
const IOS_APP_ICON_SUFFIX = "AppIcon";
export const getIOSAppIconName = (key: string) => {
  return `${key !== "default" ? capitalize(key) : ""}${IOS_APP_ICON_SUFFIX}`;
};
export const reconcileMobileAppIcon = async (currentTheme: string) => {
  if (!isMobileApp) return;
  AppIcon.getName().then(async ({ value: rawIconName }) => {
    const iconName =
      rawIconName?.replace(IOS_APP_ICON_SUFFIX, "").toLowerCase() || "default";
    const currentThemeKey = Object.keys(AVAILABLE_THEMES).find(
      (key) =>
        AVAILABLE_THEMES[key as keyof typeof AVAILABLE_THEMES] === currentTheme
    );
    if (currentThemeKey && currentThemeKey !== iconName) {
      const formattedName = getIOSAppIconName(currentThemeKey);

      await AppIcon.change({
        name: formattedName,
        suppressNotification: false,
      });
    }
  });
};
export function ThemePicker({ initialValue }: { initialValue: string }) {
  const [currentTheme, setCurrentTheme] = useState(initialValue);

  const updateUserSettingMutation = useUpdateGenericUserSetting();
  const updateThemeLocally = (theme: string) => {
    setCurrentTheme(theme);
    setThemeColorCSSVariable(theme);
    updateUserSettingState("themeColor", theme);
  };
  const onChangeHandler = async (key: string) => {
    const theme = AVAILABLE_THEMES[key as keyof typeof AVAILABLE_THEMES];
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
      if (isIOSApp) {
        promises.push(
          AppIcon.change({
            name: getIOSAppIconName(key),
            suppressNotification: false,
          })
        );
      }
      await Promise.allSettled(promises);
    } catch (e) {
      updateThemeLocally(oldValue);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-normal">Theme colour</Label>
      <Card className="p-3 overflow-x-auto w-fit max-w-full">
        <div className="flex flex-row gap-2">
          {Object.entries(AVAILABLE_THEMES).map(([key, color]) => (
            <div
              key={key}
              className={cn(
                "size-9 min-w-9 rounded-full cursor-pointer transition-transform flex justify-center items-center hover:scale-110",
                {
                  "ring-2 ring-white ring-offset-2 scale-110 shadow-md":
                    currentTheme === key,
                }
              )}
              style={{ backgroundColor: prepareThemeColor(color) }}
              onClick={() => onChangeHandler(key)}
            >
              {currentTheme === color && (
                <HugeiconsIcon
                  icon={Tick02StrokeRounded}
                  className="text-white drop-shadow-md"
                  size={18}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
