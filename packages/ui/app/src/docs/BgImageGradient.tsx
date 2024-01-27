import classNames from "classnames";
import { FC } from "react";

export declare namespace BgImageGradient {
    export interface Props {
        className?: string;
        backgroundType: "solid" | "gradient" | undefined;
        hasSpecifiedBackgroundImage: boolean;
    }
}

export const BgImageGradient: FC<BgImageGradient.Props> = ({
    className,
    backgroundType,
    hasSpecifiedBackgroundImage,
}) => {
    return (
        <div
            className={classNames(
                className,
                "fixed inset-0 -z-10 bg-background dark:bg-background-dark pointer-events-none",
                {
                    "from-accent-primary/5 dark:from-accent-primary/[0.09] overscroll-y-none bg-gradient-to-b to-transparent":
                        backgroundType === "gradient" && !hasSpecifiedBackgroundImage,
                }
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
