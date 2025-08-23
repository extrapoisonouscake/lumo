import { PageHeading } from "@/components/layout/page-heading";
import { websitePagesWithStaticPaths } from "@/constants/website";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading />
      <ul className="flex flex-col">
        {websitePagesWithStaticPaths["/transcript"]!.items!.map((page) => (
          <li
            key={page.href}
            className="py-3 first:pt-0 last:pb-0 border-b last:border-b-0"
          >
            <Link
              href={`/transcript${page.href}`}
              className="flex justify-between items-center gap-4 group"
            >
              <p className="font-medium">{page.title}</p>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
