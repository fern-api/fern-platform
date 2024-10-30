import {
    amber,
    amberA,
    amberDark,
    amberDarkA,
    blue,
    blueA,
    blueDark,
    blueDarkA,
    green,
    greenA,
    greenDark,
    greenDarkA,
    red,
    redA,
    redDark,
    redDarkA,
} from "@radix-ui/colors";
import { clsx } from "clsx";
import { PropsWithChildren, forwardRef } from "react";

export type HttpMethod = "GET" | "DELETE" | "POST" | "PUT" | "PATCH";
export type ColorScheme = "blue" | "green" | "amber" | "red";
export type Size = "sm" | "lg";

export const TagSizes: { [key: string]: Size } = {
    Small: "sm",
    Large: "lg",
};

const METHOD_COLOR_SCHEMES: Record<HttpMethod, ColorScheme> = {
    GET: "green",
    DELETE: "red",
    POST: "blue",
    PUT: "amber",
    PATCH: "amber",
};

const SUBTLE_BACKGROUND_COLORS: Record<ColorScheme, string> = {
    blue: blueA.blueA3,
    green: greenA.greenA3,
    amber: amberA.amberA3,
    red: redA.redA3,
};

const SUBTLE_BACKGROUND_COLORS_DARK: Record<ColorScheme, string> = {
    blue: blueDarkA.blueA3,
    green: greenDarkA.greenA3,
    amber: amberDarkA.amberA3,
    red: redDarkA.redA3,
};

const SOLID_BACKGROUND_COLORS: Record<ColorScheme, string> = {
    blue: blueA.blueA10,
    green: greenA.greenA10,
    amber: amberA.amberA10,
    red: redA.redA10,
};

const SOLID_BACKGROUND_COLORS_DARK: Record<ColorScheme, string> = {
    blue: blueDark.blue1,
    green: greenDark.green1,
    amber: amberDark.amber1,
    red: redDark.red1,
};

const SUBTLE_TEXT_COLORS: Record<ColorScheme, string> = {
    blue: blueA.blueA11,
    green: greenA.greenA11,
    amber: amberA.amberA11,
    red: redA.redA11,
};

const SUBTLE_TEXT_COLORS_DARK: Record<ColorScheme, string> = {
    blue: blueDark.blue11,
    green: greenDark.green11,
    amber: amberDark.amber11,
    red: redDark.red11,
};

const SOLID_TEXT_COLORS: Record<ColorScheme, string> = {
    blue: blue.blue1,
    green: green.green1,
    amber: amber.amber1,
    red: red.red1,
};

const SOLID_TEXT_COLORS_DARK: Record<ColorScheme, string> = {
    blue: blueDark.blue12,
    green: greenDark.green12,
    amber: amberDark.amber12,
    red: redDark.red12,
};

export interface HttpMethodTagProps extends PropsWithChildren {
    size?: Size;
    variant?: "subtle" | "solid";
    method: HttpMethod;
    className?: string;
    skeleton?: boolean;
}

/**
 * The `FernTag` component is used for items that need to be labeled, categorized, or organized using keywords that describe them.
 */
export const HttpMethodTag = forwardRef<HTMLSpanElement, HttpMethodTagProps>(
    ({ children, size = "lg", method, variant = "subtle", className, skeleton }, ref) => {
        const colorScheme = METHOD_COLOR_SCHEMES[method] ?? "blue";
        children ??= method === "DELETE" ? "DEL" : method;

        const backgroundColor = (variant === "subtle" ? SUBTLE_BACKGROUND_COLORS : SOLID_BACKGROUND_COLORS)[
            colorScheme
        ];
        const backgroundColorDark = (
            variant === "subtle" ? SUBTLE_BACKGROUND_COLORS_DARK : SOLID_BACKGROUND_COLORS_DARK
        )[colorScheme];
        const textColor = (variant === "subtle" ? SUBTLE_TEXT_COLORS : SOLID_TEXT_COLORS)[colorScheme];
        const textColorDark = (variant === "subtle" ? SUBTLE_TEXT_COLORS_DARK : SOLID_TEXT_COLORS_DARK)[colorScheme];

        return (
            <span
                ref={ref}
                className={clsx("fern-http-method-tag", { small: size === "sm", large: size === "lg" }, className)}
                style={
                    {
                        backgroundColor,
                        "--background-color-dark": backgroundColorDark,
                        color: textColor,
                        "--color-dark": textColorDark,
                    } as React.CSSProperties
                }
            >
                {skeleton ? <span className="contents invisible">{children}</span> : children}
            </span>
        );
    },
);

HttpMethodTag.displayName = "HttpMethodTag";
