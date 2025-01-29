import { ErrorCard } from "@/components/misc/error-card";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Metadata } from "next";
import { SubjectsPage } from "./content";
export const metadata: Metadata = {
  title: "Classes",
};
export default async function Page() {
  const subjects = await getMyEd("subjects");
  if (!subjects) return <ErrorCard />;
  return <SubjectsPage data={subjects} />;
}
