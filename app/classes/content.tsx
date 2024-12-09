import { MyEdEndpointResponse } from "@/parsing/myed/fetchMyEd";
import { SubjectsTable } from "./table";
export function SubjectsPage({
  data,
}: {
  data?: MyEdEndpointResponse<"subjects">;
}) {
  return (
    <>
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
    </>
  );
}
