import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useAtomValue } from "jotai";
import { useRouter } from "next/router";
import { ExternalLink } from "react-feather";
import { PORTAL_CONTAINER } from "../atoms/portal";

export const ApiReferenceButton: React.FC<{ slug: string }> = ({ slug }) => {
    const router = useRouter();
    const portalContainer = useAtomValue(PORTAL_CONTAINER);
    return (
        <FernTooltipProvider>
            <FernTooltip content="View API reference" container={portalContainer}>
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
