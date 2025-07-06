import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 w-fit text-sm hover:opacity-70 transition-opacity"
    >
      <ChevronLeft className="w-4 h-4" />
      Back
    </Link>
  );
}
