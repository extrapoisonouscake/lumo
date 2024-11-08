import { MyEdEndpointResponse } from "@/parsing/fetchMyEd";
import { SubjectsPlainTable, SubjectsTable } from "./subjects-table";

export function SubjectsPage({
  data,
}: {
  data?: MyEdEndpointResponse<"subjects">;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold">Classes</h2>
        {data ? (
          <SubjectsTable data={data.main} />
        ) : (
          <SubjectsPlainTable isLoading />
        )}
      </div>
      {data?.teacherAdvisory && (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">TA</h3>
          <SubjectsTable
            shownColumns={["room", "teacher"]}
            data={[data.teacherAdvisory]}
          />
        </div>
      )}
    </div>
  );
}
