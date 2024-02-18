import { FC } from "react";
import { FernButton } from "../components/FernButton";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundSelectionState } from "./ApiPlaygroundDrawer";

export const ApiPlaygroundButton: FC<ApiPlaygroundSelectionState> = ({ api, endpointId }) => {
    const { hasPlayground, setSelectionStateAndOpen } = useApiPlaygroundContext();

    if (!hasPlayground) {
        return null;
    }

    return (
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
    );
};
