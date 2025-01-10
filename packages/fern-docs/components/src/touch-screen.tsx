import { Primitive } from "@radix-ui/react-primitive";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "./cn";

export const TouchScreenOnly = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div> & {
    asChild?: boolean;
  }
>(({ children, ...props }, ref) => {
  return (
    <Primitive.div
      {...props}
      ref={ref}
      className={cn("ts-only", props.className)}
    >
      {children}
    </Primitive.div>
  );
});

TouchScreenOnly.displayName = "TouchScreenOnly";
