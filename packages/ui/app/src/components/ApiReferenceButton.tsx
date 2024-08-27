import { FernNavigation } from "@fern-api/fdr-sdk";
import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { ArrowUpRight } from "iconoir-react";
import { useRouter } from "next/router";
import { useToHref } from "../hooks/useHref";

export const ApiReferenceButton: React.FC<{ slug: FernNavigation.Slug }> = ({ slug }) => {
    const router = useRouter();
    const toHref = useToHref();
    return (
        <FernTooltipProvider>
            <FernTooltip content="View API reference">
                <FernButton
                    className="-m-1"
                    rounded
                    variant="minimal"
                    icon={<ArrowUpRight className="size-icon" />}
                    onClick={() => router.push(toHref(slug))}
                />
            </FernTooltip>
        </FernTooltipProvider>
    );
};
