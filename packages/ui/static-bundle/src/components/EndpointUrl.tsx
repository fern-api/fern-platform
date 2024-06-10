import type { FernNavigation } from "@fern-api/fdr-sdk";
import { FernTag, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";

export const EndpointUrl: React.FC<{
    endpoint: FernNavigation.EndpointNode;
}> = ({ endpoint }) => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(endpoint.slug);
    return (
        <FernTooltipProvider>
            <FernTooltip
                content={wasJustCopied ? "Copied!" : "Copy to clipboard"}
                open={wasJustCopied ? true : undefined}
            >
                <div className="flex gap-2" onClick={copyToClipboard}>
                    <FernTag colorScheme="blue">{endpoint.method}</FernTag>
                    <div>{endpoint.slug}</div>
                </div>
            </FernTooltip>
        </FernTooltipProvider>
    );
};
