import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import { capturePosthogEvent } from "../../analytics/posthog";
import { Callout } from "./Callout";

export declare namespace MdxErrorBoundary {
    export interface Props {
        error: unknown;
        resetErrorBoundary?: () => void;
    }
}

export const MdxErrorBoundary: React.FC<MdxErrorBoundary.Props> = ({ error, resetErrorBoundary }) => {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (_route: string, options: { shallow: boolean }) => {
            if (!options.shallow) {
                resetErrorBoundary?.();
            }
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [resetErrorBoundary, router.events]);

    const stringifiedError = useMemo(() => {
        if (typeof error === "string") {
            return error;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return JSON.stringify(error);
    }, [error]);

    useEffect(() => capturePosthogEvent("failed_to_render_mdx", { error }), [error]);

    return (
        <Callout intent="error" title="Failed to render">
            <pre className="pre t-muted bg-tag-default mt-4 whitespace-normal rounded p-4">{stringifiedError}</pre>
        </Callout>
    );
};
