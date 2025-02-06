"use client";

import { ReactNode } from "react";
import { BottomNavigationNeighbors } from "../components/BottomNavigationNeighbors";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import {
  BuiltWithFern,
  HideBuiltWithFernContext,
} from "../sidebar/BuiltWithFern";

export default function ApiEndpointLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <FernErrorBoundary component="ApiEndpointPage">
        <HideBuiltWithFernContext.Provider value={true}>
          {children}
        </HideBuiltWithFernContext.Provider>
      </FernErrorBoundary>
      <div className="px-4 md:px-6 lg:hidden lg:px-8">
        <BottomNavigationNeighbors />
      </div>
      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </>
  );
}
