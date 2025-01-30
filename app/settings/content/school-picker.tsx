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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ImageWithPlaceholder } from "@/components/ui/ImageWithPlaceholder";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { KnownSchools } from "@/constants/schools";
import { cn } from "@/helpers/cn";
import { useFormValidation } from "@/hooks/use-form-validation";
import { setUserSetting } from "@/lib/settings/mutations";
import { UserSetting } from "@/types/core";
import { defaultFilter } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
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
type FormFields = z.infer<typeof schema>;
const schoolsVisualData: Record<KnownSchools | "other", SchoolVisualData> = {
  [KnownSchools.MarkIsfeld]: {
    name: "Mark R. Isfeld Secondary",
    logo: "mark-r-isfeld-secondary",
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
  const form = useFormValidation(schema, {
    values: { school: initialValue === "" ? "other" : initialValue || "" },
  });

  const onSubmit = async ({ school }: FormFields) => {
    setIsOpen(false);

    await setUserSetting("schoolId", school as KnownSchools | "other");
  };
  const [isMounted, setIsMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const watchedValues = form.watch(["school"]);
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }
    formRef.current?.requestSubmit();
  }, [...watchedValues]);
  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="school"
          render={({ field, formState }) => {
            let buttonContent = <>Click to select...</>;
            if (field.value) {
              const schoolData = schoolsVisualDataArray.find(
                (school) => school.id === field.value
              );
              if (schoolData) {
                buttonContent = (
                  <SchoolName logo={schoolData.logo}>
                    {schoolData.name}
                  </SchoolName>
                );
              }
            }
            return (
              <FormItem className="flex flex-col">
                <FormLabel
                  htmlFor={"schoolId" satisfies UserSetting}
                  className="text-sm"
                >
                  School
                </FormLabel>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      shouldShowChildrenOnLoading
                      isLoading={formState.isSubmitting}
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
                    <Command
                      filter={(value, search, keywords) => {
                        if (
                          value === "other" &&
                          !schoolsVisualDataArray.some(
                            ({ name, id }) =>
                              defaultCmdkFilter(id, search, [name]) > 0
                          )
                        )
                          return 1;
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
                                form.setValue("school", id);
                                setIsOpen(false);
                              }}
                            >
                              <SchoolName logo={logo}>{name}</SchoolName>
                              <Check
                                className={cn(
                                  "ml-auto",
                                  field.value === id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select your school for easy access to daily announcements.
                </FormDescription>
              </FormItem>
            );
          }}
        />
      </form>
    </FormProvider>
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
          alt={`${name} logo`}
          src={`/schools_logos/${logo}.png`}
        />
      )}
    </div>
  );
}
