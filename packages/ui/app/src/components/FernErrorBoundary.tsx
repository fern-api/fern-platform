import { memoize } from "lodash-es";
import { useRouter } from "next/router";
import React, { PropsWithChildren, ReactElement, useEffect, useMemo } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { capturePosthogEvent } from "../analytics/posthog";
import { Callout } from "../mdx/components/Callout";

export declare interface FernErrorBoundaryProps {
    error: unknown;
    resetErrorBoundary?: () => void;
    type: string;
}

export const FernErrorBoundaryInternal: React.FC<FernErrorBoundaryProps> = ({ type, error, resetErrorBoundary }) => {
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

    useEffect(() => capturePosthogEvent(`failed_to_render_${type}`, { error }), [error, type]);

    return (
        <Callout intent="error" title="Failed to render">
            <pre className="pre t-muted bg-tag-default mt-4 whitespace-normal rounded p-4">{stringifiedError}</pre>
        </Callout>
    );
};

const getFallbackComponent = memoize(function getFallbackComponent(type: string) {
    return function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
        return <FernErrorBoundaryInternal error={error} resetErrorBoundary={resetErrorBoundary} type={type} />;
    };
});

export function FernErrorBoundary({ children, type }: PropsWithChildren<{ type: string }>): ReactElement {
    return <ErrorBoundary FallbackComponent={getFallbackComponent(type)}>{children}</ErrorBoundary>;
}
