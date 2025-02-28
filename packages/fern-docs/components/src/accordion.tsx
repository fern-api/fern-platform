import * as React from "react";

import { composeEventHandlers } from "@radix-ui/primitive";
import { ChevronRight } from "lucide-react";

import { useBooleanState } from "@fern-ui/react-commons/src/useBooleanState";

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
  const animationFrameRef = React.useRef<number | null>(null);
  const isAnimatingState = useBooleanState(false);
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn("fern-collapsible flex flex-col", className, {
        "overflow-clip": isAnimatingState.value,
      })}
      {...props}
      onAnimationStart={composeEventHandlers(props.onAnimationStart, () => {
        if (animationFrameRef.current != null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        isAnimatingState.setTrue();
      })}
      onAnimationEnd={composeEventHandlers(props.onAnimationEnd, () => {
        animationFrameRef.current = requestAnimationFrame(() => {
          isAnimatingState.setFalse();
        });
      })}
    >
      {children}
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
