import {
  ChevronRight,
  GraduationCap,
  LucideIcon,
  MenuIcon,
  Settings,
} from "lucide-react";
import { Link } from "react-router";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
const items = [
  {
    title: "Graduation",
    href: "/graduation",
    icon: GraduationCap,
  },
  { title: "Settings", href: "/settings", icon: Settings },
];
export function MobileAdditionalMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <SidebarMenuItem className="flex-1">
          <SidebarMenuButton isActive={open} className="py-2 gap-2">
            <MenuIcon />
            <span className="leading-none">Menu</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DrawerTrigger>
      <DrawerContent
        className="bg-sidebar flex flex-col gap-2 block-end-(--mobile-menu-height) py-4 z-20 bottom-(--mobile-menu-height)!"
        overlayClassName="z-10 block-end-(--mobile-menu-height)!"
      >
        <ul className="flex flex-col">
          {items.map((item) => (
            <Item
              onClick={() => setOpen(false)}
              title={item.title}
              href={item.href}
              icon={item.icon}
            />
          ))}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}
function Item({
  title,
  href,
  icon: Icon,
  onClick,
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <li key={href} className="group">
      <Link
        className="block py-3 group-first:pt-0 border-b group-last:border-b-0"
        onClick={onClick}
        to={href}
      >
        <div className="px-4 flex justify-between items-center gap-4 group group-active:scale-[98%] transition-transform">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4" />}
            <p>{title}</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Link>
    </li>
  );
}
