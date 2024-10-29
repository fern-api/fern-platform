import { VisibleAlgoliaRecord } from "@fern-ui/fern-docs-search-server/src/algolia/types";
import { last, uniq } from "es-toolkit/array";
import Link from "next/link";
import { ReactElement } from "react";
import { useHits } from "react-instantsearch";
import { MarkRequired } from "ts-essentials";
import { AlgoliaRecordHit } from "../types";
import { HitContent } from "./HitContent";

function Hit({ hit }: { hit: AlgoliaRecordHit }): ReactElement | null {
    if (hit.type == null) {
        return null;
    }
    return (
        <Link href={`${hit.pathname ?? ""}${hit.hash ?? ""}`} className="block mx-2 p-2 rounded-md hover:bg-[#CCC]/30">
            <HitContent hit={hit as MarkRequired<AlgoliaRecordHit, "type">} />
        </Link>
    );
}

export function SegmentedHits(): ReactElement {
    const { items } = useHits<VisibleAlgoliaRecord>();

    const segments: string[] = [];

    const segmentedHits: Record<string, AlgoliaRecordHit[]> = {};

    items.forEach((item) => {
        const segment = last(item.breadcrumb)?.title ?? item.tab?.title ?? item.type;

        if (!segment) {
            return;
        }

        segments.push(segment);

        if (segmentedHits[segment] == null) {
            segmentedHits[segment] = [];
        }

        segmentedHits[segment].push(item);
    });

    return (
        <>
            {uniq(segments).map((segment) => (
                <section key={segment}>
                    <h6 className="text-xs font-bold text-[#969696] px-4 my-1">{segment}</h6>

                    {segmentedHits[segment]?.map((hit) => <Hit key={hit.objectID} hit={hit} />)}
                </section>
            ))}
        </>
    );
}
