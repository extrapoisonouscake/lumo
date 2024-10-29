import { LogOut } from "@/components/layout/log-out";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="p-4">
          <Providers>
            <Toaster position="bottom-center" />
            <LogOut />
            {children}
          </Providers>
        </body>
      </html>
    </>
  );
}
