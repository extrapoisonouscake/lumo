import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="p-4">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="bottom-center" />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
