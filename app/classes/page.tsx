import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { fetchMyEd, sessionExpiredIndicator } from "@/parsing/fetchMyEd";
import SubjectsPageSkeleton from "./loading";
import { SubjectsPage } from "./subjects-page";
import { PageHeading } from "@/components/layout/page-heading";
export default async function Page() {
  const subjects = await fetchMyEd("subjects");
  if (subjects === sessionExpiredIndicator)
    return <ReloginWrapper skeleton={<SubjectsPageSkeleton />} />;
  if (!subjects) return <ErrorCard />;
  //@ts-ignore
  return <SubjectsPage data={subjects} />
}
