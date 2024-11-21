import { isKnownSchool } from "@/constants/schools";
import { getAnnouncements } from "@/parsing/ta/getAnnouncements";
import { cookies } from "next/headers";
import { AnnouncementsAccordions } from "./accordions";

export async function Announcements() {
  const school = cookies().get("schoolId")?.value;
  if (!school || !isKnownSchool(school)) return null;
  const data = await getAnnouncements(school);
  return (
    <div className="flex flex-col gap-4">
      <h3>Announcements</h3>
      <AnnouncementsAccordions data={data} />
    </div>
  );
}
