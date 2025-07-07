"use client";
import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { timezonedDayJS } from "@/instances/dayjs";
import { SubjectYear, TermEntry } from "@/types/school";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSkeleton,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
export function TermSelects({
  terms,
  initialYear = "current",
  initialTerm = "",
  shouldShowAllOption = true,
  shouldShowYearSelect = true,
}: {
  terms: TermEntry[];
  initialYear?: SubjectYear;
  initialTerm?: string;
  shouldShowYearSelect?: boolean;
  shouldShowAllOption?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [year, setYear] = useState(initialYear);
  const [term, setTerm] = useState(initialTerm);
  const date = timezonedDayJS();
  const currentYear = date.year();
  const isSecondYear = date.month() < 6;
  const secondYear = isSecondYear ? currentYear : currentYear - 1;
  const shouldShowTermSelect = terms.length > 0;
  useEffect(() => {
    setTerm(initialTerm);

    setYear(initialYear);
  }, [initialTerm, initialYear]);
  if (!shouldShowTermSelect && !shouldShowYearSelect) return null;
  return (
    <>
      {shouldShowYearSelect && (
        <div className="flex flex-col gap-2">
          <Label>Year</Label>
          <Select
            value={year}
            onValueChange={(value) => {
              setYear(value as SubjectYear);
              const params = new URLSearchParams(searchParams);

              params.set("year", value);
              if (term) {
                setTerm("");
                params.delete("term");
              }
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a year..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous">
                {secondYear - 2} - {secondYear - 1}
              </SelectItem>
              <SelectItem value="current">
                {secondYear - 1} - {secondYear}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {shouldShowTermSelect && (
        <div className="flex flex-col gap-2">
          <Label>Term</Label>
          <Select
            value={term}
            onValueChange={(value) => {
              setTerm(value);
              const params = new URLSearchParams(searchParams);
              params.set("term", value);
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <SelectTrigger>
              {term &&
              (terms.some((t) => t.id === term) ||
                term === MYED_ALL_GRADE_TERMS_SELECTOR) ? (
                <SelectValue placeholder="Select a term..." />
              ) : (
                "Current"
              )}
            </SelectTrigger>
            <SelectContent>
              {shouldShowAllOption && <SelectItem value="all">All</SelectItem>}
              {terms.map((term) => (
                <SelectItem key={term.id} value={term.id}>
                  {term.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
export function TermSelectsSkeleton({
  shouldShowYearSelect = true,
}: {
  shouldShowYearSelect?: boolean;
}) {
  return (
    <>
      {shouldShowYearSelect && (
        <div className="flex flex-col gap-2">
          <Label>Year</Label>
          <SelectSkeleton value="2020 - 2020" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label>Term</Label>
        <SelectSkeleton value="Current" />
      </div>
    </>
  );
}
