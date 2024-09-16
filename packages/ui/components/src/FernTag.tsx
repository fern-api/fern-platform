import { clsx } from "clsx";
import { PropsWithChildren, forwardRef } from "react";

import { ColorScheme, Size } from "./util/shared-component-types";

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
    skeleton?: boolean;
}

/**
 * The `FernTag` component is used for items that need to be labeled, categorized, or organized using keywords that describe them.
 */
export const FernTag = forwardRef<HTMLSpanElement, FernTagProps>(
    (
        { children, rounded = false, size = "lg", variant = "subtle", colorScheme = "gray", className, skeleton },
        ref,
    ) => {
        if (skeleton) {
            colorScheme = "gray";
        }

        return (
            <span
                ref={ref}
                className={clsx(
                    "fern-tag",
                    {
                        small: size === "sm",
                        large: size === "lg",
                        "rounded-full": rounded,
                    },
                    {
                        // Gray
                        "gray-subtle": colorScheme === "gray" && variant === "subtle",
                        "gray-solid": colorScheme === "gray" && variant === "solid",

                        // Green
                        "green-subtle": colorScheme === "green" && variant === "subtle",
                        "green-solid": colorScheme === "green" && variant === "solid",

                        // Blue
                        "bg-blue-a3 text-blue-a11": colorScheme === "blue" && variant === "subtle",
                        "bg-blue-a10 text-blue-1 dark:text-blue-12": colorScheme === "blue" && variant === "solid",

                        // Amber
                        "amber-subtle": colorScheme === "amber" && variant === "subtle",
                        "amber-solid": colorScheme === "amber" && variant === "solid",

                        // Red
                        "red-subtle": colorScheme === "red" && variant === "subtle",
                        "red-solid": colorScheme === "red" && variant === "solid",

                        // Accent
                        "accent-subtle": colorScheme === "accent" && variant === "subtle",
                        "accent-solid": colorScheme === "accent" && variant === "solid",
                    },
                    className,
                )}
            >
                {skeleton ? <span className="invisible contents">{children}</span> : children}
            </span>
        );
    },
);

FernTag.displayName = "FernTag";
