"use client";
import { Button } from "@/components/ui/button";
import "@/views/globals.css";
import { RefreshStrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { GeistSans } from "geist/font/sans";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body className={GeistSans.className}>
        <main className="size-full flex flex-col justify-center gap-4 items-center">
          <img
            src="/app-store-app-icon.png"
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
            <p className="text-center text-xs text-muted-foreground">
              Error: {error.message}
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
