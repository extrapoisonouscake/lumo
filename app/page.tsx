import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { Suspense } from "react";
import {
  Announcements,
  AnnouncementsSkeleton,
} from "./_components/announcements";
export default async function Home() {
  return (
    <PageDataProvider>
      <PageHeading />
      <div className="">
        <Suspense fallback={<AnnouncementsSkeleton />}>
          <Announcements />
          <Announcements />
          <Announcements />
          <Announcements />
          <Announcements />
          <Announcements />
          <Announcements />
          <Announcements />
        </Suspense>
      </div>
    </PageDataProvider>
  );
}
