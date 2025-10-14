"use client";
import {
  BreadcrumbDataItem,
  getWebsitePageData,
  WebsitePage,
  websitePagesWithStaticPaths,
} from "@/constants/website";
import { createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";

import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
import { Settings02StrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logo } from "../misc/logo";
import { BackButton } from "../ui/back-button";
import { Button } from "../ui/button";
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
  dynamicContent,
  className,
  shouldShowBackButton = true,
}: {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  dynamicContent?: React.ReactNode;
  className?: string;
  shouldShowBackButton?: boolean;
}) {
  const isMobile = useIsMobile();

  return (
    <div className={cn("flex justify-between gap-4 items-start", className)}>
      {leftContent ?? (isMobile ? dynamicContent : null) ?? (
        <DefaultLeftContent shouldShowBackButton={shouldShowBackButton} />
      )}

      <div className="w-fit flex gap-2.5 items-center">
        {rightContent ?? (!isMobile ? dynamicContent : null)}
        <div className="w-fit flex sm:hidden gap-3 items-center">
          <Link to="/settings">
            <Button
              variant="ghost"
              size="smallIcon"
              className="w-fit hover:bg-transparent"
            >
              <HugeiconsIcon icon={Settings02StrokeRounded} />
            </Button>
          </Link>
          <ThemeToggle isInSidebar={false} shouldShowText={false} />

          <UserHeader className="w-fit" />
        </div>
      </div>
    </div>
  );
}
function DefaultLeftContent({
  shouldShowBackButton = true,
}: {
  shouldShowBackButton?: boolean;
}) {
  const { pathname } = useLocation();
  const hasBackButton = !websitePagesWithStaticPaths[pathname];
  return (
    <div className="flex items-center gap-2.5 h-full">
      <SidebarTrigger />
      {hasBackButton ? (
        shouldShowBackButton && <BackButton className="h-full" />
      ) : (
        <Link to="/">
          <Logo className="sm:hidden size-7 text-brand" />
        </Link>
      )}
    </div>
  );
}
