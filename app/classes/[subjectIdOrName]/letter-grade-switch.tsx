import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updateUserSetting } from "@/lib/helpers/client";
import { Percent, Type } from "lucide-react";
function StyledToggleGroupItem({
  ...props
}: React.ComponentProps<typeof ToggleGroupItem>) {
  return (
    <ToggleGroupItem
      size="sm"
      className="bg-transparent hover:bg-transparent data-[state=on]:bg-background"
      {...props}
    />
  );
}
export function LetterGradeSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange?: (value: boolean) => void;
}) {
  async function handleValueChange(value: string) {
    const newIsLetterGradeToggled = value === "on";
    onValueChange?.(newIsLetterGradeToggled);
    await updateUserSetting({
      key: "shouldShowLetterGrade",
      value: newIsLetterGradeToggled,
    });
  }
  return (
    <ToggleGroup
      type="single"
      className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 gap-0"
      value={value ? "on" : "off"}
      onValueChange={handleValueChange}
    >
      <StyledToggleGroupItem value="off" aria-label="Toggle off">
        <Percent />
      </StyledToggleGroupItem>
      <StyledToggleGroupItem value="on" aria-label="Toggle on">
        <Type />
      </StyledToggleGroupItem>
    </ToggleGroup>
  );
}
