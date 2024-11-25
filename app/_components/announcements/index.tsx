import { Card } from "@/components/ui/card";
import { isKnownSchool } from "@/constants/schools";
import { getAnnouncements } from "@/parsing/ta/getAnnouncements";
import { MegaphoneOff } from "lucide-react";
import { cookies } from "next/headers";
import { AnnouncementsAccordions } from "./accordions";
import {AppleEmoji} from "@/components/misc/apple-emoji"
export async function Announcements() {
  const school = cookies().get("schoolId")?.value;
  if (!school || !isKnownSchool(school)) return null;
  const data = await getAnnouncements(school);
  if (!data)
    return (
      <div className="w-full flex justify-center">
        <Card className="w-full max-w-[450px] p-3 gap-1">
          <AppleEmoji
        value="💨"
        textClassName="text-3xl leading-8"
        imageClassName="size-[30px]"
      />
          <p className="text-muted-foreground text-sm">
            No announcements for today.
          </p>
        </Card>
      </div>
    );
  return (
    <div className="flex flex-col gap-4">
      <h3>Announcements</h3>
      <AnnouncementsAccordions data={data} />
    </div>
  );
}
