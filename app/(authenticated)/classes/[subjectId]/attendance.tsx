import { trpc } from "@/app/trpc";
import { ErrorCard } from "@/components/misc/error-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { VISIBLE_DATE_FORMAT } from "@/constants/website";
import { rgbToHsl } from "@/helpers/stringToColor";
import { timezonedDayJS } from "@/instances/dayjs";
import { RichSubjectAttendance, Subject, SubjectSummary } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ListX } from "lucide-react";
const UPPERCASE_REGEX = /(?=[A-Z])/;

export function SubjectAttendance({
  id,
  year,
}: {
  id: Subject["id"];
  year: SubjectSummary["year"];
}) {
  return (
    <>
      <ResponsiveDialog>
        <ResponsiveDialogTrigger asChild>
          <Button
            variant="outline"
            className="h-8 rounded-lg"
            size="sm"
            leftIcon={<ListX />}
          >
            Attendance
          </Button>
        </ResponsiveDialogTrigger>
        <ResponsiveDialogContent className="pb-0">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Absences</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="pb-0">
            <Content id={id} year={year} />
          </ResponsiveDialogBody>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
function Content({
  id,
  year,
}: {
  id: SubjectSummary["id"];
  year: SubjectSummary["year"];
}) {
  const query = useQuery(
    trpc.myed.subjects.getSubjectAttendance.queryOptions({
      subjectId: id,
      year,
    })
  );
  return (
    <QueryWrapper
      query={query}
      onError={<ErrorCard className="mb-6" />}
      skeleton={<ContentSkeleton />}
    >
      {(data) =>
        data.length > 0 ? (
          <div className="flex flex-col gap-3 overflow-y-auto rounded-t-lg pb-6">
            {data.map((absence, index) => (
              <AbsenceCard key={index} {...absence} />
            ))}
          </div>
        ) : (
          <ErrorCard className="mb-6" variant="ghost" emoji="✨">
            You haven't missed any classes.
          </ErrorCard>
        )
      }
    </QueryWrapper>
  );
}
function ContentSkeleton() {
  return (
    <div className="pb-6 flex flex-col gap-3">
      <AbsenceCardSkeleton />
      <AbsenceCardSkeleton />
    </div>
  );
}
const excusedKeywords = [
  "illness",
  "trip",
  "auth",
  "medical",
  "doctor",
  "appointment",
  "sick",
  "parent",
  "guardian",
];
const unexcusedKeywords = ["unexcused", "truant", "skip", "miss"];
function generateReasonColor(reason: string) {
  const lowerReason = reason.toLowerCase();

  // Known keywords that should override generated colors

  // Check for excused keywords (green)
  if (excusedKeywords.some((keyword) => lowerReason.includes(keyword))) {
    return "142, 75%, 36%"; // Green
  }

  // Check for unexcused keywords (red)
  if (unexcusedKeywords.some((keyword) => lowerReason.includes(keyword))) {
    return "var(--destructive)"; // Red
  }

  // Fall back to generated color for unknown keywords
  let hash = 0;
  for (let i = 0; i < reason.length; i++) {
    hash = reason.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate RGB values
  const r = (hash >> 16) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = hash & 0xff;

  // Convert to HSL
  const [h, s, l] = rgbToHsl(r, g, b);

  // Adjust hue to avoid red (0-30, 330-360), green (90-150), and yellow (45-75)
  let adjustedH = h;
  if ((h >= 0 && h <= 30) || (h >= 330 && h <= 360)) {
    // Red zone - shift to blue-purple
    adjustedH = 240 + (h % 30);
  } else if (h >= 90 && h <= 150) {
    // Green zone - shift to blue
    adjustedH = 200 + (h % 30);
  } else if (h >= 45 && h <= 75) {
    // Yellow zone - shift to orange
    adjustedH = 25 + (h % 15);
  }

  const resultHsl = `${adjustedH}, ${Math.min(s + 20, 100)}%, ${Math.min(
    l + 20,
    70
  )}%`;

  return resultHsl;
}

function AbsenceCard({ date, reason, code }: RichSubjectAttendance[number]) {
  const color = reason ? generateReasonColor(reason) : null;
  return (
    <Card className="p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-4 text-muted-foreground" />
            <h3 className="font-medium text-base">
              {timezonedDayJS(date).format(VISIBLE_DATE_FORMAT)}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-sm">Code</p>
              <p className="font-medium text-sm">
                {code || NULL_VALUE_DISPLAY_FALLBACK}
              </p>
            </div>
          </div>
        </div>

        {reason ? (
          <Badge
            className="flex-shrink-0 border-0"
            style={{
              backgroundColor: `hsla(${color}, 0.15)`,
              color: `hsl(${color})`,
            }}
          >
            {reason.split(UPPERCASE_REGEX).join(" ")}
          </Badge>
        ) : (
          <Badge className="flex-shrink-0 bg-red-500/15 text-red-500">
            Unexcused
          </Badge>
        )}
      </div>
    </Card>
  );
}

function AbsenceCardSkeleton() {
  return (
    <Card className="p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-4 text-muted-foreground" />
            <Skeleton>
              <h3 className="font-medium text-base">00/00/0000</h3>
            </Skeleton>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div className="flex flex-col gap-1 items-start">
              <Skeleton>
                <p className="text-muted-foreground text-sm">Code</p>
              </Skeleton>
              <Skeleton>
                <p className="font-medium text-sm">A-C AUTH</p>
              </Skeleton>
            </div>
          </div>
        </div>

        <Skeleton>
          <Badge
            variant="secondary"
            className="flex-shrink-0 bg-destructive/15 text-destructive"
          >
            Reason
          </Badge>
        </Skeleton>
      </div>
    </Card>
  );
}
