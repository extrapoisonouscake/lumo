"use client";
import { FullscreenLoader } from "@/components/ui/fullscreen-loader";
import dynamic from "next/dynamic";

const Root = dynamic(() => import("../../views/root"), {
  ssr: false,
  loading: () => <FullscreenLoader />,
});
export default function Page() {
  return <Root />;
}
