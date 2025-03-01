import * as React from "react";

import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { ChevronRight } from "lucide-react";

import { useFernCollapseOverflow } from "./FernCollapse";
import * as AccordionPrimitive from "./accordion-primitive";
import { cn } from "./cn";

const Accordion = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      className={cn("fern-accordion fern-card", className)}
      {...props}
    >
      {props.children}
    </AccordionPrimitive.Root>
  );
});
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
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
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
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
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, asChild, ...props }, ref) => {
  const collapseProps = useFernCollapseOverflow();
  return (
    <AccordionPrimitive.Content
      ref={composeRefs(ref, collapseProps.ref)}
      className={cn("fern-collapsible flex flex-col", className)}
      {...props}
      onAnimationStart={composeEventHandlers(
        props.onAnimationStart,
        collapseProps.onAnimationStart
      )}
      onAnimationEnd={composeEventHandlers(
        props.onAnimationEnd,
        collapseProps.onAnimationEnd
      )}
    >
      {children}
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
