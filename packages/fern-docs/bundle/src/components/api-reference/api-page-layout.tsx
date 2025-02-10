import { ReactNode } from "react";

import { BuiltWithFern, HideBuiltWithFern } from "@/components/built-with-fern";

import { BottomNavigationNeighbors } from "../components/BottomNavigationNeighbors";
import { FernErrorBoundary } from "../components/FernErrorBoundary";

export function ApiPageLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <FernErrorBoundary component="ApiEndpointPage">
        <HideBuiltWithFern>{children}</HideBuiltWithFern>
      </FernErrorBoundary>
      <div className="px-4 md:px-6 lg:hidden lg:px-8">
        <BottomNavigationNeighbors />
      </div>
      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </>
  );
}
