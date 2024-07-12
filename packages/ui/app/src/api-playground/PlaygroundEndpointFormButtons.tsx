import { FernNavigation } from "@fern-api/fdr-sdk";
import { FernButton, FernButtonGroup } from "@fern-ui/components";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { CURRENT_NODE_ATOM } from "../atoms/navigation";
import { useClosePlayground } from "../atoms/playground";
import { FernLink } from "../components/FernLink";
import { ResolvedEndpointDefinition } from "../resolver/types";

interface PlaygroundEndpointFormButtonsProps {
    endpoint: ResolvedEndpointDefinition;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
}

export function PlaygroundEndpointFormButtons({
    endpoint,
    resetWithExample,
    resetWithoutExample,
}: PlaygroundEndpointFormButtonsProps): ReactElement {
    const activeNavigatable = useAtomValue(CURRENT_NODE_ATOM);
    const apiReferenceId = FernNavigation.utils.getApiReferenceId(activeNavigatable);
    const closePlayground = useClosePlayground();
    return (
        <div className="flex justify-between items-center">
            <FernButtonGroup>
                <FernButton onClick={resetWithExample} size="small" variant="minimal">
                    Use example
                </FernButton>
                <FernButton onClick={resetWithoutExample} size="small" variant="minimal">
                    Clear form
                </FernButton>
            </FernButtonGroup>

            <FernLink
                href={`/${endpoint.slug}`}
                shallow={apiReferenceId === endpoint.apiSectionId}
                className="t-muted inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:t-accent hover:decoration-2"
                onClick={closePlayground}
            >
                <span>View in API Reference</span>
                <ArrowTopRightIcon className="size-4" />
            </FernLink>
        </div>
    );
}
