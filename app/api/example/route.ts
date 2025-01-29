import { knownSchoolsIDs } from "@/constants/schools";
import { checkSchoolAnnouncementsTask } from "@/trigger/parse-announcements";
import { tasks } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";

export async function GET() {
  await tasks.batchTrigger<typeof checkSchoolAnnouncementsTask>(
    "check-school-announcements",

    knownSchoolsIDs.map((id) => ({ payload: { school: id } }))
  );
  return NextResponse.json({ message: "Hello, world!" });
}
