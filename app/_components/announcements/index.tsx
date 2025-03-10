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
import { redis } from "@/instances/redis";
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
  } else if ([0, 6].includes(date.day())) {
    content = (
      <AnnouncementsNotAvailableCard
        reason={AnnouncementsNotAvailableReason.NotAWeekday}
      />
    );
  } else {
    const redisKey = getAnnouncementsRedisKey(schoolId);

    const pdfLinkHashKey = getAnnouncementsPDFLinkRedisHashKey(new Date());
    let data: AnnouncementSection[] = [];
    let cachedData;
    [cachedData, pdfLink] = await Promise.all([
      `[{"heading":"Today","emoji":"✨","items":["Jnr girls Soccer - tryouts will be on the VV fields at 3:30 today.","Gr 9/10 girls basketball – please return your uniforms asap to Room 205.","Pizza sales – pizza at the canteen at lunch. $3/slice, or 2 for $5.","Environment Club – meeting today in Room 201 at lunch. Everyone welcome to join at any time.","Sports Leadership - there is no Sports Leadership meeting today.","3 vs 3 Basketball Intramurals - this is the last week to sign up. Sign up outside of the PE office. Teams and schedule will be made Friday and games will start after Spring Break on Tuesday, April 1st.","Robotics71 - HUGE CONGRATULATIONS to Zane R., Connor G., Ira Turner, Liam B., Sebastian G., and Laurien B. on winning the Island Regional Championships in Robotics. Their respective teams became the 2025 Island Champions in an alliance this past weekend and have qualified to compete in the World Championships in Dallas, Texas in May!","Gr 11/12 Vaccination clinic – there will be a nurse here at Isfeld today through Thursday from 11:30-1pm in the MPR. Gr 11s & 12s are welcome to drop in to see the nurse and get any vaccinations that they have missed (HPV included). The nurse will have a record of your vaccinations if you are unsure.","Explore Program – reminder that applications are due tomorrow, March 11. You can hand them in to our office and they will be sent to Vanier on time.","NIC FAIR - Thursday, March 13th. High School exclusive event --- 12:30 – 2:30 pm.","Educators are invited to bring grades 10, 11 or 12 students to participate in a North Island College campus tour, check out our labs, see a demo, complete a passport to win prizes and browse the Info Fair. Any students or teachers wishing to attend, please see Ms. Buckle by the end of day Tuesday, March 11. Transportation to and from NIC is available but needs to be booked ASAP! Thanks!","TASTY TUESDAY - reminder that you can purchase fries, poutine and chicken strips tomorrow in the main entrance foyer at lunch to support your Isfeld MTB Team. Go ICE!!","All international students are invited for a pizza lunch on Tuesday at 11:55 in the MPR. We are taking group photos for yearbook so please be prompt.","Germany Exchange - there will be a short mandatory meeting for all students participating in the Germany cultural exchange next year in Room 405 at lunch this Wednesday. See you all there!","Curious about what Model UN is? – come to an information meeting on Wednesday March 12 & April 11 in the Library at lunch. Perfect for new members or anyone just wondering about what it is. Free Timbits for those who attend the full session.","Congratulations to all the Isfeld Model UN members who attended NMUN at Dover Bay this weekend. Outstanding debate and diplomacy by all. Special recognition to Tristan Rodriguez who won Best Delegate in his committee.","CVSMUN registration is open! www.cvsmun.com. Beginner, Intermediate, and Advanced committees available. Conference is Thursday, May 1. Info session Wednesday at lunch!","Model UN meeting Tuesday at lunch in the library- new members welcome!","Grads! We are missing 169 Grad quotes. You can help find the missing grad quotes by submitting yours! Deadline is Friday March 14. Send to IsfeldGradComment@sd71.bc.ca or to larry.green@sd71.bc.ca.","Any Grads interested in winning a 10 Punch Pass to the Academy of Martial Arts in Courtenay for any of their classes (Jiu-Jitsu, Kickboxing, martial arts, wrestling), please come to the office to enter your name in the draw."]},{"heading":"Meetings & Practices","emoji":"🧩","table":[["Time","Event","Place","Reason"],["","JorGics s","W o","= ="],["[","12 Vo","","T in"],["ch","","[ )",""],["L","[","oo 201","k"]]},{"heading":"Re-runs","emoji":"📆","items":["UBC Technology courses – want to explore a career in technology? UBC is offering pre-university technology courses online or on campus designed to give students a head start in some of today’s fastest growing technology fields. Go here for more information.","3 vs. 3 Basketball Intramurals is going to starts Tuesday, April 1st (after Spring Break). This will be a structured league, so you need to sign up with a partner or individually. Games will run every Tuesday, Wednesday and Thursday and if you cannot fully commit, you can join the 'Spare' list and fill in for missing players. The signup is outside of the PE office and you MUST sign up before Thursday, March 13th.","UBC Summer Science Program for Indigenous students – UBC is hosting a 1 week cultural, health and science program in the Fall for Gr 9-12 students. It's a great opportunity for youth to meet their peers and connect with Elders and Indigenous student staff. Students stay in first year dorms and participate in cultural and health/STEM- related workshops throughout the week. Visit here for more information (link is live on our website announcements section).","NIC Fest - NIC Fest is an annual fun community event with aims to showcase North Island College’s programs and services. From 2-5pm there will be drop-in tours of the campus, open classrooms, interactive sessions, giveaways, an info fair, and more. Dates for the 3 campuses are: Port Alberni March 5, Campbell River March 11, and Comox Valley March 13th.","NIC Parent and Supporter Information Night: Join us on campus for a session designed for those supporting high school students in planning their post-secondary education and training. You’ll learn about NIC programs, University transfer pathways, financial aid and awards, student housing and more. March 13 at 5:30-7pm at the Stan Hagen Theatre at NIC Comox. Registration is not required but arrive early to secure your seat.","For questions or more information email futurestudents@nic.bc.ca . Looking forward to seeing you on campus!","For grade 8s only– are you interested in logic and problem solving, or just math in general? Every year, the University of Waterloo organizes internationally recognized math contests. If you would like to write the contest this year or would just like more information, please sign up with Mr. Nelson in room 303 before Friday, April 5th."]},{"heading":"Career Centre","emoji":"💼","items":["Healthcare field opportunity - the Step Up Youth Program is an Island-wide program that offers Vancouver Island youth aged 15 to 18 the opportunity to volunteer at select Island Health hospitals and long-term care homes. From September to April each year, Step Up Youth volunteers provide social engagement support to patients and residents during after-school shifts at local healthcare facilities. The program introduces and promotes Island Health’s C.A.R.E. values and fosters responsibility, compassion, and leadership development. Volunteers enrich the experience of patients and residents through the gift of time, empathy, and companionship. Volunteers also participate in a virtual monthly Guest Speaker series and are eligible to apply for Scholarships and Bursaries offered by Island Health. Visit www.islandhealth.ca/stepupyouth or email stepupyouth@islandhealth.ca","Interested in becoming an RMT (Registered Massage Therapist)? – There will be a Zoom info session run by the Okanagan Valley College of Massage Therapy on April 2 10:45-noon. Check out the info poster on the board outside the Careers office.","How about a career in the Mineral Resource Industry? – If you have a passion for the Earth, technology or the outdoors, mining might be for you. Online info session on April 10 from 9:20-10:35. More info on the Careers office board.","Students wanting to take EMR (Emergency Medical Responder) course next year, please come to the Careers office for the registration form.","Volunteers are needed for restoration and research activities with Project Watershed. If you are interested in volunteering with us, please fill out the volunteer form below or contact us at info@projectwatershed.ca. projectwatershed.ca","Calling all grade 11’s who might be interested in doing a Dual credit course(s) or program in your grade 12 year, we are now accepting applications for 2025 -2026 school year. Please come to the Careers office for information.","Attention any students in grades 10-12 who are interested in getting into the Trades, we have two programs that are perfect for you. STEP and the Trade Samplers. Please come to the Career’s office and find out more."]},{"heading":"Grads","emoji":"🧑‍🎓","items":["Hey GRADS! Remember those Grad quotes/comments that Mr. Green started asking you to think about in Grade 8? Well they are due on Friday, March 14, the last day before March Break. Send them to IsfeldGradComment@sd71.bc.ca or larry.green@sd71.bc.ca.","IsfeldGradComment@sd71.bc.ca or larry.green@sd71.bc.ca.","The Grad Attire program welcomes all Gr 12 students in Comox Valley Schools to have the opportunity to wear a gown or suit on graduation day without the financial burden of purchasing a brand-new outfit for their milestone event. The Grad Attire program will operate out of Comox Valley Dodge at 278 North Island Highway (Old Canadian Tire building) on the following Saturdays from 10:00am-3:00pm: Apr 12th and May 10th. You can book a fitting appt using the following https://www.comoxvalleyschools.ca/grad-attire-program/"]}]`,

      redis.hget(pdfLinkHashKey, schoolId) as Promise<string | null>,
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
    emoji: "📭",
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
