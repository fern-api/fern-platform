import { FernNavigation } from "@fern-api/fdr-sdk";
import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useAtomValue } from "jotai";
import { FC } from "react";
import { HAS_PLAYGROUND_ATOM } from "../atoms/playground";
import { PORTAL_CONTAINER } from "../atoms/portal";
import { useSetAndOpenPlayground } from "./PlaygroundContext";

export const PlaygroundButton: FC<{ state: FernNavigation.NavigationNodeApiLeaf }> = ({ state }) => {
    const setSelectionStateAndOpen = useSetAndOpenPlayground();
    const hasPlayground = useAtomValue(HAS_PLAYGROUND_ATOM);
    const portalContainer = useAtomValue(PORTAL_CONTAINER);

    if (!hasPlayground) {
        return null;
    }

    return (
        <FernTooltipProvider>
            <FernTooltip
                content={
                    <span>
                        Customize and run in <span className="font-semibold t-accent">API Playground</span>
                    </span>
                }
                container={portalContainer}
            >
                <FernButton
                    onClick={() => {
                        setSelectionStateAndOpen(state);
                    }}
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
