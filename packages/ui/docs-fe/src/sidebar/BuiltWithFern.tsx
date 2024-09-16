import { FernLogo, FernLogoFill, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useIsHovering } from "@fern-ui/react-utils";
import clsx from "clsx";
import { useDomain, useFeatureFlags } from "../atoms";
import { FernLink } from "../components/FernLink";

const BUILT_WITH_FERN_TOOLTIP_CONTENT = "Developer-friendly docs for your API";

export declare namespace BuiltWithFern {
    export interface Props {
        className?: string;
    }
}

export const BuiltWithFern: React.FC<BuiltWithFern.Props> = ({ className }) => {
    const domain = useDomain();
    const { isWhitelabeled } = useFeatureFlags();
    const { isHovering, ...containerCallbacks } = useIsHovering();

    if (isWhitelabeled) {
        return null;
    }

    return (
        <div className={className}>
            <FernTooltipProvider>
                <FernTooltip content={BUILT_WITH_FERN_TOOLTIP_CONTENT} side="top">
                    <span>
                        <FernLink
                            href={`https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=${encodeURIComponent(domain)}`}
                            className={"inline-flex items-baseline gap-1"}
                            {...containerCallbacks}
                        >
                            <span className={clsx("t-muted whitespace-nowrap text-xs")}>Built with</span>
                            <FernLogo
                                fill={isHovering ? FernLogoFill.Default : FernLogoFill.Muted}
                                className="-mt-0.5 h-3.5 transition"
                            />
                        </FernLink>
                    </span>
                </FernTooltip>
            </FernTooltipProvider>
        </div>
    );
};
