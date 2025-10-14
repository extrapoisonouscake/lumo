import { Alert02SolidRounded } from "@hugeicons-pro/core-solid-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "./alert";
export function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <Alert variant="destructive">
      <HugeiconsIcon
        icon={Alert02SolidRounded}
        className="size-4 min-w-4 text-red-500!"
      />
      <AlertDescription className="text-red-500">{children}</AlertDescription>
    </Alert>
  );
}
