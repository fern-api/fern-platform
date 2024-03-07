import classNames from "classnames";
import { FC } from "react";
import { ColorsConfig } from "../sidebar/types";

export declare namespace BgImageGradient {
    export interface Props {
        className?: string;
        colors: ColorsConfig;
        hasSpecifiedBackgroundImage: boolean;
    }
}

export const BgImageGradient: FC<BgImageGradient.Props> = ({ className, colors, hasSpecifiedBackgroundImage }) => {
    const darkBackground = colors.dark?.background;
    const lightBackground = colors.light?.background;

    return (
        <div
            className={classNames(
                className,
                "fixed inset-0 -z-10 bg-background pointer-events-none overscroll-y-none",
                {
                    "from-accent-primary/10 bg-gradient-to-b to-transparent":
                        lightBackground?.type === "gradient" && !hasSpecifiedBackgroundImage,
                    "dark:bg-gradient-to-b dark:to-transparent":
                        darkBackground?.type === "gradient" && !hasSpecifiedBackgroundImage,
                    "dark:from-transparent": darkBackground?.type === "solid" && !hasSpecifiedBackgroundImage,
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
