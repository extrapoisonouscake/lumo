"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "../ui/select";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  console.log({ theme });
  return (
    <SidebarMenuItem>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger asChild className="p-0 border-0 bg-transparent">
          <SidebarMenuButton>
            <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            Theme
          </SidebarMenuButton>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </SidebarMenuItem>
  );
}
