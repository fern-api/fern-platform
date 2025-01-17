import { ChevronRight } from "lucide-react";
import * as React from "react";
import * as AccordionPrimitive from "./accordion-primitive";
import {
  AccordionItemProps,
  AccordionMultipleProps,
  AccordionSingleProps,
} from "./accordion-primitive";
import { cn } from "./cn";

const AccordionRoot = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      className={cn("fern-accordion", className)}
      {...props}
    >
      {props.children}
    </AccordionPrimitive.Root>
  );
});
AccordionRoot.displayName = "AccordionRoot";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionPrimitive.AccordionItemProps
>(({ className, children, ...props }, forwardedRef) => (
  <AccordionPrimitive.Item
    ref={forwardedRef}
    className={cn("fern-accordion-item", className)}
    {...props}
  >
    {children}
  </AccordionPrimitive.Item>
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header asChild>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn("fern-accordion-trigger", className)}
      {...props}
    >
      <ChevronRight className="fern-accordion-trigger-arrow" />
      <h6 className="fern-accordion-trigger-title">{children}</h6>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, asChild, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn("fern-accordion-content", className)}
    {...props}
  >
    {children}
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export const Accordion = {
  Content: AccordionContent,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Root: AccordionRoot,
};

export type {
  AccordionItemProps,
  AccordionMultipleProps,
  AccordionSingleProps,
};
