import classNames from "classnames";
import { FC } from "react";

export declare namespace BgImageGradient {
    export interface Props {
        backgroundType: "solid" | "gradient" | null;
        hasSpecifiedBackgroundImage: boolean;
    }
}

export const BgImageGradient: FC<BgImageGradient.Props> = ({ backgroundType, hasSpecifiedBackgroundImage }) => {
    return (
        <div
            className={classNames("fixed inset-0 -z-10 bg-background dark:bg-background-dark", {
                "from-accent-primary/5 dark:from-accent-primary/[0.09] overscroll-y-none bg-gradient-to-b to-transparent":
                    backgroundType === "gradient" && !hasSpecifiedBackgroundImage,
            })}
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
