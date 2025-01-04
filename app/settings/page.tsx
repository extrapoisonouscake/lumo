import { PageHeading } from "@/components/layout/page-heading";
import { SCHOOL_COOKIE_NAME } from "@/constants/cookies";
import { cookies } from "next/headers";
import { SchoolPicker } from "./school-picker";
import { Metadata } from "next";
export const metadata:Metadata={
  title:"Schedule"
}
export default function Page() {
  const school = cookies().get(SCHOOL_COOKIE_NAME)?.value;
  return (
    <>
      <PageHeading />
      <div className="flex flex-col gap-4">
        <SchoolPicker initialValue={school} />
      </div>
    </>
  );
}
