import { Calendar, Home, Library, Settings } from "lucide-react";
import { Params } from "next/dist/server/request/params";

export const WEBSITE_TITLE = "MyEd+";

export interface BreadcrumbDataItem {
  name: string;
  href?: string;
}
export interface WebsitePage {
  breadcrumb: BreadcrumbDataItem[];
  icon?: any /*//!*/;
}
interface StaticWebsitePage extends WebsitePage {
  isHiddenInSidebar?: boolean;
}
export const unauthenticatedPathnames = ["/login", "/register"];
export const guestAllowedPathnames = ["/", "/settings", "/announcements"];
export const websitePagesWithStaticPaths: Record<string, StaticWebsitePage> = {
  "/": { breadcrumb: [{ name: "Home" }], icon: Home },
  "/schedule": { breadcrumb: [{ name: "Schedule" }], icon: Calendar },
  "/classes": { breadcrumb: [{ name: "Classes" }], icon: Library },
  "/settings": { breadcrumb: [{ name: "Settings" }], icon: Settings },
  "/profile": { breadcrumb: [{ name: "Profile" }], isHiddenInSidebar: true },
};
export const getWebsitePageData = (pathname: string, params: Params) => {
  const exactMatch = websitePagesWithStaticPaths[pathname]!;
  if (exactMatch) return exactMatch;
  const segments = pathname.split("/").slice(1);
  let data = null;
  if (segments[0] === "classes") {
    let lastPathname = "/classes";
    data = {
      breadcrumb: [{ name: "Classes", href: lastPathname }],
      icon: websitePagesWithStaticPaths["/classes"]!.icon,
    };
    const assignmentId = segments[3];
    if (segments[1]) {
      const subjectName = segments[2]
        ? decodeURIComponent(segments[2])
        : undefined;
      lastPathname += `/${segments[1]}${subjectName ? `/${subjectName}` : ""}`;

      data.breadcrumb.push({
        name: subjectName ? subjectName.replaceAll("_", " ") : `Loading...`,
        href: lastPathname,
      });
    }
    if (assignmentId) {
      lastPathname += `/assignments/${assignmentId}`;
      data.breadcrumb.push({
        name: "Assignment",
        href: lastPathname,
      });
    }
    return data;
  }
  if (segments[0] === "schedule") {
    return websitePagesWithStaticPaths["/schedule"]!;
  }
  return null;
};
export const VISIBLE_DATE_FORMAT = "MM/DD/YYYY";
