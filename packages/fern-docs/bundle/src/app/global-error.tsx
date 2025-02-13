"use client";

import { ErrorBoundaryFallback } from "@/components/error-boundary";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorBoundaryFallback
          error={error}
          resetErrorBoundary={reset}
          className="h-screen"
        />
      </body>
    </html>
  );
}
