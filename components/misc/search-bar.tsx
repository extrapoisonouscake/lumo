import { Input, InputProps } from "@/components/ui/input";
import { Search01StrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";

export function SearchBar(props: InputProps) {
  return (
    <Input
      type="search"
      placeholder="Search"
      leftIcon={<HugeiconsIcon icon={Search01StrokeRounded} />}
      {...props}
    />
  );
}
