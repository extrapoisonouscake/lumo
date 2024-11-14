"use client";
import { websitePages } from "@/constants/website";
import { usePathname } from "next/navigation";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";

export function PageHeading() {
  const pathname = usePathname();
  const pageData = websitePages[pathname];

  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <p className="text-foreground text-sm">{pageData && pageData.name}</p>
    </div>
  );
}
