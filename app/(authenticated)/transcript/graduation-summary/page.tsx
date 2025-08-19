import { PageHeading } from "@/components/layout/page-heading";
import { Metadata } from "next";
import { GraduationSummaryContent } from "./content";

export const metadata: Metadata = {
  title: "Graduation Summary",
};
export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading />
      <GraduationSummaryContent />
    </div>
  );
}
