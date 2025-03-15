"use client";
import NextTopLoader from "nextjs-toploader";
import NProgress from "nprogress";
import { useEffect } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";
const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme?.colors;
const primaryColor = colors?.brand?.DEFAULT;
export function TopLoader() {
  useEffect(() => {
    NProgress.configure({ parent: "#top-loader-container" });
  }, []);
  return (
    <>
      <NextTopLoader
        zIndex={40}
        shadow={false}
        color={primaryColor}
        showSpinner={false}
      />
      <div className="fixed md:sticky md:h-0 md:overflow-visible top-0 left-0 w-full z-50">
        <div
          className="relative size-full h-[3px] -top-full"
          id="top-loader-container"
        />
      </div>
    </>
  );
}
