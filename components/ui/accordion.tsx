"use client";

import { ArrowDown01StrokeStandard } from "@hugeicons-pro/core-stroke-standard";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

import { cn } from "@/helpers/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import { cva } from "class-variance-authority";

const Accordion = AccordionPrimitive.Root;
export const accordionItemVariants = cva("rounded-xl r border border-input");
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(accordionItemVariants(), className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "cursor-pointer flex flex-1 items-center px-3 py-2 justify-between font-medium transition-all [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ArrowDown01StrokeStandard}
        className="h-4 w-4 shrink-0 transition-transform duration-300"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
type AccordionContentProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Content
> & {
  containerClassName?: string;
};
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, containerClassName, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden px-4 pb-2 ease-in-out text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=closed]:pb-0 data-[state=open]:animate-accordion-down",
      containerClassName
    )}
    {...props}
  >
    <div className={cn("pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
