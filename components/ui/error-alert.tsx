import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

export function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <Alert variant="destructive">
      <TriangleAlert className="size-4 !text-red-500" />
      <AlertTitle className="text-red-500">Error</AlertTitle>
      <AlertDescription className="text-red-500">{children}</AlertDescription>
    </Alert>
  );
}
