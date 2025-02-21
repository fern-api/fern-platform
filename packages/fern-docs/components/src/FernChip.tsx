import { PropsWithChildren, forwardRef } from "react";

import { cn } from "./cn";
import { ColorScheme, Size } from "./util/shared-component-types";

export type FernChipSize = Extract<Size, "sm" | "lg">;
export const FernChipSizes: Record<string, FernChipSize> = {
  Small: "sm",
  Large: "lg",
};

export type FernChipColorScheme = ColorScheme;
export const FernChipColorSchemes: Record<string, FernChipColorScheme> = {
  Gray: "gray",
  Green: "green",
  Blue: "blue",
  Amber: "amber",
  Red: "red",
  Accent: "accent",
};

export interface FernChipProps extends PropsWithChildren {
  size?: FernChipSize;
  rounded?: boolean;
  variant?: "subtle" | "solid";
  colorScheme?: FernChipColorScheme;
  className?: string;
  onClick?: () => void;
}

export const FernChip = forwardRef<HTMLButtonElement, FernChipProps>(
  (
    {
      children,
      rounded = false,
      size = "lg",
      variant = "subtle",
      colorScheme = "gray",
      className,
      onClick,
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex cursor-default items-center justify-center font-mono leading-none",
          {
            "h-[18px] min-w-[18px] px-1.5 text-[10px]": size === "sm",
            "h-6 min-w-6 px-2 py-1 text-xs": size === "lg",
            "rounded-3/2": size === "sm" && !rounded,
            "rounded-2": size === "lg" && !rounded,
            "rounded-full": rounded,
          },
          {
            // Gray
            "bg-(color:--grayscale-a3) text-(color:--grayscale-a12) hover:bg-(color:--grayscale-a4)":
              colorScheme === "gray" && variant === "subtle",
            "bg-(color:--grayscale-a12) text-background hover:bg-(color:--grayscale-a11)":
              colorScheme === "gray" && variant === "solid",

            // Green
            "bg-green-a3 text-green-a11 hover:bg-green-a4":
              colorScheme === "green" && variant === "subtle",
            "bg-green-a10 text-green-1 hover:bg-green-a11":
              colorScheme === "green" && variant === "solid",

            // Blue
            "bg-blue-a3 text-blue-a11 hover:bg-blue-a4":
              colorScheme === "blue" && variant === "subtle",
            "bg-blue-a10 text-blue-1 hover:bg-blue-a11":
              colorScheme === "blue" && variant === "solid",

            // Amber
            "bg-amber-a3 text-amber-a11 hover:bg-amber-a4":
              colorScheme === "amber" && variant === "subtle",
            "bg-amber-a10 text-amber-1 hover:bg-amber-a11 dark:text-amber-12":
              colorScheme === "amber" && variant === "solid",

            // Red
            "bg-red-a3 text-red-a11 hover:bg-red-a4":
              colorScheme === "red" && variant === "subtle",
            "bg-red-a10 text-red-1 hover:bg-red-a11":
              colorScheme === "red" && variant === "solid",

            // Accent
            "bg-(color:--accent)/20 text-(color:--accent-a12) hover:bg-(color:--accent)/25":
              colorScheme === "accent" && variant === "subtle",
            "text-(color:--accent-contrast) bg-(color:--accent) hover:bg-(color:--accent-a10)":
              colorScheme === "accent" && variant === "solid",
          },
          className
        )}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
);

FernChip.displayName = "FernChip";
