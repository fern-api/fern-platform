import { InitialResultsResponse } from "@/server/browse-results";
import { groupBy } from "es-toolkit";
import { ReactElement, RefObject } from "react";
import { LinkComponentType } from "./LinkComponent";
import { SearchHitRadioItem } from "./SearchHitRadioItem";
import { SegmentedHitsRadioGroup } from "./SegmentedHitsRadioGroup";

const DEFAULT_SEGMENT = "__internal_segment_default__";

export function InitialSearchView({
    initialResults,
    inputRef,
    LinkComponent,
}: {
    initialResults: InitialResultsResponse;
    inputRef: RefObject<HTMLInputElement>;
    LinkComponent: LinkComponentType;
}): ReactElement | false {
    if (
        initialResults.tabs.length === 0 &&
        initialResults.products.length === 0 &&
        initialResults.versions.length === 0
    ) {
        return false;
    }

    const sections = Object.entries(groupBy(initialResults.tabs, (tab) => tab.version ?? DEFAULT_SEGMENT));

    return (
        <SegmentedHitsRadioGroup paths={initialResults.tabs.map((tab) => tab.pathname)} inputRef={inputRef}>
            {sections.map(([segment, tabs]) => (
                <section key={segment} className="mb-2 flex flex-col justify-stretch">
                    {segment !== DEFAULT_SEGMENT && (
                        <h6 className="text-xs font-semibold text-[#969696] dark:text-white/50 px-4 my-1">{segment}</h6>
                    )}
                    {tabs.map((tab) => (
                        <SearchHitRadioItem
                            key={tab.pathname}
                            LinkComponent={LinkComponent}
                            path={tab.pathname}
                            icon={tab.icon}
                        >
                            {tab.title}
                        </SearchHitRadioItem>
                    ))}
                </section>
            ))}
        </SegmentedHitsRadioGroup>
    );
}
