import { PageHeading } from "@/components/layout/page-heading";
import { Announcements } from "./_components/announcements";
export default async function Home() {
  return (
    <>
      <PageHeading />
      <div className="">
        <Announcements />
      </div>
    </>
  );
}
