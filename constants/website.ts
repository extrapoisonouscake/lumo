import { Calendar, Home, Settings, Shapes } from "lucide-react";

export const WEBSITE_TITLE = "MyEdBC Wrapper";

export const websitePages: Record<
  string,
  {
    name: string;
    icon?: any /*//!*/;
    isHiddenInSidebar?: boolean;
  }
> = {
  "/": { name: "Home", icon: Home },
  "/schedule": { name: "Schedule", icon: Calendar },
  "/classes": { name: "Classes", icon: Shapes },
  "/settings": { name: "Settings", icon: Settings },
  "/profile": { name: "Profile", isHiddenInSidebar: true },
};
