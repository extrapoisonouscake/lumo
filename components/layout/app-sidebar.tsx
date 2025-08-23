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
} from "@/components/ui/sidebar";
import { websitePagesWithStaticPaths } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";

import { usePathname, useRouter } from "next/navigation";

import { useLogOut } from "@/hooks/trpc/use-log-out";
import { ChevronRight, LogOutIcon } from "lucide-react";
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
    ([_, page]) => !page.isHiddenInSidebar && (!isMobile || page.showOnMobile)
  );
  return (
    <SidebarMenu className={cn(isMobile && "flex-row gap-2 p-2")}>
      {pages.map(([url, page]) => {
        const isActive =
          url === "/" ? url === pathname : pathname.startsWith(url);
        const mainItemContent = (
          <>
            {page.icon && <page.icon className="size-5" />}
            {page.breadcrumb[0]!.name}
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
                  asChild
                  isActive={isActive && (isMobile || !page.items?.length)}
                  className={cn({
                    "flex-col h-full justify-center gap-1 text-xs px-2 py-1.5 data-[active=true]:text-brand data-[active=true]:bg-brand/10 transition-colors":
                      isMobile,
                  })}
                >
                  {page.items && !isMobile ? (
                    <div className="flex items-center gap-2 cursor-pointer">
                      {mainItemContent}
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </div>
                  ) : (
                    <Link href={url}>{mainItemContent}</Link>
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
                              href={fullUrl}
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
  );
}
function LogOutButton() {
  const router = useRouter();
  const logOutMutation = useLogOut(router.push);
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
