"use client";

import { FernLink } from "@/components/link";
import { cn } from "@fern-docs/components";
import React from "react";

export const TabItem = React.forwardRef<
  React.ComponentRef<typeof FernLink>,
  React.ComponentPropsWithoutRef<typeof FernLink> & {
    tabId: string;
    active?: boolean;
  }
>(({ tabId, active, ...props }, ref) => {
  return (
    <FernLink
      ref={ref}
      {...props}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "flex items-center justify-start gap-2 p-3 text-sm font-medium text-[var(--grayscale-a11)] hover:text-[var(--grayscale-a12)] data-[state=active]:text-[var(--accent-11)]",
        "relative after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-[var(--accent-11)] after:opacity-0 data-[state=active]:after:opacity-100",
        "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0"
      )}
    />
  );
});
