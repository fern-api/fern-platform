"use client";

import { usePathname } from "next/navigation";
import React, {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
} from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

import { FernButton } from "@fern-docs/components";
import clsx from "clsx";
import { memoize } from "es-toolkit/function";
import { RefreshDouble, WarningTriangle } from "iconoir-react";

import { useIsLocalPreview } from "../contexts/local-preview";

export declare interface FernErrorBoundaryProps {
  component?: string; // component displayName where the error occurred
  error: unknown;
  className?: string;
  resetErrorBoundary?: () => void;
  reset?: () => void;
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
}): ReactElement<any> | null {
  const isLocalPreview = useIsLocalPreview();
  useEffect(() => {
    if (error) {
      // TODO: sentry

      console.error(
        errorDescription ??
          "An unknown UI error occurred. This could be a critical user-facing error that should be investigated.",
        error
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
        <span className="t-danger bg-tag-danger inline-flex items-center gap-2 rounded-full px-2">
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
  showError,
  fallback,
}) => {
  // if path changes, reset the error boundary
  const pathname = usePathname();
  useEffect(() => {
    resetErrorBoundary?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
  props: Omit<FernErrorBoundaryProps, keyof FallbackProps>
) {
  return function FallbackComponent({
    error,
    resetErrorBoundary,
  }: FallbackProps) {
    return (
      <FernErrorBoundaryInternal
        error={error}
        resetErrorBoundary={resetErrorBoundary}
        {...props}
      />
    );
  };
});

export function FernErrorBoundary({
  children,
  ...props
}: PropsWithChildren<
  Omit<FernErrorBoundaryProps, keyof FallbackProps>
>): ReactElement<any> {
  return (
    <ErrorBoundary FallbackComponent={getFallbackComponent(props)}>
      {children}
    </ErrorBoundary>
  );
}
