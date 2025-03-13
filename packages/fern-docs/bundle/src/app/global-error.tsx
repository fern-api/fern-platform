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
