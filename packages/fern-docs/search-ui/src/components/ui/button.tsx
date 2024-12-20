import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:transition-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-6)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-6)] text-[var(--accent-12)] shadow hover:bg-[var(--accent-11)]",
        destructive:
          "bg-[var(--red-10)] text-[var(--red-12)] shadow-sm hover:bg-[var(--red-11)]",
        outline:
          "border border-[var(--grayscale-a6)] bg-[var(--grayscale-2)] text-[var(--grayscale-12)] shadow-sm hover:bg-[var(--grayscale-4)] hover:text-[var(--accent-12)]",
        secondary:
          "bg-[var(--grayscale-a3)] text-[var(--accent-12)] shadow-sm hover:bg-[var(--grayscale-a4)]",
        ghost: "hover:bg-[var(--accent-a3)] hover:text-[var(--accent-12)]",
        link: "text-[var(--accent-6)] underline-offset-4 hover:underline",
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
