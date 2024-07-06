import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useRouter } from "next/router";
import { ExternalLink } from "react-feather";

export const ApiReferenceButton: React.FC<{ slug: string }> = ({ slug }) => {
    const router = useRouter();
    return (
        <FernTooltipProvider>
            <FernTooltip content="View API reference">
                <FernButton
                    className="-m-1"
                    rounded
                    variant="minimal"
                    icon={<ExternalLink className="size-4" />}
                    onClick={() => router.push(`/${slug}`)}
                />
            </FernTooltip>
        </FernTooltipProvider>
    );
};
