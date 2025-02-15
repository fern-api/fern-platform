import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors hover:transition-none focus-visible:ring-1 focus-visible:ring-(--accent-6) focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-(--accent-10) text-[var(--accent-contrast,var(--accent-1))] hover:bg-(--accent-9)",
        destructive: "bg-(--red-10) text-(--red-12) hover:bg-(--red-11)",
        outline:
          "border border-(--grayscale-a6) bg-(--grayscale-2) text-(--grayscale-12) hover:bg-(--grayscale-4) hover:text-(--accent-12)",
        secondary:
          "bg-(--grayscale-a3) text-(--accent-12) hover:bg-(--grayscale-a4)",
        ghost: "hover:bg-(--accent-a3) hover:text-(--accent-12)",
        link: "text-(--accent-6) underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
        iconSm: "size-7",
        iconXs: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
