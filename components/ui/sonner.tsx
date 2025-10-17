"use client";

import { useTheme } from "@/views/theme-provider";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      mobileOffset={{
        bottom: "calc(var(--mobile-menu-height) + 0.75rem)",
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background rounded-xl! group-[.toaster]:text-foreground group-[.toaster]:border-border! group-[.toaster]:shadow-xl!",
          description: "group-[.toast]:text-muted-foreground!",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
