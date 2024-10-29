import { VisibleAlgoliaRecord } from "@fern-ui/fern-docs-search-server/src/algolia/types";
import * as RadioGroup from "@radix-ui/react-radio-group";
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
        <RadioGroup.Item
            value={hit.objectID}
            className="mx-2 p-2 rounded-md hover:bg-[#CCC]/30 data-[state=checked]:bg-[#CCC]/30 text-left block"
        >
            <Link href={`${hit.pathname ?? ""}${hit.hash ?? ""}`} className="block w-full" tabIndex={-1}>
                <HitContent hit={hit as MarkRequired<AlgoliaRecordHit, "type">} />
            </Link>
        </RadioGroup.Item>
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
        <RadioGroup.Root>
            {uniq(segments).map((segment) => (
                <section key={segment} className="mb-2 flex flex-col justify-stretch">
                    <h6 className="text-xs font-bold text-[#969696] px-4 my-1">{segment}</h6>

                    {segmentedHits[segment]?.map((hit) => <Hit key={hit.objectID} hit={hit} />)}
                </section>
            ))}
        </RadioGroup.Root>
    );
}
