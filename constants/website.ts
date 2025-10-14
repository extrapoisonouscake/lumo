import {
  BookOpen01SolidRounded,
  Calendar02SolidRounded,
  Home03SolidRounded,
  ScrollSolidRounded,
  Settings02SolidRounded,
} from "@hugeicons-pro/core-solid-rounded";
import {
  BookOpen01StrokeRounded,
  Calendar02StrokeRounded,
  Home03StrokeRounded,
  ScrollStrokeRounded,
  Settings02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { Params } from "next/dist/server/request/params";

export const WEBSITE_TITLE = "Lumo";

export interface BreadcrumbDataItem {
  name: string;
  href?: string;
}
export interface WebsitePage {
  breadcrumb: (BreadcrumbDataItem | null)[];
  icon?: [any, any];
}
interface StaticWebsitePage extends WebsitePage {
  isHiddenInSidebar?: boolean;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  items?: { title: string; href: string }[];
}
export const unauthenticatedPathnames = ["/login", "/register"];
export const publicPathnames = [
  "/maintenance",
  "/legal/privacy-policy",
  "/support",
];
export const websitePagesWithStaticPaths: Record<string, StaticWebsitePage> = {
  "/": {
    breadcrumb: [{ name: "Home" }],
    icon: [Home03StrokeRounded, Home03SolidRounded],
    showOnMobile: true,
  },
  "/classes": {
    breadcrumb: [{ name: "Classes" }],
    icon: [BookOpen01StrokeRounded, BookOpen01SolidRounded],
    showOnMobile: true,
  },
  "/schedule": {
    breadcrumb: [{ name: "Schedule" }],
    icon: [Calendar02StrokeRounded, Calendar02SolidRounded],
    showOnMobile: true,
  },
  "/graduation": {
    breadcrumb: [{ name: "Graduation" }],
    icon: [ScrollStrokeRounded, ScrollSolidRounded],
    showOnMobile: true,
  },

  "/settings": {
    breadcrumb: [{ name: "Settings" }],
    icon: [Settings02StrokeRounded, Settings02SolidRounded],
  },
  "/profile": { breadcrumb: [{ name: "Profile" }], isHiddenInSidebar: true },
};
export const getWebsitePageData = (pathname: string, params: Params) => {
  const exactMatch = websitePagesWithStaticPaths[pathname]!;
  if (exactMatch) return exactMatch;
  const segments = pathname.split("/").slice(1);
  let data: WebsitePage | null = null;
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
      //not showing the assignment page but allowing the user to navigate to the subject page
      data.breadcrumb.push(null);
    }
    return data;
  }
  if (segments[0] === "schedule") {
    return websitePagesWithStaticPaths["/schedule"]!;
  }
  return null;
};
export const VISIBLE_DATE_FORMAT = "MM/DD/YYYY";
export const VISIBLE_TIME_FORMAT = "h:mm A";
