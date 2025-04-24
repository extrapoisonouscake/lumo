"use client";
import {
  BreadcrumbDataItem,
  getWebsitePageData,
  WebsitePage,
} from "@/constants/website";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStatus } from "../providers/auth-status-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";
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

export function PageHeading() {
  const { pageData } = usePageData();
  const { isLoggedIn, isGuest } = useAuthStatus();
  return (
    <div className="flex items-center gap-2">
      {(isLoggedIn || isGuest) && <SidebarTrigger />}
      <Separator orientation="vertical" className="mr-1 h-4" />

      {pageData ? (
        <Breadcrumb>
          <BreadcrumbList>
            {pageData.breadcrumb.map(({ href, name }, i) => {
              const isLast = i === pageData.breadcrumb.length - 1;
              return (
                <>
                  <BreadcrumbItem key={name}>
                    {isLast ? (
                      <BreadcrumbPage>{name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href ?? ""}>{name}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <Skeleton className="leading-none">Some Page</Skeleton>
      )}
    </div>
  );
}
