import { clsx } from "clsx";
import { PropsWithChildren, forwardRef } from "react";

import { ColorScheme, Size } from "./util/shared-component-types";

export type FernChipSize = Extract<Size, "sm" | "lg">;
export const FernChipSizes: { [key: string]: FernChipSize } = {
    Small: "sm",
    Large: "lg",
};

export type FernChipColorScheme = ColorScheme;
export const FernChipColorSchemes: { [key: string]: FernChipColorScheme } = {
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
                className={clsx(
                    "font-mono inline-flex justify-center items-center leading-none cursor-default",
                    {
                        "h-[18px] min-w-[18px] text-[10px] px-1.5":
                            size === "sm",
                        "py-1 px-2 h-6 min-w-6 text-xs": size === "lg",
                        "rounded-md": size === "sm" && !rounded,
                        "rounded-lg": size === "lg" && !rounded,
                        "rounded-full": rounded,
                    },
                    {
                        // Gray
                        "bg-grayscale-a3 text-grayscale-a12 hover:bg-grayscale-a4":
                            colorScheme === "gray" && variant === "subtle",
                        "bg-grayscale-a12 text-background hover:bg-grayscale-a11":
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
                        "bg-amber-a10 text-amber-1 dark:text-amber-12 hover:bg-amber-a11":
                            colorScheme === "amber" && variant === "solid",

                        // Red
                        "bg-red-a3 text-red-a11 hover:bg-red-a4":
                            colorScheme === "red" && variant === "subtle",
                        "bg-red-a10 text-red-1 hover:bg-red-a11":
                            colorScheme === "red" && variant === "solid",

                        // Accent
                        "bg-accent/20 text-accent-aaa hover:bg-accent/25":
                            colorScheme === "accent" && variant === "subtle",
                        "bg-accent t-accent-contrast hover:bg-accent-tinted":
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
