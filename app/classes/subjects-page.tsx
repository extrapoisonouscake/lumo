import { MyEdEndpointResponse } from "@/parsing/fetchMyEd";
import { SubjectsTable } from "./subjects-table";

export function SubjectsPage({
  data,
}: {
  data?: MyEdEndpointResponse<"subjects">;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SubjectsTable data={data?.main} isLoading={!data} />

      {data?.teacherAdvisory && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm">TA</h3>
          <SubjectsTable
            shownColumns={["room", "teachers"]}
            data={[data.teacherAdvisory]}
          />
        </div>
      )}
    </div>
  );
}
