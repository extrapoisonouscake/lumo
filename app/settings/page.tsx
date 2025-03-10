import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { Metadata } from "next";
import { Suspense } from "react";
import { SettingsContent } from "./content";
export const metadata: Metadata = {
  title: "Schedule",
};
export default function Page() {
  return (
    <PageDataProvider>
      <PageHeading />
      <div className="flex flex-col gap-4">
        <Suspense>
          <SettingsContent />
        </Suspense>
      </div>
    </PageDataProvider>
  );
}
