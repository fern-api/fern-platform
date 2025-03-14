import React from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { cn } from "@fern-docs/components";

export const Prose = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    className?: string;
    size?: "xs" | "sm" | "base" | "lg";
    pre?: boolean;
    asChild?: boolean;
  }
>(({ children, className, size = "base", pre, asChild }, ref) => {
  if (!children) {
    return null;
  }

  return (
    <Primitive.div
      ref={ref}
      className={cn(
        "fern-prose prose max-w-none hyphens-auto break-words",
        {
          "whitespace-pre-wrap": typeof children === "string" || pre,
          "text-xs": size === "xs",
          "text-sm": size === "sm",
          "text-lg": size === "lg",
        },
        className
      )}
      asChild={asChild}
    >
      {children}
    </Primitive.div>
  );
});

Prose.displayName = "Prose";
