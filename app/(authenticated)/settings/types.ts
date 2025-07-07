import { RouterOutput } from "@/lib/trpc/types";

export type UserSettingsWithDerivedFields =
  RouterOutput["core"]["settings"]["getSettings"];
