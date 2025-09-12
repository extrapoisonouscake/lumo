"use client";
import NextTopLoader from "nextjs-toploader";
import NProgress from "nprogress";
import { useEffect } from "react";

export function TopLoader() {
  useEffect(() => {
    NProgress.configure({ parent: "#top-loader-container" });
  }, []);
  return (
    <>
      <NextTopLoader
        zIndex={40}
        shadow={false}
        color="var(--brand)"
        showSpinner={false}
      />
      <div className="fixed sm:sticky sm:h-0 sm:overflow-visible top-0 left-0 w-full z-50">
        <div
          className="relative size-full h-[3px] -top-full"
          id="top-loader-container"
        />
      </div>
    </>
  );
}
