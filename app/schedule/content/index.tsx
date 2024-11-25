import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dayjs } from "@/instances/dayjs";
import { fetchMyEd, sessionExpiredIndicator } from "@/parsing/myed/fetchMyEd";
import { MyEdEndpointsParams } from "@/types/myed";
import { ComponentProps } from "react";
import { ScheduleTable } from "./table";

export async function ScheduleContent({ day }: { day: string | undefined }) {
  const params: MyEdEndpointsParams<"schedule"> = {};
  if (day) {
    params.day = dayjs(day, "MM-DD-YYYY").format("DD/MM/YYYY");
  }
  const data = await fetchMyEd("schedule", params);
  if (data === sessionExpiredIndicator)
    return <ReloginWrapper skeleton={<ScheduleContentSkeleton day={day} />} />;
  if (!data) return <ErrorCard />;
  if ("knownError" in data) {
    //! refactor, separate reusable component??
    return (
      <Card className="p-3">
        <p className="text-sm">{data.knownError}</p>
      </Card>
    );
  }

  return (
    <>
      {data && dayjs(day).day() === 5 && (
        <h3>
          Shortened day schedule:{" "}
          <span className="font-semibold">{data.weekday}</span>
        </h3>
      )}
      <ScheduleTable
        data={data.subjects}
        isToday={dayjs().isSame(day, "date")}
      />
    </>
  );
}
export function ScheduleContentSkeleton({
  day,
}: ComponentProps<typeof ScheduleContent>) {
  return (
    <>
      {dayjs(day).day() === 5 && (
        <div className="flex items-center gap-2">
          <h3>Shortened day schedule:</h3>
          <Skeleton>
            <span className="font-semibold">Friday</span>
          </Skeleton>
        </div>
      )}

      <ScheduleTable isLoading />
    </>
  );
}
