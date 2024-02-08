import { FC } from "react";
import { FernButton } from "../components/FernButton";
import { ApiPlaygroundSelectionState } from "./ApiPlayground";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";

export const ApiPlaygroundButton: FC<ApiPlaygroundSelectionState> = ({ apiSection, apiDefinition, endpoint }) => {
    const { hasPlayground, setSelectionStateAndOpen } = useApiPlaygroundContext();

    if (!hasPlayground) {
        return null;
    }

    return (
        <FernButton
            onClick={() => {
                setSelectionStateAndOpen({ apiSection, apiDefinition, endpoint });
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
