import { getMyEd } from "@/parsing/myed/getMyEd";
import { Metadata } from "next";
import { SubjectsPage } from "./content";
export const metadata: Metadata = {
  title: "Classes",
};
export interface TermSearchParams {
  year?: string;
  term?: string;
}
export default async function Page({
  searchParams: { year, term },
}: {
  searchParams: TermSearchParams;
}) {
  const response = await getMyEd("subjects", {
    isPreviousYear: year === "previous",
    termId: term,
  });
  return <SubjectsPage response={response} year={year} term={term} />;
}
