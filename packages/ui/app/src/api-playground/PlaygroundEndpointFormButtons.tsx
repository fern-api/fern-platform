import { FernButton, FernButtonGroup } from "@fern-ui/components";
import { joinUrlSlugs, SidebarNode } from "@fern-ui/fdr-utils";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { useSetAtom } from "jotai";
import { ReactElement } from "react";
import { FernLink } from "../components/FernLink";
import { useNavigationContext } from "../contexts/navigation-context";
import { ResolvedEndpointDefinition } from "../resolver/types";
import { PLAYGROUND_OPEN_ATOM } from "./PlaygroundContext";

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
    const { activeNavigatable } = useNavigationContext();
    const setPlaygroundOpen = useSetAtom(PLAYGROUND_OPEN_ATOM);
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
                href={`/${joinUrlSlugs(...endpoint.slug)}`}
                shallow={
                    activeNavigatable != null &&
                    SidebarNode.isApiPage(activeNavigatable) &&
                    activeNavigatable.api === endpoint.apiSectionId
                }
                className="t-muted inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:t-accent hover:decoration-2"
                onClick={() => setPlaygroundOpen(false)}
            >
                <span>View in API Reference</span>
                <ArrowTopRightIcon className="size-4" />
            </FernLink>
        </div>
    );
}
