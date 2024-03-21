import { useIsHovering } from "@fern-ui/react-commons";
import cn from "clsx";
import { useContext } from "react";
import { FernLink } from "../components/FernLink";
import { FeatureFlagContext } from "../contexts/FeatureFlagContext";
import { FernLogo } from "./FernLogo";

export declare namespace BuiltWithFern {
    export interface Props {
        className?: string;
    }
}

export const BuiltWithFern: React.FC<BuiltWithFern.Props> = ({ className }) => {
    const { isWhitelabeled } = useContext(FeatureFlagContext);
    const { isHovering, ...containerCallbacks } = useIsHovering();

    if (isWhitelabeled) {
        return null;
    }

    return (
        <FernLink
            href="https://buildwithfern.com"
            className={cn("flex cursor-pointer items-center space-x-2 lg:px-3 py-3 mt-4 !no-underline", className)}
            {...containerCallbacks}
        >
            <div className="size-4">
                <FernLogo fill={isHovering ? undefined : "rgb(82, 82, 82)"} />
            </div>
            <div
                className={cn("whitespace-nowrap text-xs transition", {
                    "t-muted": isHovering,
                    "text-text-disabled": !isHovering,
                })}
            >
                Built with Fern
            </div>
        </FernLink>
    );
};
