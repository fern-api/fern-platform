import React, { useMemo } from "react";
import { Callout } from "./components/Callout";

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
        <Callout intent="warn">
            <h4>Failed to render</h4>
            <pre className="pre t-muted mt-6 whitespace-normal rounded bg-black/30 p-5">{stringifiedError}</pre>
        </Callout>
    );
};
