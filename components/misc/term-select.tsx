"use client";
import { timezonedDayJS } from "@/instances/dayjs";
import { Term } from "@/types/school";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSkeleton,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
export function TermSelect({
  terms,
  initialYear,
  initialTerm,
  shouldShowAllOption = true,
  shouldShowYearSelect = true,
}: {
  terms: Term[];
  initialYear?: string;
  initialTerm?: string;
  shouldShowYearSelect?: boolean;
  shouldShowAllOption?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [year, setYear] = useState(initialYear || "current");
  const [term, setTerm] = useState(initialTerm);
  const date = timezonedDayJS();
  const currentYear = date.year();
  const isSecondYear = date.month() < 6;
  const secondYear = isSecondYear ? currentYear : currentYear - 1;
  const shouldShowTermSelect = terms.length > 0;
  if (!shouldShowTermSelect && !shouldShowYearSelect) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {shouldShowYearSelect && (
        <div className="flex flex-col gap-2">
          <Label>Year</Label>
          <Select
            value={year}
            onValueChange={(value) => {
              setYear(value);
              const params = new URLSearchParams(searchParams);

              params.set("year", value);
              if (term) {
                setTerm(undefined);
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
              {term && terms.some((t) => t.id === term) ? (
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
    </div>
  );
}
export function TermSelectSkeleton({
  shouldShowYearSelect = true,
}: {
  shouldShowYearSelect?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {shouldShowYearSelect && (
        <div className="flex flex-col gap-2">
          <Label>Year</Label>
          <SelectSkeleton />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label>Term</Label>
        <SelectSkeleton />
      </div>
    </div>
  );
}
