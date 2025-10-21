"use client";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";
import {
  TermSelects,
  TermSelectsSkeleton,
} from "@/views/(authenticated)/classes/[subjectId]/term-selects";
import { DragDropProvider } from "@dnd-kit/react";
import { SubjectsTable } from "./table";

import { InlineSubjectEmoji } from "@/components/misc/apple-emoji/inline-subject-emoji";
import { TitleManager } from "@/components/misc/title-manager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useSubjectSummaries } from "@/hooks/trpc/use-subjects-summaries";
import { RouterOutput } from "@/lib/trpc/types";
import { SubjectSummary, SubjectYear } from "@/types/school";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { saveClientResponseToCache } from "@/helpers/cache";
import { cn } from "@/helpers/cn";
import { getSubjectPageURL } from "@/helpers/getSubjectPageURL";
import { getCacheKey } from "@/hooks/use-cached-query";
import { SubjectWithVisibility } from "@/lib/trpc/routes/myed/subjects";
import { queryClient, trpc } from "@/views/trpc";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import {
  DragDropVerticalStrokeRounded,
  Edit03StrokeRounded,
  Tick02StrokeRounded,
  ViewOffSlashStrokeRounded,
  ViewStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { ArrowRight01StrokeSharp } from "@hugeicons-pro/core-stroke-sharp";
import {
  ArrowDown01StrokeStandard,
  ArrowUp01StrokeStandard,
} from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { QueryKey, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Dispatch,
  LegacyRef,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router";

export default function SubjectsPage() {
  const searchParams = useSearchParams();
  const year = (searchParams.get("year") ?? "current") as SubjectYear;
  const term = searchParams.get("term") ?? undefined;
  const isPreviousYear = year === "previous";
  const query = useSubjectsData({
    isPreviousYear,
    termId: isPreviousYear && !term ? MYED_ALL_GRADE_TERMS_SELECTOR : term,
  });

  const subjectSummaries = useSubjectSummaries({
    ids: query.data?.subjects.main.map((subject) => subject.id),
    year: isPreviousYear ? "previous" : "current",
  });
  const currentTermIndex = useMemo(
    () =>
      Object.values(subjectSummaries.data)[0]?.currentTermIndex ?? undefined,
    [subjectSummaries.data]
  );
  return (
    <>
      <TitleManager>Classes</TitleManager>
      <QueryWrapper query={query} skeleton={<SubjectsPageSkeleton />}>
        {(response) => {
          return (
            <Content
              queryKey={query.queryKey}
              response={response}
              subjectSummaries={subjectSummaries.data}
              //*timewise
              currentTermIndex={currentTermIndex}
              year={year}
              term={term}
            />
          );
        }}
      </QueryWrapper>
    </>
  );
}
function SubjectsPageSkeleton() {
  return <Content year="current" />;
}

function Content({
  response,
  year,
  term,
  queryKey,
  currentTermIndex,
  subjectSummaries,
}: {
  response?: MyEdEndpointResponse<"subjects">;
  year: SubjectYear;
  queryKey?: QueryKey;
  term?: string;
  currentTermIndex?: number;
  subjectSummaries?: Record<string, SubjectSummary>;
}) {
  return (
    <div className="flex flex-col gap-2">
      {response ? (
        <LoadedContent
          currentTerm={term}
          year={year}
          queryKey={queryKey}
          response={response}
          currentTermIndex={currentTermIndex}
          subjectSummaries={subjectSummaries}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <TermSelectsSkeleton />
          </div>
          <SubjectsTable isLoading year={year} />
        </div>
      )}
      {response?.subjects.teacherAdvisory && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Teacher Advisory</h3>
          <SubjectsTable
            year={year}
            isLoading={false}
            shownColumns={["room", "teachers"]}
            data={[response.subjects.teacherAdvisory]}
          />
        </div>
      )}
    </div>
  );
}
function LoadedContent({
  year,
  response,
  subjectSummaries,
  currentTermIndex,
  currentTerm,
  queryKey,
}: {
  year: SubjectYear;
  response: RouterOutput["myed"]["subjects"]["getSubjects"];
  subjectSummaries?: Record<string, SubjectSummary>;
  currentTermIndex?: number;
  currentTerm?: string;
  queryKey?: QueryKey;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const [hiddenSubjects, setHiddenSubjects] = useState<string[]>(
    response.customization?.hiddenSubjects ?? []
  );
  const [mainSubjects, setMainSubjects] = useState<SubjectWithVisibility[]>(
    response.subjects.main
  );
  const filteredMainSubjects = useMemo(() => {
    return mainSubjects.filter(
      (subject) => !hiddenSubjects.includes(subject.id)
    );
  }, [mainSubjects, hiddenSubjects]);

  useEffect(() => {
    if (subjectSummaries) {
      setMainSubjects((prev) =>
        prev.map((subject) => {
          const summary = subjectSummaries[subject.id];
          if (!summary) return subject;
          return {
            ...subject,
            average:
              summary.academics.posted.overall ??
              summary.academics.running.overall,
          };
        })
      );
    }
  }, [subjectSummaries]);
  useEffect(() => {
    if (response.customization?.hiddenSubjects) {
      setHiddenSubjects(response.customization?.hiddenSubjects);
    }
  }, [response.customization?.hiddenSubjects]);
  const updateSubjectsCustomization = useMutation(
    trpc.myed.subjects.updateSubjectsCustomization.mutationOptions()
  );
  const onVisibilityChange = (subjectId: string) => (isHidden: boolean) => {
    setHiddenSubjects((prev) =>
      isHidden ? [...prev, subjectId] : prev.filter((id) => id !== subjectId)
    );
  };
  const onSave = () => {
    updateSubjectsCustomization.mutate({
      subjectsListOrder: mainSubjects.map((subject) => subject.id),
      hiddenSubjects,
    });
    if (queryKey) {
      const newSubjectsData = {
        ...response,
        subjects: {
          ...response.subjects,
          main: mainSubjects.map((subject) => {
            return {
              ...subject,
              isHidden: hiddenSubjects.includes(subject.id),
            };
          }),
        },
      };
      queryClient.setQueryData<RouterOutput["myed"]["subjects"]["getSubjects"]>(
        queryKey,
        newSubjectsData
      );

      saveClientResponseToCache(getCacheKey(queryKey), newSubjectsData);
    }
  };
  const [isHiddenSubjectsOpen, setIsHiddenSubjectsOpen] = useState(false);
  console.log(hiddenSubjects, mainSubjects);
  return (
    <div
      className={cn("flex flex-col gap-1.5", {
        "mb-2": isHiddenSubjectsOpen || hiddenSubjects.length === 0,
      })}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between flex-wrap gap-x-4 gap-y-2">
          <div className="flex flex-wrap gap-2">
            <TermSelects
              terms={response.terms}
              initialYear={year}
              initialTerm={
                currentTerm ??
                (typeof currentTermIndex === "number"
                  ? response.terms[currentTermIndex]!.id
                  : //when the term is not set and year is previous, automatically select all terms
                    "isDerivedAllTerms" in response || year === "previous"
                    ? MYED_ALL_GRADE_TERMS_SELECTOR
                    : undefined)
              }
            />
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            className="px-3 sm:px-4"
            onClick={() => {
              if (isEditing) {
                onSave();
              }
              setIsEditing(!isEditing);
              if (!isEditing) {
                setIsHiddenSubjectsOpen(true);
              }
            }}
          >
            <span className="hidden sm:block">
              {isEditing ? "Save" : "Edit"}
            </span>
            <HugeiconsIcon
              icon={isEditing ? Tick02StrokeRounded : Edit03StrokeRounded}
            />
          </Button>
        </div>
        {isEditing ? (
          <EditableSubjectsList
            subjects={filteredMainSubjects}
            setSubjects={setMainSubjects}
            hiddenSubjects={hiddenSubjects}
            onVisibilityChange={onVisibilityChange}
          />
        ) : (
          <SubjectsTable
            data={filteredMainSubjects}
            isLoading={false}
            year={year}
          />
        )}
      </div>
      {hiddenSubjects.length > 0 && (
        <Collapsible
          open={isHiddenSubjectsOpen}
          onOpenChange={setIsHiddenSubjectsOpen}
          className="flex flex-col gap-1"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => setIsHiddenSubjectsOpen(!isHiddenSubjectsOpen)}
              className={cn(
                "text-sm text-muted-foreground flex justify-center items-center w-full hover:bg-transparent font-normal gap-2",
                { "pointer-events-none": isEditing }
              )}
            >
              <HugeiconsIcon
                icon={ViewOffSlashStrokeRounded}
                className="size-4"
              />
              <span>
                {hiddenSubjects.length} hidden subject
                {hiddenSubjects.length > 1 ? "s" : ""}
              </span>
              {!isEditing && (
                <HugeiconsIcon
                  icon={
                    isHiddenSubjectsOpen
                      ? ArrowUp01StrokeStandard
                      : ArrowDown01StrokeStandard
                  }
                  className="size-4 text-muted-foreground"
                />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="flex flex-col gap-2">
            {hiddenSubjects
              .map((subjectId) =>
                mainSubjects.find((subject) => subject.id === subjectId)
              )
              .filter(Boolean)
              .map((subject) => (
                <EditingModeSubjectCard
                  {...subject!}
                  setIsHidden={
                    isEditing ? onVisibilityChange(subject!.id) : undefined
                  }
                  isClickable={!isEditing}
                  year={year}
                  isHidden={hiddenSubjects.includes(subject!.id)}
                  className="pr-4"
                />
              ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
function EditableSubjectsList({
  subjects,
  onVisibilityChange,
  hiddenSubjects,
  setSubjects,
}: {
  onVisibilityChange: (subjectId: string) => (isHidden: boolean) => void;
  subjects: SubjectWithVisibility[];
  hiddenSubjects: string[];
  setSubjects: Dispatch<SetStateAction<SubjectWithVisibility[]>>;
}) {
  //will rerender when isEditing is toggled
  const cachedSubjects = useMemo(() => subjects, []);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const { operation, canceled } = event;
        const { source, target } = operation;

        if (canceled) {
          return;
        }

        if (target && isSortable(source)) {
          const newIndex = source.sortable.index;
          const oldIndex = source.sortable.initialIndex;
          if (oldIndex !== newIndex) {
            setSubjects((prev) => arrayMove(prev, oldIndex, newIndex));
          }
        }
      }}
    >
      <ul className="flex flex-col gap-2">
        {cachedSubjects
          .filter((subject) => !hiddenSubjects.includes(subject.id))
          .map((subject, index) => (
            <DraggableSubjectCard
              {...subject}
              key={subject.id}
              index={index}
              setIsHidden={onVisibilityChange(subject.id)}
              isHidden={hiddenSubjects.includes(subject.id)}
            />
          ))}
      </ul>
    </DragDropProvider>
  );
}
function DraggableSubjectCard(
  props: SubjectWithVisibility & {
    index: number;
    setIsHidden: (isHidden: boolean) => void;
  }
) {
  const { ref, handleRef } = useSortable({ id: props.id, index: props.index });
  return <EditingModeSubjectCard {...props} ref={ref} handleRef={handleRef} />;
}

function EditingModeSubjectCard(
  subject: SubjectWithVisibility & {
    handleRef?: LegacyRef<SVGSVGElement>;
    ref?: LegacyRef<HTMLDivElement>;
    setIsHidden?: (isHidden: boolean) => void;
    className?: string;
    isClickable?: boolean;
    year?: SubjectYear;
  }
) {
  const {
    name,
    isHidden,
    handleRef,
    ref,
    setIsHidden,
    className,
    isClickable = false,
  } = subject;

  const content = (
    <Card
      ref={ref}
      className={cn(
        "flex-row justify-between pl-4 pr-2 py-3 items-center group",
        className,
        { clickable: isClickable }
      )}
      data-clickable-hover={isClickable}
    >
      <h3 className="font-medium text-base truncate">
        {name.prettified}

        {name.emoji && <InlineSubjectEmoji emoji={name.emoji} />}
      </h3>
      <div className="flex items-center gap-2.5">
        {setIsHidden && (
          <HugeiconsIcon
            icon={isHidden ? ViewStrokeRounded : ViewOffSlashStrokeRounded}
            onClick={() => {
              setIsHidden(!isHidden);
            }}
            className="text-muted-foreground clickable size-4 cursor-pointer hover:text-primary transition-colors"
          />
        )}
        {handleRef && (
          <HugeiconsIcon
            strokeWidth={3}
            data-auto-stroke-width
            icon={DragDropVerticalStrokeRounded}
            className="text-muted-foreground clickable size-5 hover:text-primary transition-colors"
            ref={handleRef}
          />
        )}
        {isClickable && (
          <HugeiconsIcon
            icon={ArrowRight01StrokeSharp}
            className="size-5 text-muted-foreground group-hover:text-foreground transition-colors"
          />
        )}
      </div>
    </Card>
  );
  if (subject.isClickable && subject.year) {
    return <Link to={getSubjectPageURL(subject.year)(subject)}>{content}</Link>;
  }
  return content;
}
