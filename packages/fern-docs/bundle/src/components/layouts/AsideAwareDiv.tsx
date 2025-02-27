"use client";

import React from "react";

import { cn } from "@fern-docs/components";

import { useShouldHideAsides } from "@/state/layout";

export const AsideAwareDiv = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, ...props }, ref) => {
  const hideAsides = useShouldHideAsides();
  return (
    <div
      ref={ref}
      {...props}
      className={cn(props.className, {
        "lg:ml-0 xl:ml-auto": !hideAsides,
      })}
    >
      {children}
    </div>
  );
});

AsideAwareDiv.displayName = "AsideAwareDiv";
