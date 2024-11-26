"use client";

import { relogin } from "@/lib/auth/mutations";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export function ReloginWrapper({ skeleton }: { skeleton: ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    relogin().then((res) => {
      if (res) {
        router.push(`/login?message=${res.message}`);
      } else {
        window.location.reload();
      }
    });
  }, []);
  return skeleton;
}
