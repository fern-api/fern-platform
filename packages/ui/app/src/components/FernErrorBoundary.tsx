import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { memoize } from "lodash-es";
import { useRouter } from "next/router";
import React, { PropsWithChildren, ReactElement, useEffect } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { captureSentryError, captureSentryErrorMessage } from "../analytics/sentry";

export declare interface FernErrorBoundaryProps {
    component?: string; // component displayName where the error occurred
    error: unknown;
    className?: string;
    resetErrorBoundary?: () => void;
    refreshOnError?: boolean;
}

export function FernErrorTag({
    component,
    error,
    className,
    errorDescription,
    showError,
}: {
    component: string; // component displayName where the error occurred
    error: unknown;
    className?: string;
    errorDescription?: string;
    showError?: boolean;
}): ReactElement | null {
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
    // TODO: render this error in the UI if in URL-preview, staging, dev, or local-preview model.
    if (showError) {
        return (
            <div className={clsx(className ?? "my-4")}>
                <span className="t-danger inline-flex items-center gap-2 rounded-full bg-tag-danger px-2">
                    <ExclamationTriangleIcon />
                    <span>{stringifyError(error)}</span>
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
    refreshOnError,
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
        router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [resetErrorBoundary, router.events]);

    return <FernErrorTag error={error} className={className} component={component ?? "FernErrorBoundary"} />;
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
