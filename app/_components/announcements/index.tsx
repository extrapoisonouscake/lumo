import { ErrorCard } from "@/components/misc/error-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { isKnownSchool } from "@/constants/schools";
import { getUserSettings } from "@/lib/settings/queries";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { isGuestMode } from "@/helpers/auth-statuses";
import { timezonedDayJS } from "@/instances/dayjs";
import {
  getAnnouncementsPDFLinkRedisHashKey,
  getAnnouncementsRedisKey,
} from "@/parsing/announcements/getAnnouncements";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { AnnouncementSection } from "@/types/school";
import { ArrowUpRightIcon } from "lucide-react";
import { AnnouncementsAccordions } from "./accordions";
function AnnouncementsHeading() {
  return <h3 className="text-sm">Announcements</h3>;
}
export async function Announcements() {
  const date = timezonedDayJS();
  if ([0, 6].includes(date.day())) {
    return (
      <AnnouncementsNotAvailableCard
        reason={AnnouncementsNotAvailableReason.NotAWeekday}
      />
    );
  }
  const { schoolId } = await getUserSettings();
  let content, pdfLink;
  if (!schoolId) {
    content = (
      <AnnouncementsNotAvailableCard
        reason={AnnouncementsNotAvailableReason.SchoolNotSelected}
      />
    );
  } else if (!isKnownSchool(schoolId)) {
    content = (
      <AnnouncementsNotAvailableCard
        reason={AnnouncementsNotAvailableReason.SchoolNotAvailable}
      />
    );
  } else {
    const redisKey = getAnnouncementsRedisKey(schoolId);

    const pdfLinkHashKey = getAnnouncementsPDFLinkRedisHashKey(new Date());
    let data: AnnouncementSection[] = [];
    let cachedData;
    [cachedData, pdfLink] = await Promise.all([
      `[{"heading":"Today","emoji":"✨","items":["Grade 5, Grade 5s  – today is your day to enter your courses in MyEd for next year. Everyone should have theirs entered by the end of today. Once saved, please hand your form in to the office front counter.","Interact Club – meeting today in Room 510 at lunch.","Choir – No choir today.","Gr 10-12 Handball Intramurals – happening today at lunch.","Queer and Allies Club (QAC) – (another new location) meeting today at lunch in Room 300. New members always welcome.","Boys Rugby – practice today after school on the lower Isfeld field.","Any students taking English 10 or English 12 online and have not signed up for the Literacy Assessment in April, come to the office and sign up with Lisa.","Snr Girls Soccer – practice today after school. Please meet in the gym near the weight room before we go outside.","Interested in becoming an RMT (Registered Massage Therapist)? – There will be a Zoom info session run by the Okanagan Valley College of Massage Therapy on April 2 10:45-noon. Check out the info poster on the board outside the Careers office.","How about a career in the Mineral Resource Industry? – If you have a passion for the Earth, technology or the outdoors, mining might be for you. Online info session on April 10 from 9:20-10:35. More info on the Careers office board."]},{"heading":"Meetings & Practices","emoji":"🧩","table":[["Time","Event","Place","Reason"],["","Queer and Allies Club (QAC)","",""],["","","Gym",""]]},{"heading":"Re-runs","emoji":"📆","items":["Gr. 12s --- REMINDER that BURSARY Applications are due on FRIDAY, MARCH 7th by 3PM!!! Don’t mis out on your chance at FREE $$$$!!!!!","Did you sign up to write the NIC Math contest (gr 8-12)? See you in Room 103 at the beginning of FLEX on Friday March 7th from 1:45 to 2:30pm to write it. (Or you can arrange to write it with your math teacher). Past contest practice: https://mathcontest.trubox.ca/ (link is live on our website under announcements).","Want to study abroad? – there will be a Study and Go Abroad Fair in Vancouver on March 9 1-5pm. Go here for more information.","UBC Technology courses – want to explore a career in technology? UBC is offering pre-university technology courses online or on campus designed to give students a head start in some of today’s fastest growing technology fields. Go here for more information.","3 vs. 3 Basketball Intramurals is going to starts Tuesday, April 1st (after Spring Break). This will be a structured league, so you need to sign up with a partner or individually. Games will run every Tuesday, Wednesday and","Thursday and if you cannot fully commit, you can join the 'Spare' list and fill in for missing players. The signup is outside of the PE office and you MUST sign up before Thursday, March 13th.","UBC Summer Science Program for Indigenous students – UBC is hosting a 1 week cultural, health and science program in the Fall for Gr 9-12 students. It's a great opportunity for youth to meet their peers and connect with Elders and Indigenous student staff. Students stay in first year dorms and participate in cultural and health/STEM- related workshops throughout the week. Visit here for more information (link is live on our website announcements section).","Looking for student Basketball coaches for the grade 4/5 Thunderball Basketball program starting in April at Isfeld. Please see Mr. Tobacca in the gym or let a PE teacher know if you would like to help out.","Food Bank Bottle Drive – this week there will be a bottle drive running to help raise money for our local food bank. There will be boxes in the front foyer to drop off bottles. This is a good way to contribute if you are looking for a way to give back to your community. If you are unable to bring anything from home, it still helps to recycle your own drink bottles and cans in our school’s designated bins around the building as well as the front foyer.","NIC Fest - NIC Fest is an annual fun community event with aims to showcase North Island College’s programs and services. From 2-5pm there will be drop-in tours of the campus, open classrooms, interactive sessions, giveaways, an info fair, and more. Dates for the 3 campuses are: Port Alberni March 5, Campbell River March 11, and Comox Valley March 13th.","NIC Parent and Supporter Information Night: Join us on campus for a session designed for those supporting high school students in planning their post-secondary education and training. You’ll learn about NIC programs, University transfer pathways, financial aid and awards, student housing and more. March 13 at 5:30-7pm at the Stan Hagen Theatre at NIC Comox. Registration is not required but arrive early to secure your seat.","For questions or more information email futurestudents@nic.bc.ca . Looking forward to seeing you on campus!","For grade 8s only– are you interested in logic and problem solving, or just math in general? Every year, the University of Waterloo organizes internationally recognized math contests. If you would like to write the contest this year or would just like more information, please sign up with Mr. Nelson in room 303 before Friday, April 5th."]},{"heading":"Career Centre","emoji":"💼","items":["Student wanting to take EMR (Emergency Medical Responder) course next year, please come to the Careers office for the registration form.","Volunteers are needed for restoration and research activities with Project Watershed. If you are interested in volunteering with us, please fill out the volunteer form below or contact us at info@projectwatershed.ca. projectwatershed.ca","Calling all grade 11’s who might be interested in doing a Dual credit course(s) or program in your grade 12 year, we are now accepting applications for 2025 -2026 school year. Please come to the Careers office for information.","Attention any students in grades 10-12 who are interested in getting into the Trades, we have two programs that are perfect for you. STEP and the Trade Samplers. Please come to the Career’s office and find out more."]},{"heading":"Bursaries & Scholarships","emoji":"💵","items":["Bursaries & Scholarships – Gr 12s, the program is now open! Check the Grad tab on our website for all the info and links. Applications are due March 7 at 3pm, late applications will not be accepted. Bursary application assistance will be available during Flex on Fridays in Student Services."]},{"heading":"Grads","emoji":"🧑‍🎓","items":["Gr. 12s --- REMINDER that BURSARY Applications are due on FRIDAY, MARCH 7th by 3PM!!! Don't mis out on your chance at FREE $$$$!!!!!","Hey GRADS! Remember those Grad quotes/comments that Mr. Green started asking you to think about in Grade 8? Well they are due on Friday, March 14, the last day before March Break. Send them to IsfeldGradComment@sd71.bc.ca or larry.green@sd71.bc.ca.","The Grad Attire program welcomes all Gr 12 students in Comox Valley Schools to have the opportunity to wear a gown or suit on graduation day without the financial burden of purchasing a brand-new outfit for their milestone event. The Grad Attire program will operate out of Comox Valley Dodge at 278 North Island Highway (Old Canadian Tire building) on the following Saturdays from 10:00am-3:00pm: March 8th, April 12th and May 10th. You can book a fitting appt using the following https://www.comoxvalleyschools.ca/grad-attire-program/"]}]`,

      "",
    ]);
    let studentGrade;
    if (cachedData) {
      const parsedData =
        process.env.NODE_ENV === "development"
          ? JSON.parse(cachedData as string)
          : cachedData;
      data = parsedData;
      const isGuest = isGuestMode();
      if (!isGuest) {
        const personalDetails = await getMyEd("personalDetails");
        studentGrade = personalDetails?.grade;
      }
    }

    content =
      data.length > 0 ? (
        <AnnouncementsAccordions
          pdfURL={pdfLink ?? null}
          data={data}
          studentGrade={studentGrade}
        />
      ) : (
        <AnnouncementsNotAvailableCard
          reason={AnnouncementsNotAvailableReason.NoAnnouncements}
        />
      );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <AnnouncementsHeading />
        {!!pdfLink && (
          <Link href={pdfLink} target="_blank">
            <Button size="icon" variant="ghost" className="size-7">
              <ArrowUpRightIcon />
            </Button>
          </Link>
        )}
      </div>
      {content}
    </div>
  );
}
export function AnnouncementsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <AnnouncementsHeading />
        <Skeleton>
          <Button size="icon" className="size-7" />
        </Skeleton>
      </div>
      {[...Array(3)].map((_, i) => (
        <Accordion type="multiple">
          <AccordionItem value={`${i}`} className="pointer-events-none">
            <AccordionTrigger>
              <Skeleton>wowowowo</Skeleton>
            </AccordionTrigger>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}
enum AnnouncementsNotAvailableReason {
  SchoolNotSelected,
  SchoolNotAvailable,
  NoAnnouncements,
  NotAWeekday,
}
const reasonToVisualData = {
  [AnnouncementsNotAvailableReason.SchoolNotSelected]: {
    emoji: "🏫",
    message: (
      <>
        <Link variant="underline" href="/settings">
          Select your school
        </Link>{" "}
        to view daily announcements.
      </>
    ),
  },
  [AnnouncementsNotAvailableReason.SchoolNotAvailable]: {
    emoji: "😔",
    message: "Your school is not supported yet.",
  },
  [AnnouncementsNotAvailableReason.NoAnnouncements]: {
    emoji: "⏳",
    message: "No announcements for today yet.",
  },
  [AnnouncementsNotAvailableReason.NotAWeekday]: {
    emoji: "🌞",
    message: "No announcements for today.",
  },
};
export function AnnouncementsNotAvailableCard({
  reason,
}: {
  reason: AnnouncementsNotAvailableReason;
}) {
  const { emoji, message } = reasonToVisualData[reason];
  return <ErrorCard emoji={emoji}>{message}</ErrorCard>;
}
