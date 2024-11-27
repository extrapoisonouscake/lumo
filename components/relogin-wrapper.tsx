"use client";

import { useRelogin } from "@/app/relogin-provider";
import { ReactNode, useEffect } from "react";

export function ReloginWrapper({ skeleton = null }: { skeleton?: ReactNode }) {
  const { isReloggingIn, relogin } = useRelogin();

  useEffect(() => {
    relogin();
  }, [relogin]);
  return skeleton;
}
