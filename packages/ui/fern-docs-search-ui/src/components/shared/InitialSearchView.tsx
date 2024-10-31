import { ReactElement, RefObject } from "react";
import { LinkComponentType } from "./LinkComponent";
import { SearchHitRadioItem } from "./SearchHitRadioItem";
import { SegmentedHitsRadioGroup } from "./SegmentedHitsRadioGroup";

export function InitialSearchView({
    initialResults,
    inputRef,
    LinkComponent,
}: {
    initialResults: {
        tabs: { title: string; pathname: string }[];
        products: { id: string; title: string; pathname: string }[];
        versions: { id: string; title: string; pathname: string }[];
    };
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

    return (
        <SegmentedHitsRadioGroup paths={initialResults.tabs.map((tab) => tab.pathname)} inputRef={inputRef}>
            {initialResults.tabs.length > 0 && (
                <section className="mb-2 flex flex-col justify-stretch">
                    {initialResults.tabs.map((tab) => (
                        <SearchHitRadioItem key={tab.pathname} LinkComponent={LinkComponent} pathname={tab.pathname}>
                            {tab.title}
                        </SearchHitRadioItem>
                    ))}
                </section>
            )}
        </SegmentedHitsRadioGroup>
    );
}
