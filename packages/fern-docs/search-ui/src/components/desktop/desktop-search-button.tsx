import { ComponentPropsWithoutRef, forwardRef, memo } from "react";

import { VariantProps, cva } from "class-variance-authority";
import { SearchIcon } from "lucide-react";

import { Kbd } from "@fern-docs/components";
import { cn } from "@fern-docs/components";

const buttonVariants = cva(
  "inline-flex h-9 w-full cursor-text items-center justify-start gap-2 rounded-md p-2 text-sm font-medium whitespace-nowrap transition-colors hover:transition-none focus-visible:ring-1 focus-visible:ring-(--accent-6) focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-(--grayscale-a3) text-(--grayscale-a10) hover:bg-(--grayscale-a4)",
        loading: "cursor-default bg-(--grayscale-a3) text-(--grayscale-a10)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const DesktopSearchButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & VariantProps<typeof buttonVariants>
>(({ children, variant, className, ...rest }, ref) => {
  return (
    <button
      {...rest}
      className={buttonVariants({ variant, className })}
      ref={ref}
    >
      <SearchIcon />
      Search
      <CommandKbd className="ml-auto" />
    </button>
  );
});

DesktopSearchButton.displayName = "DesktopSearchButton";

export const CommandKbd = memo(({ className }: { className?: string }) => {
  return (
    <span className={cn("inline-flex gap-1", className)}>
      <Kbd>{"/"}</Kbd>
      {/* <Kbd>{shortcut}</Kbd>
            <Kbd>K</Kbd> */}
    </span>
  );
});

CommandKbd.displayName = "CommandKbd";
