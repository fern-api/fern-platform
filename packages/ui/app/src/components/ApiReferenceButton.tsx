import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { ArrowUpRight } from "iconoir-react";
import { useRouter } from "next/router";

export const ApiReferenceButton: React.FC<{ slug: string }> = ({ slug }) => {
    const router = useRouter();
    return (
        <FernTooltipProvider>
            <FernTooltip content="View API reference">
                <FernButton
                    className="-m-1"
                    rounded
                    variant="minimal"
                    icon={<ArrowUpRight className="size-icon" />}
                    onClick={() => router.push(`/${slug}`)}
                />
            </FernTooltip>
        </FernTooltipProvider>
    );
};
