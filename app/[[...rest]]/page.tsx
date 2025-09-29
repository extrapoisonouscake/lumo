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
    <div className="relative overflow-hidden h-fit">
      <Logo className="size-24 lg:size-26 text-brand dark:text-white " />
      <div className="absolute inset-0 bg-linear-[to_right,transparent_0%,rgba(255,255,255,0.8)_45%,rgba(255,255,255,0.8)_55%,transparent_100%] dark:bg-linear-[to_right,transparent_0%,rgba(26,27,33,0.8)_45%,rgba(26,27,33,0.8)_55%,transparent_100%] animate-shimmer duration-[1.2s]" />
    </div>
  );
}
