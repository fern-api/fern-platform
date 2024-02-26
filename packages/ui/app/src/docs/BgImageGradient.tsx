import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { FC } from "react";

export declare namespace BgImageGradient {
    export interface Props {
        className?: string;
        colors: DocsV1Read.ColorsConfigV3 | undefined;
        hasSpecifiedBackgroundImage: boolean;
    }
}

export const BgImageGradient: FC<BgImageGradient.Props> = ({ className, colors, hasSpecifiedBackgroundImage }) => {
    const darkBackground = colors?.type === "darkAndLight" ? colors.dark.background : colors?.background;
    const lightBackground = colors?.type === "darkAndLight" ? colors.light.background : colors?.background;

    // const getBackgroundType = useCallback(() => {
    //     if (colors?.type === "darkAndLight") {
    //         if (theme === "dark" || theme === "light") {
    //             return colors?.[theme].background.type;
    //         }
    //         return undefined;
    //     } else {
    //         return colors?.background.type;
    //     }
    // }, [colors, theme]);

    // const [backgroundType, setBackgroundType] = useState<"solid" | "gradient" | undefined>();

    // useEffect(() => {
    //     if (typeof window !== "undefined") {
    //         setBackgroundType(getBackgroundType());
    //     }
    // }, [getBackgroundType]);

    return (
        <div
            className={classNames(
                className,
                "fixed inset-0 -z-10 bg-background dark:bg-background-dark pointer-events-none overscroll-y-none",
                {
                    "from-accent-primary-light/10 bg-gradient-to-b to-transparent":
                        lightBackground?.type === "gradient" && !hasSpecifiedBackgroundImage,
                    "dark:from-accent-primary-dark/5 dark:bg-gradient-to-b dark:to-transparent":
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
