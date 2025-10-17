import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { getGradeInfo } from "@/helpers/grades";
import {
  Subject,
  SubjectGrade,
  SubjectSummary,
  SubjectTerm,
} from "@/types/school";

import { CircularProgress } from "@/components/misc/circular-progress";
import { subjectTermToGradeLabelsMap } from "@/constants/myed";
import { cn } from "@/helpers/cn";
import {
  Award01StrokeRounded,
  Award04StrokeRounded,
  StarAward01StrokeRounded,
  Tick02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo,ReactNode } from "react";
import { SubjectSummaryButton } from "./subject-summary-button";

export function SubjectTermAverages({
  id,
  term,
  academics,
}: {
  id: Subject["id"];
  term: SubjectSummary["term"];
  academics: SubjectSummary["academics"];
}) {
  return (
    <>
      <ResponsiveDialog>
        <ResponsiveDialogTrigger asChild>
          <SubjectSummaryButton
            icon={StarAward01StrokeRounded}
            className="border-r-1"
          >
            Averages
          </SubjectSummaryButton>
        </ResponsiveDialogTrigger>
        <ResponsiveDialogContent className="pb-0">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Averages</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="pb-0 flex flex-col gap-3">
            <Content id={id} term={term} academics={academics} />
          </ResponsiveDialogBody>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

function Content({
  id,
  term,
  academics,
}: {
  id: SubjectSummary["id"];
  term: SubjectSummary["term"];
  academics: SubjectSummary["academics"];
}) {
  // Merge running and posted grades, prioritizing posted
  const mergedGrades = useMemo(() => {
    const terms: Record<
      string,
      { grade: SubjectGrade | null; isPosted: boolean }
    > = Object.fromEntries(
      subjectTermToGradeLabelsMap[term].map((term) => [
        term,
        { grade: null, isPosted: false },
      ])
    );
    const { running, posted } = academics;
    const allKeys = new Set([...Object.keys(posted), ...Object.keys(running)]);

    const semesters: Record<
      string,
      { grade: SubjectGrade | null; isPosted: boolean }
    > = {
      S1: { grade: null, isPosted: false },
      S2: { grade: null, isPosted: false },
    };

    allKeys.forEach((key) => {
      const postedGrade = posted[key];
      const runningGrade = running[key];

      const grade = postedGrade ?? runningGrade;
      const isPosted = typeof postedGrade === "object";
      if (grade && key !== "overall") {
        const item = { grade, isPosted };
        if (key.startsWith("Q")) {
          terms[key] = item;
        } else if (key.startsWith("S")) {
          semesters[key] = item;
        }
      }
    });

    return {
      terms: Object.entries(terms).map(([term, item]) => ({ term, ...item })),
      semesters: Object.entries(semesters).map(([term, item]) => ({
        term,
        ...item,
      })),
    };
  }, [academics]);

  // Filter categories to show only non-null entries
  const filteredCategories = useMemo(() => {
    return academics.categories
      .map((category) => ({
        ...category,
        terms: category.terms.filter((term) => term.average !== null),
      }))
      .filter(
        (category) => category.average !== null || category.terms.length > 0
      );
  }, [academics.categories]);

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex flex-col gap-3">
        {/* Terms Section */}
        {mergedGrades.terms.length > 0 && (
          <div className="grid grid-cols-2 auto-rows-[1fr] gap-3">
            {mergedGrades.terms.map((props) => (
              <TermGradeCard key={props.term} {...props} />
            ))}
          </div>
        )}

        {/* Semesters Section */}
        {term === SubjectTerm.FullYear && mergedGrades.semesters.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {mergedGrades.semesters.map((props) => (
              <SemesterGradeCard key={props.term} {...props} />
            ))}
          </div>
        )}
      </div>

      {/* Categories Performance Section */}
      {filteredCategories.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Award01StrokeRounded}
              className="size-4 text-muted-foreground"
            />
            <h3 className="font-semibold text-sm">Performance by Category</h3>
          </div>
          <div className="flex flex-col gap-3">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TermGradeCard({
  term,
  grade,
  isPosted,
}: {
  term: string;
  grade: SubjectGrade | null;
  isPosted: boolean;
}) {
  const gradeInfo = grade ? getGradeInfo(grade) : null;

  return (
    <Card className="p-3 flex flex-col gap-1.5 justify-between">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{term}</span>
        {grade && (
          <CircularProgress
            values={[
              {
                value: grade?.mark ?? 0,
                fillColor: gradeInfo?.color ?? "zinc-200",
              },
            ]}
            letter={gradeInfo?.letter}
            size="normal"
          />
        )}
      </div>
      <div className="flex justify-between gap-2 w-full items-end">
        <div className="flex items-baseline gap-1 text-sm text-muted-foreground">
          <span className={cn({ "text-2xl font-bold text-primary": grade })}>
            {grade?.mark ?? "–"}
          </span>

          <span className="text-sm">/ 100</span>
        </div>

        {isPosted && (
          <HugeiconsIcon
            icon={Tick02StrokeRounded}
            className="size-5 text-green-500 self-end"
          />
        )}
      </div>
    </Card>
  );
}

function SemesterGradeCard({
  term,
  grade,
  isPosted,
}: {
  term: string;
  grade: SubjectGrade | null;
  isPosted: boolean;
}) {
  const gradeInfo = grade ? getGradeInfo(grade) : null;

  return (
    <Card className="p-2 flex-row justify-between items-center">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-sm">{term}</span>{" "}
        {isPosted && (
          <HugeiconsIcon
            icon={Tick02StrokeRounded}
            className="size-4 text-green-500"
          />
        )}
      </div>
      <div className="flex gap-1.5 items-center">
        {grade && (
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold">{grade.mark}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        )}
        <CircularProgress
          values={[
            {
              value: grade?.mark ?? 0,
              fillColor: gradeInfo?.color ?? "zinc-200",
            },
          ]}
          letter={gradeInfo?.letter ?? "–"}
          size="normal"
        />
      </div>
    </Card>
  );
}

function CategoryCard({
  category,
}: {
  category: SubjectSummary["academics"]["categories"][number];
}) {
const isSameWeight = new Set(category.terms.map(term=>term.weight).filter(Boolean)).size === 1
  return (
    <Card className="gap-3">
      {/* Category Header */}
      <div className="p-4 pb-0 flex items-start justify-between gap-2">
        
          <div className="flex items-center gap-1.5"><span className="font-medium text-sm">{category.name}</span>
      {isSameWeight&&<WeightBadge>{category.terms[0]!.weight}%</WeightBadge>}
  </div>
        {category.average && (
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold">{category.average.mark}</span>
            <span className="text-xs text-muted-foreground">Overall</span>
          </div>
        )}
      </div>

      {/* Category Terms */}

      {category.terms.length > 0 && (
        <div className="flex flex-col">
          {category.terms.map((term, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-t px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {term.name}
                </span>
                {term.weight !== null&&!isSameWeight && (
                  <WeightBadge>
                    {term.weight}%
                  </WeightBadge>
                )}
              </div>
              {term.average && (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold">
                    {term.average.mark}
                  </span>
                  {term.average.letter && (
                    <span className="text-xs text-muted-foreground">
                      ({term.average.letter})
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
function WeightBadge({children}:{children:ReactNode}){
return    <Badge variant="outline" className="text-xs h-5 px-1.5">
{children}</Badge>
}