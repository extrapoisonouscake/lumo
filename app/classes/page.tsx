import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { fetchMyEd, sessionExpiredIndicator } from "@/parsing/fetchMyEd";
import { SubjectsPage } from "./SubjectsPage";

export default async function Page() {
  const subjects = await fetchMyEd("subjects");
  if (subjects === sessionExpiredIndicator) return <ReloginWrapper />;
  if (!subjects) return <ErrorCard />;
  return <SubjectsPage data={subjects} />;
}
