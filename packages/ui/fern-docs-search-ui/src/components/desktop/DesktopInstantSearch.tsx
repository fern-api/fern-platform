"use client";

import { liteClient as algoliasearch } from "algoliasearch/lite";
import "instantsearch.css/themes/reset.css";
import { useEffect, useRef, type ReactElement } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { SegmentedHits } from "../shared/SegmentedHits";
import { useTrapFocus } from "../shared/useTrapFocus";
import { DesktopSearchBox } from "./DesktopSearchBox";

interface DesktopInstantSearchProps {
    appId: string;
    apiKey: string;
}

export function DesktopInstantSearch({ appId, apiKey }: DesktopInstantSearchProps): ReactElement {
    const ref = useRef(algoliasearch(appId, apiKey));
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ref.current.setClientApiKey({ apiKey });
    }, [apiKey]);

    useTrapFocus({ container: containerRef.current });

    return (
        <div className="w-96">
            <InstantSearchNext
                searchClient={ref.current}
                indexName="fern-docs-search"
                future={{ preserveSharedStateOnUnmount: true }}
            >
                <Configure
                    restrictHighlightAndSnippetArrays={true}
                    distinct={true}
                    attributesToSnippet={["description:10", "content:16"]}
                />
                <div
                    className="flex flex-col gap-2 border border-[#DBDBDB] rounded-lg overflow-hidden bg-[#F2F2F2]/30 backdrop-blur-xl"
                    ref={containerRef}
                >
                    <DesktopSearchBox
                        formClassName="p-4"
                        inputClassName="w-full focus:outline-none bg-transparent text-lg placeholder:text-[#969696]"
                        placeholder="Search"
                        autoFocus
                        formRef={formRef}
                        inputRef={inputRef}
                        onClick={() => {
                            inputRef.current?.focus();
                        }}
                        isFromSelection={false}
                    />
                    <SegmentedHits />
                </div>
            </InstantSearchNext>
        </div>
    );
}
