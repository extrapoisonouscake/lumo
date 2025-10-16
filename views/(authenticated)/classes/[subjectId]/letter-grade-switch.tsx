import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useDebouncedUpdateGenericUserSetting } from "@/hooks/trpc/use-debounced-update-generic-user-setting";
import LetterA from "@/public/assets/icons/letter-a.svg";
import { PercentStrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";

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
  const updateUserSettingMutation = useDebouncedUpdateGenericUserSetting(
    "shouldShowLetterGrade"
  );

  async function handleValueChange(newValue: string) {
    const newIsLetterGradeToggled = newValue === "on";
    onValueChange?.(newIsLetterGradeToggled);
    updateUserSettingState("shouldShowLetterGrade", newIsLetterGradeToggled);
    updateUserSettingMutation.mutateAsync(newIsLetterGradeToggled);
  }

  return (
    <ToggleGroup
      type="single"
      className="bg-muted rounded-lg p-1 gap-0"
      value={value ? "on" : "off"}
      onValueChange={handleValueChange}
    >
      <StyledToggleGroupItem value="off" aria-label="Toggle off">
        <HugeiconsIcon icon={PercentStrokeRounded} className="size-4" />
      </StyledToggleGroupItem>
      <StyledToggleGroupItem value="on" aria-label="Toggle on">
        <LetterA />
      </StyledToggleGroupItem>
    </ToggleGroup>
  );
}
