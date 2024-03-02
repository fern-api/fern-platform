import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import { FallbackProps } from "react-error-boundary";
import { Callout } from "./components/Callout";

export declare namespace MdxErrorBoundaryContent {
    export interface Props {
        error: unknown;
    }
}

export const MdxErrorBoundaryContent: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (_route: string, options: { shallow: boolean }) => {
            if (!options.shallow) {
                resetErrorBoundary();
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

    return (
        <Callout intent="danger">
            <h4>Failed to render</h4>
            <pre className="pre t-muted bg-tag-default mt-4 whitespace-normal rounded p-4">{stringifiedError}</pre>
        </Callout>
    );
};
