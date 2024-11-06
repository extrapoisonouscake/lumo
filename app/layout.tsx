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
        <body className="flex justify-center min-h-full">
          <Providers>
            <Toaster position="bottom-center" />
            <main className="p-4 flex flex-col gap-4 items-start">
              <LogOut />
              {children}
            </main>
          </Providers>
        </body>
      </html>
    </>
  );
}
