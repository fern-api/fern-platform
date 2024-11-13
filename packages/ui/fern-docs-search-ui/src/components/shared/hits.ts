import { last, uniq } from "es-toolkit/array";
import { AlgoliaRecordHit } from "../types";

export interface GroupedHits {
    title?: string;
    hits: {
        title: string;
        path: string;
        icon?: string;
        record?: AlgoliaRecordHit;
    }[];
}

const DEFAULT_SEGMENT = "__internal_segment_default__";

export function generateHits(items: AlgoliaRecordHit[]): GroupedHits[] {
    return groupHits(items);
}

function groupHits(items: AlgoliaRecordHit[]): GroupedHits[] {
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
    // const paths = uniqueSegments.flatMap((segment) =>
    //     segmentedHits[segment]?.map((hit) => `${hit.pathname}${hit.hash ?? ""}`),
    // );

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

    return uniqueSegments.map((segment) => ({
        title: segment === DEFAULT_SEGMENT ? undefined : segment,
        hits: segmentedHits[segment]?.map((hit) => ({
            title: hit.title,
            path: `${hit.pathname}${hit.hash ?? ""}`,
            icon: hit.icon,
            record: hit,
        })),
    }));
}
