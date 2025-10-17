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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BookOpen01SolidRounded,
  Calendar02SolidRounded,
  Home03SolidRounded,
  SchoolReportCardSolidRounded,
  Settings02SolidRounded,
} from "@hugeicons-pro/core-solid-rounded";
import {
  BookOpen01StrokeRounded,
  Calendar02StrokeRounded,
  Home03StrokeRounded,
  Logout05StrokeRounded,
  SchoolReportCardStrokeRounded,
  Settings02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";

import { usePathname } from "next/navigation";

import { useLogOut } from "@/hooks/trpc/use-log-out";
import { useNavigate } from "react-router";
import { Spinner } from "../ui/button";
import { Link } from "../ui/link";

import { IconSvgObject } from "@/types/ui";
import { ThemeToggle } from "./theme-toggle";
import { UserHeader } from "./user-header";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sidebar {...props}>
        <PagesMenu />
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
const pageIcons: Record<string, [IconSvgObject, IconSvgObject]> = {
  "/": [Home03StrokeRounded, Home03SolidRounded],
  "/classes": [BookOpen01StrokeRounded, BookOpen01SolidRounded],
  "/schedule": [Calendar02StrokeRounded, Calendar02SolidRounded],
  "/transcript": [SchoolReportCardStrokeRounded, SchoolReportCardSolidRounded],
  "/settings": [Settings02StrokeRounded, Settings02SolidRounded],
};
function PagesMenu() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const pages = Object.entries(websitePagesWithStaticPaths).filter(
    ([_, page]) =>
      !page.isHiddenInSidebar &&
      (isMobile ? page.showOnMobile : (page.showOnDesktop ?? true))
  );

  return (
    <>
      <SidebarMenu
        className={cn(
          "relative z-30",
          isMobile && "flex-row gap-0 justify-around p-2"
        )}
      >
        {pages.map(([url, page]) => {
          const isActive =
            url === "/" ? url === pathname : pathname.startsWith(url);
          const icon = pageIcons[url]?.[isActive ? 1 : 0];
          const mainItemContent = (
            <>
              {icon && (
                <HugeiconsIcon
                  data-auto-stroke-width="true"
                  size={18}
                  //only for stroke icons
                  strokeWidth={!isActive ? 1.7 : undefined}
                  className="!size-4.5 sm:!size-4"
                  icon={icon}
                />
              )}
              <span className={cn({ "leading-none": isMobile })}>
                {page.name}
              </span>
            </>
          );
          return (
            <SidebarMenuItem className="flex-1" key={url}>
              <SidebarMenuButton isActive={isActive} asChild>
                <Link to={url} className="py-2 gap-2">
                  {mainItemContent}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </>
  );
}
function LogOutButton() {
  const navigate = useNavigate();
  const logOutMutation = useLogOut(navigate);
  return (
    <SidebarMenuButton
      disabled={logOutMutation.isPending}
      onClick={() => logOutMutation.mutateAsync()}
    >
      {logOutMutation.isPending ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={Logout05StrokeRounded} />
      )}
      Sign Out
    </SidebarMenuButton>
  );
}
