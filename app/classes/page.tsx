import { ErrorCard } from "@/components/misc/error-card";
import { fetchMyEd } from "@/parsing/fetchMyEd";
import { SubjectsTable } from "./subjects-table";

export default async function Page() {
  const subjects = await fetchMyEd("subjects");
  if (!subjects) return <ErrorCard />;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold">Classes</h2>
        <SubjectsTable data={subjects.main} />
      </div>
      {subjects.teacherAdvisory && (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">TA</h3>
          <SubjectsTable data={[subjects.teacherAdvisory]} />
        </div>
      )}
    </div>
  );
}
