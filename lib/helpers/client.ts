import { UserSetting, UserSettings } from "@/types/core";

export async function updateUserSetting<T extends UserSetting>({
  key,
  value,
}: {
  key: T;
  value: UserSettings[T];
}) {
  const response = await fetch("/api/settings/single", {
    method: "PUT",
    body: JSON.stringify({ key, value }),
  });
  if (!response.ok) {
    throw new Error("Failed to update user setting");
  }
}
