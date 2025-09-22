import { PageHeading } from "@/components/layout/page-heading";
import {
  ChevronRight,
  GraduationCap,
  List,
  LucideIcon,
  Settings,
  Shapes,
} from "lucide-react";
import Link from "next/link";
const items = [
  {
    title: "Graduation Summary",
    href: "/transcript/graduation-summary",
    icon: GraduationCap,
  },
  {
    title: "Credit Entries",
    href: "/transcript/entries",
    icon: List,
  },
  {
    title: "Credit Summary",
    href: "/transcript/credit-summary",
    icon: Shapes,
  },
  { title: "Settings", href: "/settings", icon: Settings },
];
export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading />
      <ul className="flex flex-col">
        {items.map((item) => (
          <Item title={item.title} href={item.href} icon={item.icon} />
        ))}
      </ul>
    </div>
  );
}
function Item({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <li
      key={href}
      className="py-3 first:pt-0 last:pb-0 border-b last:border-b-0 group"
    >
      <Link
        href={href}
        className="flex justify-between items-center gap-4 group group-active:scale-[98%] transition-transform"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4" />}
          <p className="font-medium">{title}</p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    </li>
  );
}
