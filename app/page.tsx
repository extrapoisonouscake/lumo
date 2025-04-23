"use client";
import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { Announcements } from "./_components/announcements";
export default function Home() {
  return (
    <PageDataProvider>
      <PageHeading />

      <Announcements />
    </PageDataProvider>
  );
}
