"use client";

import React from "react";

import { composeRefs } from "@radix-ui/react-compose-refs";
import { Slot } from "@radix-ui/react-slot";

import type { Slug } from "@fern-api/fdr-sdk/navigation";

import { useHref } from "../hooks/useHref";
import { useApiPageCenterElement } from "./useApiPageCenterElement";

export const ApiPageCenter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    slug: Slug;
    asChild?: boolean;
  }
>(function ApiPageCenter({ children, asChild, slug, ...props }, forwardedRef) {
  const Comp = asChild ? Slot : "div";

  const ref = React.useRef<HTMLDivElement>(null);
  useApiPageCenterElement(ref, slug);

  return (
    <Comp ref={composeRefs(forwardedRef, ref)} id={useHref(slug)} {...props}>
      {children}
    </Comp>
  );
});
