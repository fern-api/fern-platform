import React from "react";

import { cn } from "@fern-docs/components";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-border-default file:text-(color:--grayscale-12) placeholder:text-(color:--accent-12) focus-visible:ring-(color:--accent) rounded-3/2 shadow-card-grayscale flex h-9 w-full border bg-transparent px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
