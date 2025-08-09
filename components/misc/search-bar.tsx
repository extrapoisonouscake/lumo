import { Input, InputProps } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export function SearchBar(props: InputProps) {
  return (
    <Input
      type="search"
      placeholder="Search"
      leftIcon={<SearchIcon />}
      {...props}
    />
  );
}
