import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

const createComponent = function <T extends React.ComponentType<any>>({
  mobile,
  desktop,
}: {
  desktop: T;
  mobile: T;
}) {
  return (props: React.ComponentProps<T>) => {
    const Component = useIsMobile() ? mobile : desktop;
    return <Component {...props} />;
  };
};

export const ResponsiveDialog = createComponent({
  desktop: Dialog,
  mobile: Drawer,
});
export const ResponsiveDialogTrigger = createComponent({
  mobile: DrawerTrigger,
  desktop: DialogTrigger,
});
export const ResponsiveDialogContent = createComponent({
  mobile: DrawerContent,
  desktop: DialogContent,
});
export const ResponsiveDialogHeader = createComponent({
  mobile: DrawerHeader,
  desktop: DialogHeader,
});
export const ResponsiveDialogClose = createComponent({
  mobile: DrawerClose,
  desktop: DialogClose,
});
export const ResponsiveDialogTitle = createComponent({
  mobile: DrawerTitle,
  desktop: DialogTitle,
});
export const ResponsiveDialogDescription = createComponent({
  mobile: DrawerDescription,
  desktop: DialogDescription,
});
export const ResponsiveDialogFooter = createComponent({
  mobile: DrawerFooter,
  desktop: DialogFooter,
});
