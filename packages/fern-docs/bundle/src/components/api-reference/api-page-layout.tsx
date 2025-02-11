import { ReactNode } from "react";

import { BuiltWithFern, HideBuiltWithFern } from "@/components/built-with-fern";
import { ErrorBoundary } from "@/components/error-boundary";

import { BottomNavigationNeighbors } from "../components/BottomNavigationNeighbors";

export function ApiPageLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <HideBuiltWithFern>
        <ErrorBoundary>{children}</ErrorBoundary>
      </HideBuiltWithFern>
      <div className="px-4 md:px-6 lg:hidden lg:px-8">
        <BottomNavigationNeighbors />
      </div>
      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </>
  );
}
