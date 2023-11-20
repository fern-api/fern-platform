import { IconNames } from "@blueprintjs/icons";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const NonIdealState = dynamic(() =>
    import("@blueprintjs/core/lib/esm/components/non-ideal-state/nonIdealState").then(
        ({ NonIdealState }) => NonIdealState
    )
);

export declare namespace MdxErrorBoundaryContent {
    export interface Props {
        error: unknown;
    }
}

export const MdxErrorBoundaryContent: React.FC<MdxErrorBoundaryContent.Props> = ({ error }) => {
    const stringifiedError = useMemo(() => {
        if (typeof error === "string") {
            return error;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return JSON.stringify(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center">
            <NonIdealState icon={IconNames.WarningSign} title="Failed to render" />
            <pre className="pre t-muted mt-6 max-w-[500px] whitespace-normal rounded bg-black/30 p-5">
                {stringifiedError}
            </pre>
        </div>
    );
};
