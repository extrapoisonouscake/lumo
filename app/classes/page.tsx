import { ErrorCard } from "@/components/misc/error-card";
import { fetchMyEd } from "@/parsing/myed/fetchMyEd";
import { SubjectsPage } from "./content";
import { Metadata } from "next";
export const metadata:Metadata={
  title:"Classes"
}
export default async function Page() {
  const subjects = await fetchMyEd("subjects");
  if (!subjects) return <ErrorCard />;
  return <SubjectsPage data={subjects} />;
}
