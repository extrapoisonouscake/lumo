import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { Metadata } from "next";
import { SettingsContent } from "./content";
export const metadata: Metadata = {
  title: "Settings",
};
export default function Page() {
  return (
    <PageDataProvider>
      <PageHeading />
      <div className="flex flex-col gap-4">
        <SettingsContent />
      </div>
    </PageDataProvider>
  );
}
