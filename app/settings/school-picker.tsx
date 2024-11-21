"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SCHOOL_COOKIE_NAME } from "@/constants/cookies";
import { KnownSchools } from "@/constants/schools";
import { setSchool } from "@/lib/settings/mutations";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
interface SchoolVisualData {
  name: string;
  logo?: string;
}

const schoolsVisualData: Record<KnownSchools | "other", SchoolVisualData> = {
  [KnownSchools.MarkIsfeld]: {
    name: "Mark R. Isfeld Secondary School",
    logo: "mark-r-isfeld-secondary-school",
  },
  other: { name: "Other" },
};
const schoolsVisualDataArray = Object.entries(schoolsVisualData).map(
  ([id, { name, logo }]) => ({ id, name, logo })
);
export function SchoolPicker({
  initialValue,
}: {
  initialValue: string | undefined;
}) {
  const [value, setValue] = useState(
    initialValue === "" ? "other" : initialValue || ""
  );
  const saveValue = async (newValue: typeof value) => {
    setIsOpen(false);
    setValue(newValue);
    if (newValue === "" || newValue === value) return;
    setIsLoading(true);
    await setSchool(
      newValue === "other" ? undefined : (newValue as KnownSchools)
    );
    setIsLoading(false);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  let buttonContent = <>Click to select...</>;
  if (value) {
    const schoolData = schoolsVisualDataArray.find(
      (school) => school.id === value
    );
    if (schoolData) {
      buttonContent = (
        <SchoolName logo={schoolData.logo}>{schoolData.name}</SchoolName>
      );
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={SCHOOL_COOKIE_NAME} className="text-sm">
        School
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            isLoading={isLoading}
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="justify-between max-w-[300px]"
          >
            {buttonContent}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Start typing..." />
            <CommandList>
              <CommandEmpty>No school found.</CommandEmpty>
              <CommandGroup>
                {schoolsVisualDataArray.map(({ id, name, logo }) => (
                  <CommandItem
                    keywords={[name]}
                    key={id}
                    value={id}
                    onSelect={saveValue}
                  >
                    <SchoolName logo={logo}>{name}</SchoolName>
                    <Check
                      className={cn(
                        "ml-auto",
                        value === id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
function SchoolName({
  children: name,
  logo,
}: {
  children: SchoolVisualData["name"];
  logo: SchoolVisualData["logo"];
}) {
  return (
    <div className="flex items-center gap-[6px]">
      <p>{name}</p>
      {logo && (
        <Image
          width={20}
          height={20}
          alt={`${name} logo`}
          src={`/schools_logos/${logo}.png`}
        />
      )}
    </div>
  );
}
