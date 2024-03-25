import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { memoize } from "lodash-es";
import { useRouter } from "next/router";
import React, { PropsWithChildren, ReactElement, useEffect, useMemo } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { capturePosthogEvent } from "../analytics/posthog";

export declare interface FernErrorBoundaryProps {
    error: unknown;
    className?: string;
    resetErrorBoundary?: () => void;
    type: string;
}

export function FernErrorTag({ error, className }: { error: string; className?: string }): ReactElement {
    return (
        <div className={clsx(className ?? "my-4")}>
            <span className="bg-tag-danger t-danger inline-flex items-center gap-2 rounded-full px-2">
                <ExclamationTriangleIcon />
                <span>{error}</span>
            </span>
        </div>
    );
}

export function stringifyError(error: unknown): string {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return JSON.stringify(error);
}

export const FernErrorBoundaryInternal: React.FC<FernErrorBoundaryProps> = ({
    type,
    className,
    error,
    resetErrorBoundary,
}) => {
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

    const stringifiedError = useMemo(() => stringifyError(error), [error]);

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error(error);
        return capturePosthogEvent(`failed_to_render_${type}`, { error });
    }, [error, type]);

    return <FernErrorTag error={stringifiedError} className={className} />;
};

const getFallbackComponent = memoize(function getFallbackComponent(
    props: Omit<FernErrorBoundaryProps, keyof FallbackProps>,
) {
    return function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
        return <FernErrorBoundaryInternal error={error} resetErrorBoundary={resetErrorBoundary} {...props} />;
    };
});

export function FernErrorBoundary({
    children,
    ...props
}: PropsWithChildren<Omit<FernErrorBoundaryProps, keyof FallbackProps>>): ReactElement {
    return <ErrorBoundary FallbackComponent={getFallbackComponent(props)}>{children}</ErrorBoundary>;
}
