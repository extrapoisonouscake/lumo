import { TermSelect, TermSelectSkeleton } from "@/components/misc/term-select";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";
import { SubjectsTable } from "./table";
export function SubjectsPage({
  response,
  year,
  term,
}: {
  response?: MyEdEndpointResponse<"subjects">;
  year?: string;
  term?: string;
}) {
  return (
    <>
      {response ? (
        <TermSelect
          terms={response.terms}
          initialYear={year}
          initialTerm={term}
        />
      ) : (
        <TermSelectSkeleton />
      )}
      <SubjectsTable data={response?.subjects.main} isLoading={!response} />

      {response?.subjects.teacherAdvisory && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Teacher Advisory</h3>
          <SubjectsTable
            shownColumns={["room", "teachers"]}
            data={[response.subjects.teacherAdvisory]}
          />
        </div>
      )}
    </>
  );
}
