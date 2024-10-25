import { FernButton } from "@fern-ui/components";
import clsx from "clsx";
import { memoize } from "es-toolkit/function";
import { RefreshDouble, WarningTriangle } from "iconoir-react";
import { Router, useRouter } from "next/router";
import React, { PropsWithChildren, ReactElement, ReactNode, useEffect } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useIsLocalPreview } from "../contexts/local-preview";

export declare interface FernErrorBoundaryProps {
    component?: string; // component displayName where the error occurred
    error: unknown;
    className?: string;
    resetErrorBoundary?: () => void;
    reset?: () => void;
    refreshOnError?: boolean;
    showError?: boolean;
    fallback?: ReactNode;
}

export function FernErrorTag({
    component,
    error,
    className,
    errorDescription,
    showError,
    reset,
    resetErrorBoundary,
    fallback,
}: {
    component: string; // component displayName where the error occurred
    error: unknown;
    className?: string;
    errorDescription?: string;
    showError?: boolean;
    reset?: () => void;
    resetErrorBoundary?: () => void;
    fallback?: ReactNode;
}): ReactElement | null {
    const isLocalPreview = useIsLocalPreview();
    useEffect(() => {
        if (error) {
            // TODO: sentry
            // eslint-disable-next-line no-console
            console.error(
                errorDescription ??
                    "An unknown UI error occurred. This could be a critical user-facing error that should be investigated.",
                error,
            );
        }
    }, [component, error, errorDescription]);

    if (fallback != null) {
        return <>{fallback}</>;
    }

    // if local preview, always show the error tag for markdown errors
    if (showError || isLocalPreview) {
        return (
            <div className={clsx(className ?? "my-4")}>
                <span className="t-danger inline-flex items-center gap-2 rounded-full bg-tag-danger px-2">
                    <WarningTriangle />
                    <span>{stringifyError(error)}</span>
                    {reset != null && (
                        <FernButton
                            icon={<RefreshDouble />}
                            variant="minimal"
                            rounded
                            onClick={() => {
                                reset();
                                resetErrorBoundary?.();
                            }}
                            size="small"
                        />
                    )}
                </span>
            </div>
        );
    }
    return null;
}

export function stringifyError(error: unknown): string {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "An unknown error occurred";
}

const FernErrorBoundaryInternal: React.FC<FernErrorBoundaryProps> = ({
    component,
    className,
    error,
    resetErrorBoundary,
    reset,
    refreshOnError,
    showError,
    fallback,
}) => {
    const router = useRouter();

    useEffect(() => {
        if (refreshOnError) {
            // TODO: sentry
            // eslint-disable-next-line no-console
            console.error("Fern Docs crashed. Reloading the page might fix the issue.");
            router.reload();
        }
    }, [refreshOnError, router]);

    useEffect(() => {
        const handleRouteChange = (_route: string, options: { shallow: boolean }) => {
            if (!options.shallow) {
                resetErrorBoundary?.();
            }
        };
        Router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            Router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [resetErrorBoundary]);

    return (
        <FernErrorTag
            error={error}
            className={className}
            component={component ?? "FernErrorBoundary"}
            showError={showError}
            reset={reset}
            resetErrorBoundary={resetErrorBoundary}
            fallback={fallback}
        />
    );
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
