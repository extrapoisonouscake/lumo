import { PageHeading } from "@/components/layout/page-heading";
import { Metadata } from "next";
import { CreditSummaryContent } from "./content";

export const metadata: Metadata = {
  title: "Credit Summary",
};
export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading />
      <CreditSummaryContent />
    </div>
  );
}
