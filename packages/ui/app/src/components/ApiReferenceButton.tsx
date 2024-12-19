import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { ArrowUpRight } from "iconoir-react";
import { useHref } from "../atoms";
import { FernLinkButton } from "./FernLinkButton";

export const ApiReferenceButton: React.FC<{ slug: FernNavigation.Slug }> = ({ slug }) => {
    const href = useHref(slug);
    return (
        <FernTooltipProvider>
            <FernTooltip content="Open in API reference">
                <FernLinkButton
                    className="-m-1"
                    rounded
                    variant="minimal"
                    icon={<ArrowUpRight className="size-icon" />}
                    href={href}
                />
            </FernTooltip>
        </FernTooltipProvider>
    );
};
