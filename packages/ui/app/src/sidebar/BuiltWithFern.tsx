import { useIsHovering } from "@fern-ui/react-commons";
import cn from "clsx";
import { useContext } from "react";
import { FernLink } from "../components/FernLink";
import { FernTooltip, FernTooltipProvider } from "../components/FernTooltip";
import { FeatureFlagContext } from "../contexts/FeatureFlagContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { FernLogo } from "./FernLogo";

const BUILT_WITH_FERN_TOOLTIP_CONTENT = "SDKs and Docs for your API";

export declare namespace BuiltWithFern {
    export interface Props {
        className?: string;
    }
}

export const BuiltWithFern: React.FC<BuiltWithFern.Props> = ({ className }) => {
    const { domain } = useDocsContext();
    const { isWhitelabeled } = useContext(FeatureFlagContext);
    const { isHovering, ...containerCallbacks } = useIsHovering();

    if (isWhitelabeled) {
        return null;
    }

    return (
        <div className="absolute inset-x-0 bottom-0 z-50 my-8 flex justify-center">
            <FernTooltipProvider>
                <FernTooltip content={BUILT_WITH_FERN_TOOLTIP_CONTENT} side="top">
                    <span>
                        <FernLink
                            href={`https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=${encodeURIComponent(domain)}`}
                            className={cn("inline-flex items-center gap-2", className)}
                            {...containerCallbacks}
                        >
                            <span className={cn("text-xs t-muted whitespace-nowrap")}>Built with</span>
                            <FernLogo muted={!isHovering} className="-mt-0.5 h-4 transition" />
                        </FernLink>
                    </span>
                </FernTooltip>
            </FernTooltipProvider>
        </div>
    );
};
