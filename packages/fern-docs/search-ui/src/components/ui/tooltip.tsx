import React from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@fern-docs/components";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    animate?: boolean;
  }
>(({ className, sideOffset = 4, animate = true, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-(--grayscale-a6) bg-(--grayscale-a1) px-3 py-1.5 text-sm text-(--accent-12) shadow-md backdrop-blur-xl",
      "before:pointer-events-none before:absolute before:inset-0 before:-z-50 before:bg-(--white-a9) dark:before:bg-(--black-a9)",
      {
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2":
          animate,
      },
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
