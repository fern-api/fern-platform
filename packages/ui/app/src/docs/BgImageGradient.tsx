import classNames from "classnames";
import { memo } from "react";

export declare namespace BgImageGradient {
    export interface Props {
        hasSpecifiedBackgroundColor: boolean;
        hasSpecifiedBackgroundImage: boolean;
    }
}

export const BgImageGradient = memo<BgImageGradient.Props>(function Core({
    hasSpecifiedBackgroundColor,
    hasSpecifiedBackgroundImage,
}) {
    return (
        <div
            className={classNames("fixed inset-0 -z-10 bg-background", {
                "from-accent-primary/5 dark:from-accent-primary/[0.09] overscroll-y-none bg-gradient-to-b to-transparent":
                    !hasSpecifiedBackgroundColor && !hasSpecifiedBackgroundImage,
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
});
