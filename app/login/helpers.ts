import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { refreshSessionExpiresAt } from "../trpc";
import { AuthStatusContext } from "@/components/providers/auth-status-provider";

export const initClientLogin=({push,refreshAuthStatus}:{push:AppRouterInstance['push'],refreshAuthStatus:AuthStatusContext['refreshAuthStatus']})=>{
    refreshSessionExpiresAt();
      push("/");
      refreshAuthStatus();
}