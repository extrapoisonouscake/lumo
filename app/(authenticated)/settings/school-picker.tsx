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
import { ImageWithPlaceholder } from "@/components/ui/ImageWithPlaceholder";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { KnownSchools } from "@/constants/schools";
import { cn } from "@/helpers/cn";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "@/app/trpc";
import { useUpdateGenericUserSetting } from "@/hooks/trpc/use-update-generic-user-setting";
import { defaultFilter } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
const defaultCmdkFilter = defaultFilter as NonNullable<typeof defaultFilter>;
interface SchoolVisualData {
  name: string;
  logo?: string;
}
const schema = z.object({
  school: z
    .enum(["other", ...(Object.values(KnownSchools) as string[])])
    .optional(),
});
const schoolsVisualData: Record<KnownSchools | "other", SchoolVisualData> = {
  [KnownSchools.MarkIsfeld]: {
    name: "Mark R. Isfeld",
    logo: "mark-r-isfeld-secondary",
  },
  [KnownSchools.GPVanier]: {
    name: "GP Vanier",
    logo: "gp-vanier-secondary",
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
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (initialValue !== value) {
      setValue(initialValue);
    }
  }, [initialValue]);
  const updateUserSettingMutation = useUpdateGenericUserSetting();
  const queryClient = useQueryClient();
  const onSubmit = async (newValue: string) => {
    setIsOpen(false);
    updateUserSettingState("schoolId", newValue as KnownSchools | "other");

    queryClient.removeQueries({
      queryKey: trpc.core.schoolSpecific.getAnnouncements.queryKey(),
    });
    await updateUserSettingMutation.mutateAsync({
      key: "schoolId",
      value: newValue as KnownSchools | "other",
    });
  };

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
      <Label className="text-sm font-normal">School</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn("justify-between max-w-[300px] font-normal", {
              "text-muted-foreground": !value,
            })}
          >
            {buttonContent}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-[300px] p-0">
          <Command
            filter={(value, search, keywords) => {
              if (value === "other") return 0.1;
              return defaultCmdkFilter(value, search, keywords);
            }}
          >
            <CommandInput placeholder="Start typing..." />
            <CommandList>
              <CommandEmpty>No school found.</CommandEmpty>
              <CommandGroup>
                {schoolsVisualDataArray.map(({ id, name, logo }) => (
                  <CommandItem
                    keywords={[name]}
                    key={id}
                    value={id}
                    onSelect={() => {
                      onSubmit(id);
                      setValue(id);
                      setIsOpen(false);
                    }}
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
      <p className="text-sm text-muted-foreground">
        Select your school for easy access to daily announcements.
      </p>
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
      <p className="text-ellipsis whitespace-nowrap overflow-hidden">{name}</p>
      {logo && (
        <ImageWithPlaceholder
          width={20}
          height={20}
          className="max-h-[20px]"
          alt={`${name} logo`}
          src={`/schools_logos/${logo}.png`}
        />
      )}
    </div>
  );
}
