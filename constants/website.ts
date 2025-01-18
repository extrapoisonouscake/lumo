import { convertPathParameterToSubjectName } from "@/app/classes/[name]/[id]/helpers";
import { Calendar, Home, Settings, Shapes } from "lucide-react";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

export const WEBSITE_TITLE = "MyEdBC";
interface WebsitePage {
  name: string;
  icon?: any /*//!*/;
}
interface StaticWebsitePage extends WebsitePage {
  isHiddenInSidebar?: boolean;
}
export const websitePagesWithStaticPaths: Record<string, StaticWebsitePage> = {
  "/": { name: "Home", icon: Home },
  "/schedule": { name: "Schedule", icon: Calendar },
  "/classes": { name: "Classes", icon: Shapes },
  "/settings": { name: "Settings", icon: Settings },
  "/profile": { name: "Profile", isHiddenInSidebar: true },
};
export const getWebsitePageData = (pathname: string, params: Params) => {
  const exactMatch = websitePagesWithStaticPaths[pathname];
  if (exactMatch) return exactMatch;
  const segments = pathname.split("/").slice(1);
  if (segments[0] === "classes" && segments[1] && !segments[2])
    return {
      name: `${convertPathParameterToSubjectName(params.name)}`,
      icon: websitePagesWithStaticPaths["/classes"].icon,
    };
  return null;
};
export const VISIBLE_DATE_FORMAT = "MM/DD/YYYY";
