import { PageHeading } from "@/components/layout/page-heading";
import { Metadata } from "next";
export const metadata:Metadata={
  title:"Profile"
}
export default function Profile() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading />
    </div>
  );
}
