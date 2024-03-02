import React, { useEffect, useMemo } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { Callout } from "./components/Callout";

export declare namespace MdxErrorBoundaryContent {
    export interface Props {
        error: unknown;
    }
}

export const MdxErrorBoundaryContent: React.FC<MdxErrorBoundaryContent.Props> = ({ error }) => {
    useEffect(() => {
        capturePosthogEvent("failed_to_render_mdx");
    }, []);

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
        <Callout intent="danger">
            <h4>Failed to render</h4>
            <pre className="pre t-muted bg-tag-default mt-4 whitespace-normal rounded p-4">{stringifiedError}</pre>
        </Callout>
    );
};
