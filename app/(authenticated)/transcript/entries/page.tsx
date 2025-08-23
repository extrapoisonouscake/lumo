import { PageHeading } from "@/components/layout/page-heading";
import { Metadata } from "next";
import { TranscriptContent } from "./content";

export const metadata: Metadata = {
  title: "Transcript",
};
export default function TranscriptPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading />
      <TranscriptContent />
    </div>
  );
}
