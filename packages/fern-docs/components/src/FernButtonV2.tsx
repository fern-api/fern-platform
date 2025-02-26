"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "./cn";

const buttonVariants = cva(
  "focus-visible:ring-(color:--accent) rounded-3/2 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors hover:transition-none focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-(color:--accent-10) hover:bg-(color:--accent-9) text-(color:--accent-contrast)",
        destructive:
          "bg-(color:--red-10) text-(color:--red-12) hover:bg-(color:--red-11)",
        outline:
          "border-border-default text-(color:--grayscale-11) hover:bg-(color:--grayscale-a4) hover:text-(color:--grayscale-12) data-[state=active]:bg-(color:--grayscale-a4) data-[state=open]:bg-(color:--grayscale-a4) border",
        outlineSuccess:
          "border-(color:--green-a6) bg-(color:--green-a2) text-(color:--green-11) hover:bg-(color:--green-a4) data-[state=active]:bg-(color:--green-a4) data-[state=open]:bg-(color:--green-a4) border",
        outlineDanger:
          "border-(color:--red-a6) bg-(color:--red-a2) text-(color:--red-11) hover:bg-(color:--red-a4) data-[state=active]:bg-(color:--red-a4) data-[state=open]:bg-(color:--red-a4) border",
        secondary:
          "bg-(color:--grayscale-a3) text-(color:--accent-12) hover:bg-(color:--grayscale-a4)",
        ghost:
          "text-(color:--grayscale-a11) hover:bg-(color:--accent-a3) hover:text-(color:--accent-11)",
        ghostSuccess: "bg-(color:--green-11) hover:bg-(color:--green-a3)",
        link: "text-(color:--accent-6) underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "rounded-3/2 h-6 px-2 text-xs",
        sm: "rounded-3/2 h-8 px-3 text-sm",
        lg: "rounded-3/2 h-10 px-8",
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
