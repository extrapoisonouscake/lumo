import { Card } from "@/components/ui/card";
import dayjs from "@/instances/dayjs";
import { MyEdEndpointResponse } from "@/parsing/fetchMyEd";
import { ScheduleTable } from "./schedule-table";

export function SchedulePage({
  data,
}: {
  data?: NonNullable<MyEdEndpointResponse<"schedule">>;
}) {
  if (data && "knownError" in data) {
    //! refactor, separate reusable component??
    return (
      <Card>
        <p>{data.knownError}</p>
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {data && dayjs().day() === 5 && (
        <h3>
          Today's schedule is <span className="text-bold">{data.weekday}</span>
        </h3>
      )}
      <ScheduleTable data={data?.subjects} isLoading={!data} />
    </div>
  );
}
