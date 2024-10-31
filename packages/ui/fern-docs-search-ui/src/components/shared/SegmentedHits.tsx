import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { last, uniq } from "es-toolkit/array";
import { ReactElement, RefObject, useDeferredValue } from "react";
import { useHits } from "react-instantsearch";
import { MarkRequired } from "ts-essentials";
import { AlgoliaRecordHit } from "../types";
import { HitContent } from "./HitContent";
import { LinkComponentType } from "./LinkComponent";
import { SearchHitRadioItem } from "./SearchHitRadioItem";
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
        <SearchHitRadioItem
            LinkComponent={LinkComponent}
            pathname={hit.pathname}
            hash={hit.hash}
            type={hit.type}
            icon={hit.icon}
        >
            <HitContent hit={hit as MarkRequired<AlgoliaRecordHit, "type">} />
        </SearchHitRadioItem>
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
    const paths = uniqueSegments.flatMap((segment) =>
        segmentedHits[segment]?.map((hit) => `${hit.pathname}${hit.hash ?? ""}`),
    );

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
        <SegmentedHitsRadioGroup paths={paths} segmentsIndices={segmentsIndices} inputRef={inputRef}>
            {uniqueSegments.map((segment) => (
                <section key={segment} className="mb-2 flex flex-col justify-stretch">
                    {segment !== DEFAULT_SEGMENT && (
                        <h6 className="text-xs font-semibold text-[#969696] dark:text-white/50 px-4 my-1">{segment}</h6>
                    )}

                    {segmentedHits[segment]?.map((hit) => (
                        <Hit key={hit.objectID} hit={hit} LinkComponent={LinkComponent} />
                    ))}
                </section>
            ))}
        </SegmentedHitsRadioGroup>
    );
}
