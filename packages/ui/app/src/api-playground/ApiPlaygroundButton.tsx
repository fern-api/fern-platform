import { FC } from "react";
import { FernButton } from "../components/FernButton";
import { FernTooltip, FernTooltipProvider } from "../components/FernTooltip";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundSelectionState } from "./ApiPlaygroundDrawer";

export const ApiPlaygroundButton: FC<ApiPlaygroundSelectionState> = ({ api, endpointId }) => {
    const { hasPlayground, setSelectionStateAndOpen } = useApiPlaygroundContext();

    if (!hasPlayground) {
        return null;
    }

    return (
        <FernTooltipProvider>
            <FernTooltip
                content={
                    <span>
                        Customize and run in <span className="text-accent-primary font-semibold">API Playground</span>
                    </span>
                }
            >
                <FernButton
                    onClick={() => {
                        setSelectionStateAndOpen({ api, endpointId });
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
