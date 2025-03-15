"use client";
import { Label } from "@/components/ui/label";
import { cn } from "@/helpers/cn";
import { updateUserSettingViaServerAction } from "@/lib/settings/mutations";
import { Check } from "lucide-react";
import { useState } from "react";

const AVAILABLE_THEMES = [
  "180 100% 25%",
  "356 83% 41%",
  "31 100% 48%",
  "40 97% 64%",
  "90 34% 63%",
  "162 23% 49%",
  "201 51% 69%",
  "206 46% 37%",
  "239 77% 70%",
  "272 63% 46%",
];

export function ThemePicker({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const onChangeHandler = async (theme: string) => {
    setValue(theme);
    await updateUserSettingViaServerAction({
      key: "themeColor",
      value: theme,
    });
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
            style={{ backgroundColor: `hsl(${theme})` }}
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
