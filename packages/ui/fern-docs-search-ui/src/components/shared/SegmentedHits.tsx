import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { last, uniq } from "es-toolkit/array";
import { ReactElement, RefObject, useDeferredValue } from "react";
import { useHits } from "react-instantsearch";
import { MarkRequired } from "ts-essentials";
import { AlgoliaRecordHit } from "../types";
import { ArrowTurnDownLeftIcon } from "./ArrowTurnDownLeftIcon";
import { HitContent } from "./HitContent";
import { LinkComponentType } from "./LinkComponent";
import { SegmentedHitsRadioGroup } from "./SegmentedHitsRadioGroup";

interface HitProps {
    hit: AlgoliaRecordHit;
    LinkComponent: LinkComponentType;
}

function Hit({ hit, LinkComponent }: HitProps): ReactElement | null {
    if (hit.type == null) {
        return null;
    }
    return (
        <RadioGroup.Item
            value={hit.objectID}
            className="mx-2 p-2 rounded-md hover:bg-[#CCC]/30 data-[state=checked]:bg-[#CCC]/30 text-left block"
        >
            <LinkComponent hit={{ pathname: hit.pathname ?? "", hash: hit.hash ?? "" }} className="flex gap-2">
                <div className="flex-1">
                    <HitContent hit={hit as MarkRequired<AlgoliaRecordHit, "type">} />
                </div>
                <RadioGroup.Indicator asChild>
                    <ArrowTurnDownLeftIcon className="size-3 text-[#969696] shrink-0" />
                </RadioGroup.Indicator>
            </LinkComponent>
        </RadioGroup.Item>
    );
}

const DEFAULT_SEGMENT = "__internal_segment_default__";

export function SegmentedHits({
    inputRef,
    LinkComponent,
}: {
    inputRef: RefObject<HTMLInputElement>;
    LinkComponent: LinkComponentType;
}): ReactElement {
    const { items: rawHits } = useHits<AlgoliaRecord>();

    // avoid unnecessary re-renders while the user is typing
    const items = useDeferredValue(rawHits);

    // NOTE: the items from `useHits` gets re-ordered whenever the query changes, so we should NOT memoize any of the following logic:

    // Search hits are ordered, but we want to group the search results thematically.
    const segments: string[] = [DEFAULT_SEGMENT];

    const segmentedHits: Record<string, AlgoliaRecordHit[]> = {
        [DEFAULT_SEGMENT]: [],
    };

    items.forEach((item) => {
        // the last item in the breadcrumb is the most specific, so we use that as the segment
        // if no breadcrumb exists, we use the tab title. We don't include the version or product here because they should be filtered out up-stream.
        const segment = last(item.breadcrumb)?.title ?? item.tab?.title ?? DEFAULT_SEGMENT;

        segments.push(segment);
        segmentedHits[segment] ??= [];
        segmentedHits[segment].push(item);
    });

    const uniqueSegments = uniq(segments).filter(
        (segment) => segmentedHits[segment] != null && segmentedHits[segment].length > 0,
    );

    // this will be used to determine the order of hits wrt keyboard navigation
    const orderedObjectIDs = uniqueSegments.flatMap((segment) => segmentedHits[segment]?.map((hit) => hit.objectID));

    // this will be used to "skip" over hits in the same segment when navigating with the keyboard
    const segmentsIndices: { segment: string; index: number }[] = [];
    uniqueSegments.forEach((segment) => {
        const lastSegment = last(segmentsIndices);
        if (lastSegment == null) {
            segmentsIndices.push({ segment, index: 0 });
        } else {
            segmentsIndices.push({
                segment,
                index: lastSegment.index + (segmentedHits[lastSegment.segment]?.length ?? 0),
            });
        }
    });

    return (
        <SegmentedHitsRadioGroup
            orderedObjectIDs={orderedObjectIDs}
            segmentsIndices={segmentsIndices}
            inputRef={inputRef}
        >
            {uniqueSegments.map((segment) => (
                <section key={segment} className="mb-3 flex flex-col justify-stretch">
                    {segment !== DEFAULT_SEGMENT && (
                        <h6 className="text-xs font-semibold text-[#969696] px-4 my-1">{segment}</h6>
                    )}

                    {segmentedHits[segment]?.map((hit) => (
                        <Hit key={hit.objectID} hit={hit} LinkComponent={LinkComponent} />
                    ))}
                </section>
            ))}
        </SegmentedHitsRadioGroup>
    );
}
