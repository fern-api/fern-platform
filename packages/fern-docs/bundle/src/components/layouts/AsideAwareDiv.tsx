"use client";

import React from "react";

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
      data-aside-state={hideAsides ? "hidden" : "visible"}
    >
      {children}
    </div>
  );
});

AsideAwareDiv.displayName = "AsideAwareDiv";
