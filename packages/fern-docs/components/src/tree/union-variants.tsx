import * as Separator from "@radix-ui/react-separator";
import {
  Children,
  ComponentPropsWithoutRef,
  Fragment,
  forwardRef,
  isValidElement,
} from "react";
import { cn } from "../cn";

export const UnionVariants = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, ...props }, ref) => {
  const childrenArray = Children.toArray(children);
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "-mx-2 rounded-xl border border-[var(--grayscale-a6)]",
        props.className
      )}
    >
      {childrenArray.map((child, index) => (
        <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
          {index > 0 && (
            <Separator.Root
              orientation="horizontal"
              className="pointer-events-none flex h-px items-center gap-2"
            >
              <Separator.Separator className="h-px flex-1 bg-[var(--grayscale-a6)]" />
              <span className="text-sm uppercase text-[var(--grayscale-a9)]">
                {"or"}
              </span>
              <Separator.Separator className="h-px flex-1 bg-[var(--grayscale-a6)]" />
            </Separator.Root>
          )}
          <div className="px-4 py-2">{child}</div>
        </Fragment>
      ))}
    </div>
  );
});

UnionVariants.displayName = "UnionVariants";
