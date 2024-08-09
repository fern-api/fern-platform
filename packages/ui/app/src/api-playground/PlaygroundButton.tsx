import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useAtomValue } from "jotai";
import { FC } from "react";
import { HAS_PLAYGROUND_ATOM, useSetAndOpenPlayground } from "../atoms";
import { ResolvedExampleEndpointCall } from "../resolver/types";

export const PlaygroundButton: FC<{
    state: FernNavigation.NavigationNodeApiLeaf;
    example?: ResolvedExampleEndpointCall;
    language?: string;
}> = ({ state, example, language }) => {
    const openPlayground = useSetAndOpenPlayground();
    const hasPlayground = useAtomValue(HAS_PLAYGROUND_ATOM);

    if (!hasPlayground) {
        return null;
    }

    console.log(state);

    return (
        <FernTooltipProvider>
            <FernTooltip
                content={
                    <span>
                        Customize and run in <span className="font-semibold t-accent">API Playground</span>
                    </span>
                }
            >
                <FernButton
                    onClick={() => openPlayground(state)}
                    rightIcon="play"
                    variant="outlined"
                    intent="primary"
                    size="small"
                    mono={true}
                >
                    Play
                </FernButton>
            </FernTooltip>
        </FernTooltipProvider>
    );
};
