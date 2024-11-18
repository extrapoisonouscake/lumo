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
import { websitePages } from "@/constants/website";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutButton } from "./log-out";
import { ThemeToggle } from "./theme-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <PagesMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <ThemeToggle />
          <LogOutButton />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
function PagesMenu() {
  const pathname = usePathname();
  return (
    <SidebarMenu>
      {Object.entries(websitePages).map(([url, page]) => (
        <SidebarMenuItem key={page.name}>
          <SidebarMenuButton
            asChild
            isActive={
              pathname === "/" ? pathname === url : url.startsWith(pathname)
            }
          >
            <Link href={url}>
              <page.icon />
              {page.name}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
