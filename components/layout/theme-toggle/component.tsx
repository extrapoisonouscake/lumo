"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "../../ui/select";
import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";

export function ThemeToggleComponent({
  isInSidebar,
  shouldShowText = true,
}: {
  isInSidebar?: boolean;
  shouldShowText?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  const triggerContent = (
    <>
      <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      {shouldShowText && "Theme"}
    </>
  );
  const content = (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger asChild>
        {isInSidebar ? (
          <SidebarMenuButton shouldCloseSidebarOnMobile={false}>
            {triggerContent}
          </SidebarMenuButton>
        ) : (
          <Button variant="ghost" size="smallIcon">
            {triggerContent}
          </Button>
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
  if (isInSidebar) {
    return <SidebarMenuItem>{content}</SidebarMenuItem>;
  }
  return content;
}
