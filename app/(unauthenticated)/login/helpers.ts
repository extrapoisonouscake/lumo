import { refreshSessionExpiresAt } from "@/app/trpc";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const initClientLogin = (push: AppRouterInstance["push"]) => {
  refreshSessionExpiresAt();
  push("/");
};
