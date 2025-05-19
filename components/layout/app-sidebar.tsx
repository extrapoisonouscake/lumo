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
import { prepareThemeColor } from "@/helpers/prepare-theme-color";
import { useThemeColor } from "@/hooks/trpc/use-theme-color";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAuthStatus } from "../providers/auth-status-provider";
import { LogInButton } from "./log-in";

import { useLogOut } from "@/hooks/trpc/use-log-out";
import { LogOutIcon } from "lucide-react";
import { Spinner } from "../ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserHeader } from "./user-header";

export function AppSidebar({
  initialThemeColor,
  ...props
}: React.ComponentProps<typeof Sidebar> & { initialThemeColor: string }) {
  const isGuest = clientAuthChecks.isInGuestMode();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sidebar {...props}>
        <PagesMenu initialThemeColor={initialThemeColor} isGuest={isGuest} />
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
          <ThemeToggle isInSidebar />
          <SidebarMenuItem>
            {isGuest ? <LogInButton /> : <LogOutButton />}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function PagesMenu({
  initialThemeColor,
  isGuest,
}: {
  initialThemeColor?: string;
  isGuest: boolean;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const pages = useMemo(() => {
    return Object.entries(websitePagesWithStaticPaths).filter(
      ([url, page]) =>
        !page.isHiddenInSidebar &&
        (!isGuest || guestAllowedPathnames.includes(url))
    );
  }, [isGuest]);
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
              className={cn(
                isMobile &&
                  "flex-col h-full justify-center gap-1 text-xs px-2 py-1.5 data-[active=true]:bg-transparent transition-colors"
              )}
              style={{
                color:
                  isMobile && isActive && themeColor
                    ? prepareThemeColor(themeColor)
                    : undefined,
              }}
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
