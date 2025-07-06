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
import { websitePagesWithStaticPaths } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { useThemeColor } from "@/hooks/trpc/use-theme-color";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStatus } from "../providers/auth-status-provider";

import { useLogOut } from "@/hooks/trpc/use-log-out";
import { LogOutIcon } from "lucide-react";
import { Spinner } from "../ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserHeader } from "./user-header";

export function AppSidebar({
  initialThemeColor,
  ...props
}: React.ComponentProps<typeof Sidebar> & { initialThemeColor: string }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sidebar {...props}>
        <PagesMenu initialThemeColor={initialThemeColor} />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserHeader />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pb-1">
        <SidebarGroup className={cn("py-0")}>
          <SidebarGroupContent>
            <PagesMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <ThemeToggle isInSidebar />
          <SidebarMenuItem>
            <LogOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function PagesMenu({ initialThemeColor }: { initialThemeColor?: string }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const pages = Object.entries(websitePagesWithStaticPaths).filter(
    ([url, page]) => !page.isHiddenInSidebar
  );
  const themeColor = useThemeColor(initialThemeColor);
  return (
    <SidebarMenu className={cn(isMobile && "flex-row gap-2 p-2")}>
      {pages.map(([url, page]) => {
        const isActive =
          url === "/" ? url === pathname : pathname.startsWith(url);
        return (
          <SidebarMenuItem key={url} className={cn(isMobile && "flex-1")}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn({
                "flex-col h-full justify-center gap-1 text-xs px-2 py-1.5 data-[active=true]:text-brand data-[active=true]:bg-brand/10 transition-colors":
                  isMobile,
              })}
            >
              <Link href={url}>
                <page.icon className="size-5" />
                {page.breadcrumb[0]!.name}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
function LogOutButton() {
  const router = useRouter();
  const { refreshAuthStatus } = useAuthStatus();
  const logOutMutation = useLogOut(router.push, refreshAuthStatus);
  return (
    <SidebarMenuButton
      shouldCloseSidebarOnMobile={false}
      disabled={logOutMutation.isPending}
      onClick={() => logOutMutation.mutateAsync()}
    >
      {logOutMutation.isPending ? <Spinner /> : <LogOutIcon />}
      Sign Out
    </SidebarMenuButton>
  );
}
