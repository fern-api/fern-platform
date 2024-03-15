import classNames from "classnames";
import { FC } from "react";
import { ColorsConfig } from "../sidebar/types";
import "./BgImageGradient.css";

export declare namespace BgImageGradient {
    export interface Props {
        className?: string;
        colors: ColorsConfig;
    }
}

export const BgImageGradient: FC<BgImageGradient.Props> = ({ className, colors }) => {
    const darkBackground = colors.dark?.background;
    const lightBackground = colors.light?.background;
    const darkBackgroundImage = colors.dark?.backgroundImage;
    const lightBackgroundImage = colors.light?.backgroundImage;

    return (
        <div
            className={classNames(className, "fern-background", {
                "from-accent-primary/10 bg-gradient-to-b to-transparent":
                    lightBackground?.type === "gradient" && lightBackgroundImage == null,
                "dark:bg-gradient-to-b dark:to-transparent":
                    darkBackground?.type === "gradient" && darkBackgroundImage == null,
                "dark:from-transparent": darkBackground?.type === "solid" && darkBackgroundImage == null,
            })}
        />
    );
};
