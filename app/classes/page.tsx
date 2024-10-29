import { ErrorCard } from "@/components/misc/error-card";
import { fetchMyEd } from "@/parsing/fetchMyEd";
import { SubjectsTable } from "./subjects-table";

export default async function Page() {
  const subjects = await fetchMyEd("subjects");
  if (!subjects) return <ErrorCard />;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold">Grades</h2>
      <SubjectsTable data={subjects} />
    </div>
  );
}
