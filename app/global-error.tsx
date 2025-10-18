"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/helpers/cn";
import "@/views/globals.css";
import { RefreshStrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import * as Sentry from "@sentry/nextjs";
import { GeistSans } from "geist/font/sans";
import Error from "next/error";
import { useEffect } from "react";
export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html>
      <body className={cn(GeistSans.className, "bg-background")}>
        <main className="size-full flex flex-col justify-center gap-4 items-center">
          <img
            src="/assets/app-store-app-icon.png"
            alt="Lumo App Icon"
            className="size-14"
          />
          <div className="flex flex-col gap-2">
            <p className="text-center text-lg font-medium">
              An error occurred. Please try again.
            </p>
            <Button
              variant="outline"
              onClick={() => window && window.location.reload()}
            >
              <HugeiconsIcon icon={RefreshStrokeRounded} />
              Refresh
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
