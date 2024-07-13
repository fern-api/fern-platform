import { IS_LOCAL_PREVIEW_ATOM } from "@/atoms";
import { FernButton } from "@fern-ui/components";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { memoize } from "lodash-es";
import { Router, useRouter } from "next/router";
import React, { PropsWithChildren, ReactElement, useEffect } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { captureSentryError, captureSentryErrorMessage } from "../analytics/sentry";

export declare interface FernErrorBoundaryProps {
    component?: string; // component displayName where the error occurred
    error: unknown;
    className?: string;
    resetErrorBoundary?: () => void;
    reset?: () => void;
    refreshOnError?: boolean;
    showError?: boolean;
}

export function FernErrorTag({
    component,
    error,
    className,
    errorDescription,
    showError,
    reset,
    resetErrorBoundary,
}: {
    component: string; // component displayName where the error occurred
    error: unknown;
    className?: string;
    errorDescription?: string;
    showError?: boolean;
    reset?: () => void;
    resetErrorBoundary?: () => void;
}): ReactElement | null {
    const isLocalPreview = useAtomValue(IS_LOCAL_PREVIEW_ATOM);
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error(error);
        captureSentryError(error, {
            context: component,
            errorSource: "FernErrorTag",
            errorDescription:
                errorDescription ??
                "An unknown UI error occurred. This could be a critical user-facing error that should be investigated.",
        });
    }, [component, error, errorDescription]);

    // if local preview, always show the error tag for markdown errors
    const showMarkdownError = isLocalPreview && component === "MdxErrorBoundary";

    if (showError || showMarkdownError) {
        return (
            <div className={clsx(className ?? "my-4")}>
                <span className="t-danger inline-flex items-center gap-2 rounded-full bg-tag-danger px-2">
                    <ExclamationTriangleIcon />
                    <span>{stringifyError(error)}</span>
                    {reset != null && (
                        <FernButton
                            icon={<ReloadIcon />}
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
}) => {
    const router = useRouter();

    useEffect(() => {
        if (refreshOnError) {
            // eslint-disable-next-line no-console
            captureSentryErrorMessage("Fern Docs crashed. Reloading the page might fix the issue.");
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
