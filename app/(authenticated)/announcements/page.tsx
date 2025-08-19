import { PageHeading } from "@/components/layout/page-heading";
import { Metadata } from "next";
import { Announcements } from ".";
export const metadata: Metadata = {
  title: "Announcements",
};
export default function AnnouncementsPage() {
  return (
    <>
      <PageHeading />
      <Announcements />
    </>
  );
}
