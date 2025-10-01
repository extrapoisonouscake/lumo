import { PageHeading } from "@/components/layout/page-heading";
import {
  ChevronRight,
  GraduationCap,
  LucideIcon,
  Settings,
} from "lucide-react";
import { Link } from "react-router";
const items = [
  {
    title: "Graduation Summary",
    href: "/graduation",
    icon: GraduationCap,
  },
  { title: "Settings", href: "/settings", icon: Settings },
];
export default function OtherPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading />
      <ul className="flex flex-col -mx-4">
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
        to={href}
        className="px-4 flex justify-between items-center gap-4 group group-active:scale-[98%] transition-transform"
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
