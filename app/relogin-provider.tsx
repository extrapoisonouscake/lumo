import { relogin as reloginAction } from "@/lib/auth/mutations";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState } from "react";
type ReloginContextType = {
  isReloggingIn: boolean;
  relogin: () => Promise<void>;
};

const ReloginContext = createContext<ReloginContextType | undefined>(undefined);

let sharedReloginPromise: Promise<void> | null = null;

export const ReloginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isReloggingIn, setIsReloggingIn] = useState(false);
  const router = useRouter();
  const relogin = async () => {
    if (!sharedReloginPromise) {
      setIsReloggingIn(true);
      sharedReloginPromise = (async () => {
        try {
          const res = await reloginAction();
          if (res) {
            router.push(`/login?message=${res.message}`);
          } else {
            window.location.reload();
          }
        } finally {
          setIsReloggingIn(false);
          sharedReloginPromise = null;
        }
      })();
    }
    await sharedReloginPromise;
  };

  return (
    <ReloginContext.Provider value={{ isReloggingIn, relogin }}>
      {children}
    </ReloginContext.Provider>
  );
};

export const useRelogin = () => {
  const context = useContext(ReloginContext);
  if (!context) {
    throw new Error("useRelogin must be used within a ReloginProvider");
  }
  return context;
};
