import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import {LogOutButton} from "./log-out-button"
import { SettingsContent } from ".";
export const metadata: Metadata = {
  title: "Settings",
};
export default function Page() {
  return (
    <PageDataProvider>
      <PageHeading />

      <div className="flex flex-col gap-4">
        <SettingsContent />
        <LogOutButton />
      </div>
    </PageDataProvider>
  );
}

