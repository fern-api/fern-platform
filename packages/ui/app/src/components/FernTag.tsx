import { clsx } from "clsx";
import { FC, PropsWithChildren } from "react";
import { ColorScheme, Size } from "../util/shared-component-types";

export type FernTagSize = Extract<Size, "sm" | "lg">;
export const FernTagSizes: { [key: string]: FernTagSize } = {
    Small: "sm",
    Large: "lg",
};

export type FernTagColorScheme = ColorScheme;
export const FernTagColorSchemes: { [key: string]: FernTagColorScheme } = {
    Gray: "gray",
    Green: "green",
    Blue: "blue",
    Amber: "amber",
    Red: "red",
    Accent: "accent",
};

export interface FernTagProps extends PropsWithChildren {
    size?: FernTagSize;
    rounded?: boolean;
    variant?: "subtle" | "solid";
    colorScheme?: FernTagColorScheme;
    className?: string;
}

/**
 * The `FernTag` component is used for items that need to be labeled, categorized, or organized using keywords that describe them.
 */
export const FernTag: FC<FernTagProps> = ({
    children,
    rounded = false,
    size = "lg",
    variant = "subtle",
    colorScheme = "gray",
    className,
}) => {
    return (
        <div
            className={clsx(
                "font-mono inline-flex justify-center items-center leading-none",
                {
                    "h-[18px] text-[10px] px-1.5": size === "sm",
                    "py-1 px-2 h-6 text-xs": size === "lg",
                    "rounded-md": size === "sm" && !rounded,
                    "rounded-lg": size === "lg" && !rounded,
                    "rounded-full": rounded,
                },
                {
                    // Gray
                    "bg-grayscale-a3 text-grayscale-a12": colorScheme === "gray" && variant === "subtle",
                    "bg-grayscale-a12 text-background": colorScheme === "gray" && variant === "solid",

                    // Green
                    "bg-green-a3 text-green-a11": colorScheme === "green" && variant === "subtle",
                    "bg-green-a10 text-green-1": colorScheme === "green" && variant === "solid",

                    // Blue
                    "bg-blue-a3 text-blue-a11": colorScheme === "blue" && variant === "subtle",
                    "bg-blue-a10 text-blue-1": colorScheme === "blue" && variant === "solid",

                    // Amber
                    "bg-amber-a3 text-amber-a11": colorScheme === "amber" && variant === "subtle",
                    "bg-amber-a10 text-amber-1 dark:text-amber-12": colorScheme === "amber" && variant === "solid",

                    // Red
                    "bg-red-a3 text-red-a11": colorScheme === "red" && variant === "subtle",
                    "bg-red-a10 text-red-1": colorScheme === "red" && variant === "solid",

                    // Accent
                    "bg-accent/20 text-accent-aaa": colorScheme === "accent" && variant === "subtle",
                    "bg-accent t-accent-contrast": colorScheme === "accent" && variant === "solid",
                },
                className,
            )}
        >
            {children}
        </div>
    );
};
