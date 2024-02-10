import { FC } from "react";
import { FernButton } from "../components/FernButton";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundSelectionState } from "./ApiPlaygroundDrawer";

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
