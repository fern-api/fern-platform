"use client";

import { redirect, useSearchParams } from "next/navigation";

import { ErrorBoundaryFallback } from "@/components/error-boundary";
import { useCurrentPathname } from "@/hooks/use-current-pathname";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const searchParams = useSearchParams();
  const pathname = useCurrentPathname();
  if (!searchParams.has("error")) {
    /**
     * In the middleware, this will result in a redirect to the dynamic page,
     * which will lazy-load the page and allow client-side error handling.
     */
    redirect(`${pathname}?error=${error.message}`);
  }
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
