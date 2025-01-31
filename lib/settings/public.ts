import { USER_SETTINGS_KEYS } from "@/constants/core";
import { z } from "zod";

export const setUserSettingSchema = z.object({
  key: z.enum(USER_SETTINGS_KEYS),
  value: z.any(), //!
});
export type SetUserSettingSchema = z.infer<typeof setUserSettingSchema>;
