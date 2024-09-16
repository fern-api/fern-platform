import { ReactElement } from "react";
import { PlaygroundCardSkeleton } from "./PlaygroundCardSkeleton";

export function PlaygroundEndpointFormSectionSkeleton(): ReactElement {
    return (
        <section>
            <PlaygroundCardSkeleton className="w-fit mb-4">
                <h5 className="inline">Parameters</h5>
            </PlaygroundCardSkeleton>
            <PlaygroundCardSkeleton className="h-32" />
        </section>
    );
}
