"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCHOOL_COOKIE_NAME } from "@/constants/cookies";
import { KnownSchools } from "@/constants/schools";
import { setSchool } from "@/lib/settings/mutations";
import Image from "next/image";
import { useState } from "react";
const schoolsVisualData: Record<KnownSchools, { name: string; logo: string }> =
  {
    [KnownSchools.MarkIsfeld]: {
      name: "Mark R. Isfeld Secondary School",
      logo: "mark-r-isfeld-secondary-school",
    },
  };
export function SchoolPicker({
  initialValue,
}: {
  initialValue: string | undefined;
}) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={SCHOOL_COOKIE_NAME} className="text-sm">
        School
      </label>
      <Select
        name={SCHOOL_COOKIE_NAME}
        defaultValue={initialValue === "" ? "other" : initialValue}
        onValueChange={async (newValue) => {
          setIsLoading(true);
          await setSchool(
            newValue === "other" ? undefined : (newValue as KnownSchools)
          );
          setIsLoading(false);
        }}
      >
        <SelectTrigger className="max-w-[300px]">
          <SelectValue placeholder="Click to select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(schoolsVisualData).map(([id, { name, logo }]) => (
              <SelectItem value={id} key={id}>
                <div className="flex items-center gap-2">
                  <p>{name}</p>
                  <Image
                    width={27}
                    height={27}
                    alt={`${name} logo`}
                    src={`/schools_logos/${logo}.png`}
                  />
                </div>
              </SelectItem>
            ))}
            <SelectItem value="other">Other</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
