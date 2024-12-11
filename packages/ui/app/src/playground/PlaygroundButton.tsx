import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { PlaySolid } from "iconoir-react";
import { useAtomValue } from "jotai";
import { FC } from "react";
import { IS_PLAYGROUND_ENABLED_ATOM, useOpenPlayground } from "../atoms";
import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";

export const PlaygroundButton: FC<{
    state: FernNavigation.NavigationNodeApiLeaf;
}> = ({ state }) => {
    const openPlayground = useOpenPlayground();
    const isPlaygroundEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
    const settings = usePlaygroundSettings(state.id);

    if (!isPlaygroundEnabled) {
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
                asChild
            >
                <FernButton
                    aria-description={
                        settings?.button?.href ? "Opens an API Playground in a new tab" : "Opens the API Playground"
                    }
                    onClick={() => {
                        if (settings?.button?.href) {
                            // open custom playground in new tab
                            // note: this code implies the current page as the Referrer and the new window can refer
                            // to the current `window` through their `window.opener`.
                            window.open(settings.button.href, "_blank");
                        } else {
                            void openPlayground(state);
                        }
                    }}
                    rightIcon={<PlaySolid />}
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
