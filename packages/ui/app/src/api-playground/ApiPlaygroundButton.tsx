import { Play } from "@blueprintjs/icons";
import { FC } from "react";
import { ApiPlaygroundSelectionState } from "./ApiPlayground";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";

export const ApiPlaygroundButton: FC<ApiPlaygroundSelectionState> = ({ apiSection, apiDefinition, endpoint }) => {
    const { hasPlayground, setSelectionStateAndOpen } = useApiPlaygroundContext();

    if (!hasPlayground) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={() => {
                setSelectionStateAndOpen({ apiSection, apiDefinition, endpoint });
            }}
            className="hover:bg-tag-primary ring-border-primary dark:ring-border-primary-dark flex items-center gap-1 rounded-lg px-2 py-1 text-xs ring-1 hover:ring-2"
        >
            <span className="text-accent-primary dark:text-accent-primary-dark font-mono tracking-tight">Play</span>
            <Play className="text-accent-primary dark:text-accent-primary-dark -mr-1" />
        </button>
    );
};
