import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { Metadata } from "next";
import ProfileContent from "./content";
export const metadata: Metadata = {
  title: "Profile",
};
export default function Profile() {
  return (
    <div className="flex flex-col gap-4">
      <PageDataProvider>
        <PageHeading />
      </PageDataProvider>
      <ProfileContent />
    </div>
  );
}
