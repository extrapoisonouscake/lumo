"use client";
import {
  BreadcrumbDataItem,
  getWebsitePageData,
  WebsitePage,
} from "@/constants/website";
import { useParams, usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

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
  const pathname = usePathname();
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
}: {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 items-center">
      {leftContent ?? <DefaultLeftContent />}

      <div className="w-fit flex gap-1 items-center">
        {rightContent}
        <div className="w-fit flex sm:hidden gap-1 items-center">
          <ThemeToggle isInSidebar={false} shouldShowText={false} />
          <UserHeader className="w-fit" />
        </div>
      </div>
    </div>
  );
}
function DefaultLeftContent() {
  return (
    <div>
      <SidebarTrigger className="hidden sm:flex" />
    </div>
  );
}
