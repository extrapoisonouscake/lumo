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
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { LogInButton } from "./log-in";
import { LogOutButton } from "./log-out";
import { ThemeToggle } from "./theme-toggle";
import { UserHeader } from "./user-header";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isGuest = clientAuthChecks.isInGuestMode();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sidebar {...props}>
        <PagesMenu isGuest={isGuest} />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {!isGuest && (
        <SidebarHeader className="pb-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <UserHeader />
            </SidebarMenuItem>
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
  const isMobile = useIsMobile();
  const pages = useMemo(() => {
    return Object.entries(websitePagesWithStaticPaths).filter(
      ([url, page]) =>
        !page.isHiddenInSidebar &&
        (!isGuest || guestAllowedPathnames.includes(url))
    );
  }, [isGuest]);

  return (
    <SidebarMenu className={cn(isMobile && "flex-row gap-2 p-2")}>
      {pages.map(([url, page]) => (
        <SidebarMenuItem key={url} className={cn(isMobile && "flex-1")}>
          <SidebarMenuButton
            asChild
            isActive={url === "/" ? url === pathname : pathname.startsWith(url)}
            className={cn(
              isMobile &&
                "flex-col h-full justify-center gap-1 text-xs px-2 py-1"
            )}
          >
            <Link href={url}>
              <page.icon className="size-5" />
              {page.breadcrumb[0]!.name}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
