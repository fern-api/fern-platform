import { ReactElement } from "react";

import { PlaygroundCardSkeleton } from "./PlaygroundCardSkeleton";

export function PlaygroundEndpointFormSectionSkeleton(): ReactElement<any> {
  return (
    <section>
      <PlaygroundCardSkeleton className="mb-4 w-fit">
        <h5 className="inline">Parameters</h5>
      </PlaygroundCardSkeleton>
      <PlaygroundCardSkeleton className="h-32" />
    </section>
  );
}
