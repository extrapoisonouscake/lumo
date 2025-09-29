import { MYED_DATE_FORMAT } from "@/constants/myed";
import { timezonedDayJS } from "@/instances/dayjs";
import { createCaller } from "@/lib/trpc";
import { createTRPCContext } from "@/lib/trpc/context";
import { addBreaksToSchedule } from "@/views/(authenticated)/schedule/[[...slug]]/loadable-section/helpers";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("schedule");
  console.log(cookies().then((r) => console.log(r.getAll())));
  const context = await createTRPCContext();
  const caller = createCaller(context);
  //do we need refresh on every call
  await caller.myed.auth.ensureValidSession();
  const newContext = await createTRPCContext();
  //cookies are updated
  console.log(
    "new",
    cookies().then((r) => console.log(r.getAll()))
  );
  const newCaller = createCaller(newContext);
  const schedule = await newCaller.myed.schedule.getSchedule({
    day: timezonedDayJS().add(1, "day").format(MYED_DATE_FORMAT),
  });
  if ("knownError" in schedule) {
    return NextResponse.json(
      {
        error: schedule.knownError,
      },
      { status: 400 }
    );
  }
  const rows = addBreaksToSchedule(schedule.subjects);

  return NextResponse.json(rows);
}
