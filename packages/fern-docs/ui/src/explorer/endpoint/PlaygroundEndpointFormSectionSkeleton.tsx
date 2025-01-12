import { ReactElement } from "react";
import { ExplorerCardSkeleton } from "./ExplorerCardSkeleton";

export function ExplorerEndpointFormSectionSkeleton(): ReactElement {
  return (
    <section>
      <ExplorerCardSkeleton className="mb-4 w-fit">
        <h5 className="inline">Parameters</h5>
      </ExplorerCardSkeleton>
      <ExplorerCardSkeleton className="h-32" />
    </section>
  );
}
