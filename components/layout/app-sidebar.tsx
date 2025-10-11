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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { websitePagesWithStaticPaths } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";

import { usePathname } from "next/navigation";

import { useLogOut } from "@/hooks/trpc/use-log-out";
import { ChevronRight, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { Spinner } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Link } from "../ui/link";

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

function PagesMenu() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const pages = Object.entries(websitePagesWithStaticPaths).filter(
    ([_, page]) =>
      !page.isHiddenInSidebar &&
      (isMobile ? page.showOnMobile : (page.showOnDesktop ?? true))
  );
  const { toggleSidebar, open } = useSidebar();
  return (
    <>
      <SidebarMenu
        className={cn("relative z-30", isMobile && "flex-row gap-2 p-2")}
      >
        {pages.map(([url, page]) => {
          const isActive =
            url === "/" ? url === pathname : pathname.startsWith(url);
          const mainItemContent = (
            <>
              {page.icon && <page.icon />}
              <span className={cn({ "leading-none": isMobile })}>
                {page.breadcrumb[0]!.name}
              </span>
            </>
          );
          return (
            <Collapsible
              defaultOpen={isActive}
              key={url}
              className={cn("group/collapsible", {
                "flex-1": isMobile,
              })}
            >
              <SidebarMenuItem key={url}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={isActive && (isMobile || !page.items?.length)}
                    asChild
                  >
                    {page.items && !isMobile ? (
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          if (!open) {
                            toggleSidebar();
                          }
                        }}
                      >
                        {mainItemContent}
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </div>
                    ) : (
                      <Link to={url} className="py-2 gap-2">
                        {mainItemContent}
                      </Link>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {page.items?.length && !isMobile && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {page.items.map((item) => {
                        const fullUrl = url + item.href;
                        return (
                          <SidebarMenuSubItem key={fullUrl}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                fullUrl === url
                                  ? pathname === fullUrl
                                  : pathname.startsWith(fullUrl)
                              }
                            >
                              <Link
                                to={fullUrl}
                                className="whitespace-nowrap flex items-center gap-2"
                              >
                                {item.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
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
      shouldCloseSidebarOnMobile={false}
      disabled={logOutMutation.isPending}
      onClick={() => logOutMutation.mutateAsync()}
    >
      {logOutMutation.isPending ? <Spinner /> : <LogOutIcon />}
      Sign Out
    </SidebarMenuButton>
  );
}
