"use client";
import {
  BreadcrumbDataItem,
  getWebsitePageData,
  WebsitePage,
  websitePagesWithStaticPaths,
} from "@/constants/website";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";

import { cn } from "@/helpers/cn";
import { BackButton } from "../ui/back-button";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "./theme-toggle";
import { UserHeader } from "./user-header";
const PageDataContext = createContext<{
  pageData: WebsitePage | null;
  setPageData: (pageData: WebsitePage) => void;
}>({
  pageData: null,
  setPageData: () => {},
});
export function PageDataProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const params = useParams();
  const [pageData, setPageData] = useState<WebsitePage | null>(null);
  useEffect(() => {
    setPageData(getWebsitePageData(pathname, params));
  }, [pathname, params]);
  return (
    <PageDataContext.Provider value={{ pageData, setPageData }}>
      {children}
    </PageDataContext.Provider>
  );
}
export const usePageData = () => {
  const context = useContext(PageDataContext);
  if (!context) {
    throw new Error("usePageData must be used within a PageDataProvider");
  }
  const setBreadcrumbItem = (index: number, item: BreadcrumbDataItem) => {
    const { pageData, setPageData } = context;
    if (!pageData) return;
    setPageData({
      ...pageData,
      breadcrumb: [
        ...pageData.breadcrumb.slice(0, index),
        item,
        ...pageData.breadcrumb.slice(index + 1),
      ],
    });
  };
  const addBreadcrumbItem = (item: BreadcrumbDataItem) => {
    const { pageData, setPageData } = context;
    if (!pageData) return;
    setPageData({
      ...pageData,
      breadcrumb: [...pageData.breadcrumb, item],
    });
  };
  return { ...context, setBreadcrumbItem, addBreadcrumbItem };
};

export function PageHeading({
  leftContent,
  rightContent,
  className,
}: {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between gap-4 items-start", className)}>
      {leftContent ?? <DefaultLeftContent />}

      <div className="w-fit flex gap-2.5 items-center">
        {rightContent}
        <div className="w-fit flex sm:hidden gap-3 items-center">
          <ThemeToggle isInSidebar={false} shouldShowText={false} />

          <UserHeader className="w-fit" />
        </div>
      </div>
    </div>
  );
}
function DefaultLeftContent() {
  const { pathname } = useLocation();
  const hasBackButton = !websitePagesWithStaticPaths[pathname];
  return (
    <div
      className={cn("flex items-center gap-2.5 h-fit", {
        "h-full": hasBackButton,
      })}
    >
      <SidebarTrigger />
      {hasBackButton && <BackButton className="h-full" />}
    </div>
  );
}
