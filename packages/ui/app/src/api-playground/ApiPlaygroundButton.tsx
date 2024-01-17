import { Play } from "@blueprintjs/icons";
import { FC, useCallback } from "react";
import { ApiPlaygroundSelectionState, useApiPlaygroundContext } from "./ApiPlaygroundContext";

export const ApiPlaygroundButton: FC<ApiPlaygroundSelectionState> = ({ apiId, endpoint, package: _package, slug }) => {
    const { setSelectionStateAndOpen } = useApiPlaygroundContext();
    const handleClick = useCallback(() => {
        setSelectionStateAndOpen({ apiId, endpoint, package: _package, slug });
    }, [setSelectionStateAndOpen, apiId, endpoint, _package, slug]);
    return (
        <button
            type="button"
            onClick={handleClick}
            className="hover:bg-tag-primary ring-border-primary dark:ring-border-primary-dark flex items-center gap-1 rounded-lg px-2 py-1 text-xs ring-1 hover:ring-2"
        >
            <span className="text-accent-primary dark:text-accent-primary-dark font-mono tracking-tight">Play</span>
            <Play className="text-accent-primary dark:text-accent-primary-dark -mr-1" />
        </button>
    );
};
