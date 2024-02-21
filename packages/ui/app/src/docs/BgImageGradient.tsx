"use client";
import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useTheme } from "next-themes";
import { FC, useCallback, useEffect, useState } from "react";

export declare namespace BgImageGradient {
    export interface Props {
        className?: string;
        colors: DocsV1Read.ColorsConfigV3 | undefined;
        hasSpecifiedBackgroundImage: boolean;
    }
}

export const BgImageGradient: FC<BgImageGradient.Props> = ({ className, colors, hasSpecifiedBackgroundImage }) => {
    const { resolvedTheme: theme } = useTheme();

    const getBackgroundType = useCallback(() => {
        if (colors?.type === "darkAndLight") {
            if (theme === "dark" || theme === "light") {
                return colors?.[theme].background.type;
            }
            return undefined;
        } else {
            return colors?.background.type;
        }
    }, [colors, theme]);

    const [backgroundType, setBackgroundType] = useState<"solid" | "gradient" | undefined>();

    useEffect(() => {
        if (typeof window !== "undefined") {
            setBackgroundType(getBackgroundType());
        }
    }, [getBackgroundType]);

    return (
        <div
            className={classNames(
                className,
                "fixed inset-0 -z-10 bg-background dark:bg-background-dark pointer-events-none overscroll-y-none",
                {
                    "from-accent-primary-light/10 dark:from-accent-primary-dark/5 bg-gradient-to-b to-transparent":
                        backgroundType === "gradient" && !hasSpecifiedBackgroundImage,
                },
            )}
            style={
                hasSpecifiedBackgroundImage
                    ? {
                          backgroundImage: "var(--docs-background-image)",
                          backgroundSize: "cover",
                      }
                    : {}
            }
        />
    );
};
