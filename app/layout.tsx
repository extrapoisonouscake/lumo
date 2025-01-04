import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "./providers";
import { Metadata } from "next";
import { WEBSITE_TITLE } from "@/constants/website";
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
            <Toaster position="bottom-center" />
            <AppSidebarWrapper>{children}</AppSidebarWrapper>
          </Providers>
        </body>
      </html>
    </>
  );
}
