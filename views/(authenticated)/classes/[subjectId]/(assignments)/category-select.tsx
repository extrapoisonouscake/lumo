import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSkeleton,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubjectSummary } from "@/types/school";
import { usePathname, useSearchParams } from "next/navigation";

export function CategorySelect({
  categories,
  shouldShowAllOption = true,
  value,
  onChange,
}: {
  categories: SubjectSummary["academics"]["categories"];
  shouldShowAllOption?: boolean;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      <Label>Category</Label>
      <Select
        value={value}
        onValueChange={(value) => {
          onChange(value);
          const params = new URLSearchParams(searchParams);
          if (value === "all") {
            params.delete("category");
          } else {
            params.set("category", value);
          }
          window.history.pushState({}, "", `${pathname}?${params.toString()}`);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category..." />
        </SelectTrigger>
        <SelectContent>
          {shouldShowAllOption && <SelectItem value="all">All</SelectItem>}
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function CategorySelectSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Label>Category</Label>
      <SelectSkeleton value="AllAll" />
    </div>
  );
}
