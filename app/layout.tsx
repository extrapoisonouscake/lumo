import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { WEBSITE_TITLE } from "@/constants/website";
import { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
export const metadata:Metadata={
  title:{
    default:WEBSITE_TITLE,
    template:`%s | ${WEBSITE_TITLE}`
  }
}
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="flex justify-center min-h-full">
          <Providers>
            <Toaster/>
            <AppSidebarWrapper>{children}</AppSidebarWrapper>
          </Providers>
        </body>
      </html>
    </>
  );
}
