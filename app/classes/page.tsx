import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { fetchMyEd } from "@/parsing/myed/fetchMyEd";
import { isSessionExpiredResponse } from "../../helpers/isSessionExpiredResponse";
import SubjectsPageSkeleton from "./loading";
import { SubjectsPage } from "./subjects-page";
export default async function Page() {
  const subjects = await fetchMyEd("subjects");
  if (isSessionExpiredResponse(subjects))
    return <ReloginWrapper skeleton={<SubjectsPageSkeleton />} />;
  if (!subjects) return <ErrorCard />;
  return <SubjectsPage data={subjects} />;
}
