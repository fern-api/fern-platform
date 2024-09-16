import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernButtonGroup } from "@fern-ui/components";
import { ArrowUpRight } from "iconoir-react";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { CURRENT_NODE_ATOM, useClosePlayground } from "../../atoms";
import { FernLink } from "../../components/FernLink";
import { ResolvedEndpointDefinition } from "../../resolver/types";

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
        <div className="flex items-center justify-between">
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
                shallow={apiReferenceId === endpoint.apiDefinitionId}
                className="t-muted hover:t-accent inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
                onClick={closePlayground}
            >
                <span>View in API Reference</span>
                <ArrowUpRight className="size-icon" />
            </FernLink>
        </div>
    );
}
