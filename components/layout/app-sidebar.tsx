"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  guestAllowedPathnames,
  websitePagesWithStaticPaths,
} from "@/constants/website";
import { cn } from "@/helpers/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { LogInButton } from "./log-in";
import { LogOutButton } from "./log-out";
import { ThemeToggle } from "./theme-toggle";

export function AppSidebar({
  userHeader,
  isGuest,
  ...props
}: { userHeader: ReactNode | null; isGuest: boolean } & React.ComponentProps<
  typeof Sidebar
>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {userHeader && (
        <SidebarHeader className="pb-1">
          <SidebarMenu>
            <SidebarMenuItem>{userHeader}</SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <SidebarContent className="pb-1">
        <SidebarGroup className={cn("py-0", { "pt-2": isGuest })}>
          <SidebarGroupContent>
            <PagesMenu isGuest={isGuest} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <ThemeToggle />
          <SidebarMenuItem>
            {isGuest ? <LogInButton /> : <LogOutButton />}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
function PagesMenu({ isGuest }: { isGuest: boolean }) {
  const pathname = usePathname();
  const pages = useMemo(() => {
    return Object.entries(websitePagesWithStaticPaths).filter(
      ([url, page]) =>
        !page.isHiddenInSidebar &&
        (!isGuest || guestAllowedPathnames.includes(url))
    );
  }, [isGuest]);
  return (
    <SidebarMenu>
      {pages.map(([url, page]) => (
        <SidebarMenuItem key={url}>
          <SidebarMenuButton
            asChild
            isActive={url === "/" ? url === pathname : pathname.startsWith(url)}
          >
            <Link href={url}>
              <page.icon />
              {page.breadcrumb[0].name}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
