import { PageHeading } from "@/components/layout/page-heading";
import { Suspense } from "react";
import {
  Announcements,
  AnnouncementsSkeleton,
} from "./_components/announcements";
export default async function Home() {
  return (
    <>
      <PageHeading />
      <div className="">
        <Suspense fallback={<AnnouncementsSkeleton />}>
          <Announcements />
        </Suspense>
      </div>
    </>
  );
}
