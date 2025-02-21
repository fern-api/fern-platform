import { ComponentPropsWithoutRef, forwardRef, memo } from "react";

import { VariantProps, cva } from "class-variance-authority";
import { SearchIcon } from "lucide-react";

import { Kbd } from "@fern-docs/components";
import { cn } from "@fern-docs/components";
import { useIsMobile } from "@fern-ui/react-commons";

const buttonVariants = cva(
  "focus-visible:ring-(color:--accent) rounded-3/2 inline-flex h-9 w-full cursor-text items-center justify-start gap-2 whitespace-nowrap p-2 text-sm font-medium transition-colors hover:transition-none focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-(color:--grayscale-a3) text-(color:--grayscale-a10) hover:bg-(color:--grayscale-a4)",
        loading:
          "bg-(color:--grayscale-a3) text-(color:--grayscale-a10) cursor-default",
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
  const isMobile = useIsMobile();
  return (
    <button
      {...rest}
      className={buttonVariants({ variant, className })}
      ref={ref}
    >
      <SearchIcon />
      Search
      {!isMobile && <CommandKbd className="ml-auto" />}
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
