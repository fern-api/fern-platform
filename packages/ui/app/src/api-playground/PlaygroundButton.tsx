import { FernNavigation } from "@fern-api/fdr-sdk";
import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { FC } from "react";
import { usePlaygroundContext } from "./PlaygroundContext";

export const PlaygroundButton: FC<{ state: FernNavigation.NavigationNodeApiLeaf }> = ({ state }) => {
    const { hasPlayground, setSelectionStateAndOpen } = usePlaygroundContext();

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
            >
                <FernButton
                    onClick={() => {
                        setSelectionStateAndOpen(state);
                    }}
                    rightIcon="play"
                    variant="outlined"
                    intent="primary"
                    size="small"
                    rounded
                >
                    Play
                </FernButton>
            </FernTooltip>
        </FernTooltipProvider>
    );
};
