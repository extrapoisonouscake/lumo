import { convertPathParameterToSubjectName } from "@/app/classes/[...slug]/helpers";
import { Calendar, Home, Settings, Shapes } from "lucide-react";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

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
  "/classes": { breadcrumb: [{ name: "Classes" }], icon: Shapes },
  "/settings": { breadcrumb: [{ name: "Settings" }], icon: Settings },
  "/profile": { breadcrumb: [{ name: "Profile" }], isHiddenInSidebar: true },
};
export const getWebsitePageData = (pathname: string, params: Params) => {
  const exactMatch = websitePagesWithStaticPaths[pathname];
  if (exactMatch) return exactMatch;
  const segments = pathname.split("/").slice(1);
  let data = null;
  if (segments[0] === "classes") {
    let lastPathname = "/classes";
    data = {
      breadcrumb: [{ name: "Classes", href: lastPathname }],
      icon: websitePagesWithStaticPaths["/classes"].icon,
    };
    if (segments[1]) {
      lastPathname += `/${params.slug[0]}${
        params.slug[1] ? `/${params.slug[1]}` : ""
      }`;
      data.breadcrumb.push({
        name: `${convertPathParameterToSubjectName(params.slug[0])}`,
        href: lastPathname,
      });
    }
    return data;
  }
  if (segments[0] === "schedule") {
    return websitePagesWithStaticPaths["/schedule"];
  }
  return null;
};
export const VISIBLE_DATE_FORMAT = "MM/DD/YYYY";
