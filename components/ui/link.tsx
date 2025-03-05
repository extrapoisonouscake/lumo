import { cn } from "@/helpers/cn";
import { cva, VariantProps } from "class-variance-authority";
import NextLink from "next/link";
import { ComponentProps } from "react";

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
export type LinkProps = ComponentProps<typeof NextLink> &
  VariantProps<typeof linkVariants>;
export const Link = ({ className, variant, ...props }: LinkProps) => {
  return (
    <>
      <NextLink
        className={cn(linkVariants({ variant }), className)}
        {...props}
      />
    </>
  );
};
