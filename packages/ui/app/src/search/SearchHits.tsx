import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernScrollArea } from "@fern-ui/components";
import { useKeyboardPress } from "@fern-ui/react-commons";
import { getSlugForSearchRecord, type SearchRecord } from "@fern-ui/search-utils";

import { Xmark } from "iconoir-react";
import { useSetAtom } from "jotai";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteHits, useInstantSearch } from "react-instantsearch";
import { COHERE_ASK_AI, COHERE_INITIAL_MESSAGE, useBasePath, useCloseSearchDialog, useFeatureFlags } from "../atoms";
import { Separator } from "../components/Separator";
import { useToHref } from "../hooks/useHref";
import { SearchHit } from "./SearchHit";
import { AskCohereHit } from "./cohere/AskCohereHit";

export const EmptyStateView: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="justify t-muted flex h-24 w-full flex-col hits-center py-3">{children}</div>;
};

const COHERE_AI_HIT_ID = "cohere-ai-hit";

const expandHits = (expanded: boolean, hits: SearchRecord[]) => {
    return expanded ? hits : hits.slice(0, 3);
};

const ExpandButton: React.FC<{ setExpanded: (expanded: boolean) => void }> = ({ setExpanded }) => (
    <div className="flex justify-center pt-2">
        <FernButton
            className="text-left"
            variant="minimal"
            onClick={() => setExpanded(true)}
            icon={<Xmark className="transition rotate-45" />}
        >
            Show More
        </FernButton>
    </div>
);

export const SearchHits: React.FC = () => {
    const { isAiChatbotEnabledInPreview } = useFeatureFlags();
    const basePath = useBasePath();
    const { hits } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();
    const [hoveredSearchHitId, setHoveredSearchHitId] = useState<string | null>(null);
    const router = useRouter();
    const closeSearchDialog = useCloseSearchDialog();
    const [orderedHits, setOrderedHits] = useState<SearchRecord[]>([]);
    const [expandEndpoints, setExpandEndpoints] = useState(false);
    const [expandPages, setExpandPages] = useState(false);
    const [expandFields, setExpandFields] = useState(false);

    const refs = useRef(new Map<string, HTMLAnchorElement>());

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }
        const handleMouseMove = () => {
            document.exitPointerLock();
        };
        document.addEventListener("mousemove", handleMouseMove);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const { endpointHits, pageHits, fieldHits } = filterHits(hits);
        setOrderedHits([
            ...expandHits(expandEndpoints, endpointHits),
            ...expandHits(expandPages, pageHits),
            ...expandHits(expandFields, fieldHits),
        ]);
    }, [hits, expandEndpoints, expandPages, expandFields]);

    const hoveredSearchHit = useMemo(() => {
        return orderedHits
            .map((hit, index) => ({ record: hit, index }))
            .find(({ record }) => record.objectID === hoveredSearchHitId);
    }, [orderedHits, hoveredSearchHitId]);

    useEffect(() => {
        const [firstHit] = hits;
        if (firstHit != null) {
            setHoveredSearchHitId((id) => id ?? (isAiChatbotEnabledInPreview ? COHERE_AI_HIT_ID : firstHit.objectID));
        }
    }, [hits, isAiChatbotEnabledInPreview]);

    // TODO (rohin): change this
    useKeyboardPress({
        key: "Up",
        onPress: () => {
            if (hoveredSearchHit == null) {
                setHoveredSearchHitId(null);
                return;
            } else if (hoveredSearchHit.index === 0 && isAiChatbotEnabledInPreview) {
                setHoveredSearchHitId(COHERE_AI_HIT_ID);
                return;
            }

            const previousHit = orderedHits[hoveredSearchHit.index - 1];
            if (previousHit != null) {
                setHoveredSearchHitId(previousHit.objectID);
                const ref = refs.current.get(previousHit.objectID);
                ref?.requestPointerLock();
                ref?.focus();
            }
        },
        capture: true,
    });

    // TODO (rohin): change this
    useKeyboardPress({
        key: "Down",
        onPress: () => {
            if (hoveredSearchHitId === COHERE_AI_HIT_ID) {
                setHoveredSearchHitId(orderedHits[0]?.objectID ?? null);
                return;
            }

            if (hoveredSearchHit == null && isAiChatbotEnabledInPreview) {
                setHoveredSearchHitId(COHERE_AI_HIT_ID);
                return;
            }
            const nextHit = orderedHits[hoveredSearchHit != null ? hoveredSearchHit.index + 1 : 0];
            if (nextHit != null) {
                setHoveredSearchHitId(nextHit.objectID);
                const ref = refs.current.get(nextHit.objectID);
                ref?.requestPointerLock();
                ref?.focus();
            }
        },
        capture: true,
    });

    const setOpenCohere = useSetAtom(COHERE_ASK_AI);
    const setCohereInitialMessage = useSetAtom(COHERE_INITIAL_MESSAGE);

    const openCohere = () => {
        setCohereInitialMessage(`Can you tell me about ${search.results.query}?`);
        setOpenCohere(true);
    };

    const toHref = useToHref();
    const navigateToHoveredHit = async () => {
        if (hoveredSearchHit == null) {
            if (
                isAiChatbotEnabledInPreview &&
                hoveredSearchHitId === COHERE_AI_HIT_ID &&
                search.results.query.length > 0
            ) {
                closeSearchDialog();
                openCohere();
            }

            return;
        }
        const slug = FernNavigation.Slug(getSlugForSearchRecord(hoveredSearchHit.record, basePath));
        void router.push(toHref(slug), undefined, {
            // TODO: shallow=true if currently in long scrolling api reference and the hit is on the same page
            shallow: false,
        });
        closeSearchDialog();
    };

    useKeyboardPress({
        key: "Enter",
        onPress: navigateToHoveredHit,
        preventDefault: true,
        capture: true,
    });

    useKeyboardPress({
        key: "Tab",
        onPress: navigateToHoveredHit,
        preventDefault: true,
        capture: true,
    });

    if ((hits.length === 0 && !isAiChatbotEnabledInPreview) || search.results.query.length === 0) {
        return null;
    }

    const { endpointHits, pageHits, fieldHits } = filterHits(hits);

    return (
        <FernScrollArea
            rootClassName="border-default min-h-0 flex-1 shrink border-t"
            className="p-2"
            scrollbars="vertical"
        >
            {isAiChatbotEnabledInPreview && (
                <AskCohereHit
                    setRef={(elem) => {
                        if (elem != null) {
                            refs.current.set(COHERE_AI_HIT_ID, elem);
                        }
                    }}
                    message={search.results.query}
                    isHovered={hoveredSearchHitId === COHERE_AI_HIT_ID}
                    onMouseEnter={() => setHoveredSearchHitId(COHERE_AI_HIT_ID)}
                />
            )}

            {endpointHits.length > 0 && (
                <>
                    <p className="text-normal font-semibold mb-2 pl-0.5">Endpoints</p>

                    {expandHits(expandEndpoints, endpointHits).map((hit) => (
                        <SearchHit
                            setRef={(elem) => {
                                if (elem != null) {
                                    refs.current.set(hit.objectID, elem);
                                }
                            }}
                            key={hit.objectID}
                            hit={hit}
                            isHovered={hoveredSearchHitId === hit.objectID}
                            onMouseEnter={() => setHoveredSearchHitId(hit.objectID)}
                        />
                    ))}
                    {!expandEndpoints && <ExpandButton setExpanded={setExpandEndpoints} />}
                </>
            )}
            {pageHits.length > 0 && (
                <>
                    <p className="text-normal font-semibold mb-2 pl-0.5">Pages</p>
                    {expandHits(expandPages, pageHits).map((hit) => (
                        <SearchHit
                            setRef={(elem) => {
                                if (elem != null) {
                                    refs.current.set(hit.objectID, elem);
                                }
                            }}
                            key={hit.objectID}
                            hit={hit}
                            isHovered={hoveredSearchHitId === hit.objectID}
                            onMouseEnter={() => setHoveredSearchHitId(hit.objectID)}
                        />
                    ))}
                    {!expandPages && <ExpandButton setExpanded={setExpandPages} />}
                </>
            )}

            {fieldHits.length > 0 && (
                <>
                    <p className="text-normal font-semibold mb-2 pl-0.5">Fields</p>
                    {expandHits(expandFields, fieldHits).map((hit) => (
                        <SearchHit
                            setRef={(elem) => {
                                if (elem != null) {
                                    refs.current.set(hit.objectID, elem);
                                }
                            }}
                            key={hit.objectID}
                            hit={hit}
                            isHovered={hoveredSearchHitId === hit.objectID}
                            onMouseEnter={() => setHoveredSearchHitId(hit.objectID)}
                        />
                    ))}
                    {!expandFields && <ExpandButton setExpanded={setExpandFields} />}
                </>
            )}
        </FernScrollArea>
    );
};

export const SearchMobileHits: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAiChatbotEnabledInPreview } = useFeatureFlags();
    const { hits } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();
    const [expandEndpoints, setExpandEndpoints] = useState(false);
    const [expandPages, setExpandPages] = useState(false);
    const [expandFields, setExpandFields] = useState(false);

    const refs = useRef(new Map<string, HTMLAnchorElement>());

    if (search.results.query.length === 0) {
        // fallback to the default view
        return <>{children}</>;
    }

    if (hits.length === 0) {
        return <div className="justify t-muted flex w-full flex-col hits-center py-3">No results found</div>;
    }

    const { endpointHits, pageHits, fieldHits } = filterHits(hits);

    return (
        <FernScrollArea rootClassName="min-h-[80vh]" className="mask-grad-top-4 px-2 pt-4">
            {isAiChatbotEnabledInPreview && (
                <AskCohereHit
                    setRef={(elem) => {
                        if (elem != null) {
                            refs.current.set(COHERE_AI_HIT_ID, elem);
                        }
                    }}
                    message={search.results.query}
                    isHovered={true}
                />
            )}
            {endpointHits.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold mt-4 pl-0.5">Endpoints</h3>
                    <Separator orientation="horizontal" decorative className="my-2 bg-accent" />
                    {expandHits(expandEndpoints, endpointHits).map((hit) => (
                        <SearchHit
                            setRef={(elem) => {
                                if (elem != null) {
                                    refs.current.set(hit.objectID, elem);
                                }
                            }}
                            key={hit.objectID}
                            hit={hit}
                        />
                    ))}
                    {!expandEndpoints && <ExpandButton setExpanded={setExpandEndpoints} />}
                </>
            )}

            {pageHits.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold mt-4 pl-0.5">Fields</h3>
                    <Separator orientation="horizontal" decorative className="my-2 bg-accent" />
                    {expandHits(expandPages, pageHits).map((hit) => (
                        <SearchHit
                            setRef={(elem) => {
                                if (elem != null) {
                                    refs.current.set(hit.objectID, elem);
                                }
                            }}
                            key={hit.objectID}
                            hit={hit}
                        />
                    ))}
                    {!expandPages && <ExpandButton setExpanded={setExpandPages} />}
                </>
            )}

            {fieldHits.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold mt-4 pl-0.5">Pages</h3>
                    <Separator orientation="horizontal" decorative className="my-2 bg-accent" />
                    {expandHits(expandFields, fieldHits).map((hit) => (
                        <SearchHit
                            setRef={(elem) => {
                                if (elem != null) {
                                    refs.current.set(hit.objectID, elem);
                                }
                            }}
                            key={hit.objectID}
                            hit={hit}
                        />
                    ))}
                    {!expandFields && <ExpandButton setExpanded={setExpandFields} />}
                </>
            )}
        </FernScrollArea>
    );
};

function filterHits(hits: SearchRecord[]) {
    const hitTypeMap = {
        endpoints: new Set([
            "endpoint",
            "endpoint-v2",
            "endpoint-v3",
            "webhook-v3",
            "websocket-v3",
            "endpoint-v4",
            "webhook-v4",
            "websocket-v4",
        ]),
        pages: new Set(["page", "page-v2", "page-v3", "page-v4", "markdown-section-v1"]),
        fields: new Set(["endpoint-field-v1", "webhook-field-v1", "websocket-field-v1"]),
    };

    const endpointHits = hits.filter((hit) => hitTypeMap["endpoints"].has(hit.type));
    const pageHits = hits.filter((hit) => hitTypeMap["pages"].has(hit.type));
    const fieldHits = hits.filter((hit) => hitTypeMap["fields"].has(hit.type));

    return { endpointHits, pageHits, fieldHits };
}
