"use client";
import { Logo } from "@/components/misc/logo";
import dynamic from "next/dynamic";

const Root = dynamic(() => import("../../views/root"), {
  ssr: false,
  loading: () => <FullscreenLoader />,
});
export default function Page() {
  return <Root />;
}
function FullscreenLoader() {
  return (
    <div className="size-full flex items-center justify-center [@media(prefers-color-scheme:dark)]:bg-[#09090B]">
      <div className="relative overflow-hidden h-fit w-fit">
        <Logo
          data-auto-stroke-width="true"
          className="size-24 lg:size-26 text-brand"
        />
        <div className="absolute inset-0 bg-linear-[to_right,transparent_0%,rgba(255,255,255,0.8)_35%,rgba(255,255,255,0.8)_65%,transparent_100%] [@media(prefers-color-scheme:dark)]:bg-linear-[to_right,transparent_0%,hsla(240,10%,3.9%,0.8)_35%,hsla(240,10%,3.9%,0.8)_65%,transparent_100%] animate-shimmer duration-[1.2s]" />
      </div>
    </div>
  );
}
