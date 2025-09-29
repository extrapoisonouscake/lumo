import { cn } from "@/helpers/cn";
import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";

const linkVariants = cva(undefined, {
  variants: {
    variant: {
      default: "",
      underline: "underline text-blue-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
export type LinkProps = ComponentProps<typeof RouterLink> &
  VariantProps<typeof linkVariants>;
export const Link = ({ className, variant, ...props }: LinkProps) => {
  return (
    <>
      <RouterLink
        className={cn(linkVariants({ variant }), className)}
        {...props}
      />
    </>
  );
};
