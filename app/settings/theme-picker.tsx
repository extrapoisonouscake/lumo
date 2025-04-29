"use client";
import { Label } from "@/components/ui/label";
import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { cn } from "@/helpers/cn";
import { prepareThemeColor } from "@/helpers/prepare-theme-color";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useDebouncedUserSetting } from "@/hooks/trpc/use-debounced-user-setting";
import { Check } from "lucide-react";
import { useState } from "react";
import { THEME_COLOR_TAG_ID } from "../constants";

const AVAILABLE_THEMES = [
  USER_SETTINGS_DEFAULT_VALUES.themeColor,
  "356 83% 41%",
  "31 100% 48%",
  "40 97% 64%",
  "90 34% 63%",
  "201 51% 69%",
  "206 46% 37%",
  "239 77% 70%",
  "272 63% 46%",
];

export function ThemePicker({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const updateUserSettingMutation = useDebouncedUserSetting("themeColor");
  const updateThemeLocally = (theme: string) => {
    setValue(theme);
    (document.querySelector(":root") as HTMLElement).style.setProperty(
      "--brand",
      theme
    );
    updateUserSettingState("themeColor", theme);
    (document.getElementById(THEME_COLOR_TAG_ID) as HTMLMetaElement).content =
      prepareThemeColor(theme);
  };
  const onChangeHandler = async (theme: string) => {
    updateThemeLocally(theme);
    try {
      await updateUserSettingMutation.mutateAsync(theme);
    } catch (e) {
      updateThemeLocally(initialValue);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-normal">Theme color</Label>
      <div className="flex gap-2 flex-wrap">
        {AVAILABLE_THEMES.map((theme) => (
          <div
            key={theme}
            className={cn(
              "size-8 rounded-full cursor-pointer transition-transform flex justify-center items-center",
              {
                "ring-2 ring-white ring-offset-2 scale-110 shadow-md":
                  value === theme,
              }
            )}
            style={{ backgroundColor: prepareThemeColor(theme) }}
            onClick={() => onChangeHandler(theme)}
          >
            {value === theme && (
              <Check className="text-white drop-shadow-md" size={18} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
