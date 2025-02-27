import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "./alert";

export function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <Alert variant="destructive">
      <TriangleAlert className="size-4 min-w-4 !text-red-500" />
      <AlertDescription className="text-red-500">{children}</AlertDescription>
    </Alert>
  );
}
