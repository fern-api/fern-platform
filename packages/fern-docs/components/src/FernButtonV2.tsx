"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "./cn";

const buttonVariants = cva(
  "focus-visible:ring-accent inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:transition-none focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent-10 hover:bg-accent-9 text-[var(--color-accent-contrast,var(--color-accent-1))]",
        destructive: "bg-(--red-10) text-(--red-12) hover:bg-(--red-11)",
        outline:
          "border-border-default text-grayscale-11 hover:bg-grayscale-a4 hover:text-grayscale-12 data-[state=active]:bg-grayscale-a4 data-[state=open]:bg-grayscale-a4 border",
        outlineSuccess:
          "border-(--green-a6) bg-(--green-a2) text-(--green-11) hover:bg-(--green-a4) data-[state=active]:bg-(--green-a4) data-[state=open]:bg-(--green-a4) border",
        outlineDanger:
          "border-(--red-a6) bg-(--red-a2) text-(--red-11) hover:bg-(--red-a4) data-[state=active]:bg-(--red-a4) data-[state=open]:bg-(--red-a4) border",
        secondary: "bg-grayscale-a3 text-accent-12 hover:bg-grayscale-a4",
        ghost: "hover:bg-accent-a3 hover:text-accent-11",
        ghostSuccess: "hover:bg-(--green-a3) hover:text-(--green-11)",
        link: "text-accent-6 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-sm",
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
