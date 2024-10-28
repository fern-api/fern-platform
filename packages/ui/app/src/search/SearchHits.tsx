import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernScrollArea } from "@fern-ui/components";
import { useKeyboardPress } from "@fern-ui/react-commons";
import { getSlugForSearchRecord, type SearchRecord } from "@fern-ui/search-utils";
import { Minus, Xmark } from "iconoir-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteHits, useInstantSearch } from "react-instantsearch";
import {
    COHERE_ASK_AI,
    COHERE_INITIAL_MESSAGE,
    CURRENT_VERSION_ATOM,
    VERSIONS_ATOM,
    useBasePath,
    useCloseSearchDialog,
    useFeatureFlags,
} from "../atoms";
import { Separator } from "../components/Separator";
import { useToHref } from "../hooks/useHref";
import { deduplicateAlgoliaHits } from "../util/deduplicateAlgoliaHits";
import { filterAlgoliaByVersion } from "../util/filterAlgoliaByVersion";
import { SearchHit } from "./SearchHit";
import { AskCohereHit } from "./cohere/AskCohereHit";

export const EmptyStateView: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="justify t-muted flex h-24 w-full flex-col hits-center py-3">{children}</div>;
};

const COHERE_AI_HIT_ID = "cohere-ai-hit";
const SEARCH_HITS_PER_SECTION = 3;

const expandHits = (expanded: boolean, hits: SearchRecord[]) => {
    return expanded ? hits : hits.slice(0, SEARCH_HITS_PER_SECTION);
};

const ExpandButton: React.FC<{ expanded: boolean; setExpanded: (expanded: boolean) => void }> = ({
    expanded,
    setExpanded,
}) => (
    <div className="flex justify-end pt-2">
        <FernButton
            className="text-left"
            variant="minimal"
            onClick={() => setExpanded(!expanded)}
            icon={expanded ? <Minus /> : <Xmark className="transition rotate-45" />}
            size="small"
        >
            Show {expanded ? "Less" : "More"}
        </FernButton>
    </div>
);

const SearchSection: React.FC<{
    title: string;
    hits: SearchRecord[];
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
    refs: React.MutableRefObject<Map<string, HTMLAnchorElement>>;
    hoveredSearchHitId: string | null;
    setHoveredSearchHitId: (id: string) => void;
}> = ({ title, hits, expanded, setExpanded, refs, hoveredSearchHitId, setHoveredSearchHitId }) => (
    <div className="pb-2">
        <div className="flex justify-between items-center">
            <div className="text-normal font-semibold pl-0.5">{title}</div>
        </div>
        <Separator orientation="horizontal" decorative className="my-2 bg-accent" />
        {expandHits(expanded, hits).map((hit) => (
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
        {hits.length > SEARCH_HITS_PER_SECTION && <ExpandButton expanded={expanded} setExpanded={setExpanded} />}
    </div>
);

const MobileSearchSection: React.FC<{
    title: string;
    hits: SearchRecord[];
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
    refs: React.MutableRefObject<Map<string, HTMLAnchorElement>>;
}> = ({ title, hits, expanded, setExpanded, refs }) => (
    <>
        <h3 className="text-lg font-semibold mt-4 pl-0.5">{title}</h3>
        <Separator orientation="horizontal" decorative className="my-2 bg-accent" />
        {expandHits(expanded, hits).map((hit) => (
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
        <ExpandButton expanded={expanded} setExpanded={setExpanded} />
    </>
);

export const SearchHits: React.FC = () => {
    const { isAiChatbotEnabledInPreview } = useFeatureFlags();
    const basePath = useBasePath();
    const { items } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();
    const [hoveredSearchHitId, setHoveredSearchHitId] = useState<string | null>(null);
    const router = useRouter();
    const closeSearchDialog = useCloseSearchDialog();
    const [orderedHits, setOrderedHits] = useState<SearchRecord[]>([]);
    const [expandEndpoints, setExpandEndpoints] = useState(false);
    const [expandPages, setExpandPages] = useState(false);
    const version = useAtomValue(CURRENT_VERSION_ATOM)?.slug;
    const defaultVersion = useAtomValue(VERSIONS_ATOM)?.[0]?.slug;

    const refs = useRef(new Map<string, HTMLAnchorElement>());

    const hits = useMemo(() => filterAlgoliaByVersion(deduplicateAlgoliaHits(items), version), [items, version]);

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
        setExpandEndpoints(false);
        setExpandPages(false);
    }, [hits]);
    useEffect(() => {
        const { pageHits, endpointHits } = filterHits(hits);
        setOrderedHits([...expandHits(expandPages, pageHits), ...expandHits(expandEndpoints, endpointHits)]);
    }, [hits, expandEndpoints, expandPages]);

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
        const slug = FernNavigation.Slug(
            getSlugForSearchRecord(hoveredSearchHit.record, basePath, version, defaultVersion),
        );
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

    const { endpointHits, pageHits } = filterHits(hits);

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
            {pageHits.length > 0 && (
                <SearchSection
                    title="Pages"
                    hits={pageHits}
                    expanded={expandPages}
                    setExpanded={setExpandPages}
                    refs={refs}
                    hoveredSearchHitId={hoveredSearchHitId}
                    setHoveredSearchHitId={setHoveredSearchHitId}
                />
            )}
            {endpointHits.length > 0 && (
                <SearchSection
                    title="Endpoints"
                    hits={endpointHits}
                    expanded={expandEndpoints}
                    setExpanded={setExpandEndpoints}
                    refs={refs}
                    hoveredSearchHitId={hoveredSearchHitId}
                    setHoveredSearchHitId={setHoveredSearchHitId}
                />
            )}
        </FernScrollArea>
    );
};

export const SearchMobileHits: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAiChatbotEnabledInPreview } = useFeatureFlags();
    const { items } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();
    const [expandEndpoints, setExpandEndpoints] = useState(false);
    const [expandPages, setExpandPages] = useState(false);
    const version = useAtomValue(CURRENT_VERSION_ATOM)?.slug;

    const hits = useMemo(() => filterAlgoliaByVersion(deduplicateAlgoliaHits(items), version), [items, version]);

    const refs = useRef(new Map<string, HTMLAnchorElement>());

    if (search.results.query.length === 0) {
        // fallback to the default view
        return <>{children}</>;
    }

    if (hits.length === 0) {
        return <div className="justify t-muted flex w-full flex-col hits-center py-3">No results found</div>;
    }

    const { endpointHits, pageHits } = filterHits(hits);

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
            {pageHits.length > 0 && (
                <MobileSearchSection
                    title="Pages"
                    hits={pageHits}
                    expanded={expandPages}
                    setExpanded={setExpandPages}
                    refs={refs}
                />
            )}
            {endpointHits.length > 0 && (
                <MobileSearchSection
                    title="Endpoints"
                    hits={endpointHits}
                    expanded={expandEndpoints}
                    setExpanded={setExpandEndpoints}
                    refs={refs}
                />
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
            "endpoint-field-v1",
            "webhook-field-v1",
            "websocket-field-v1",
        ]),
        pages: new Set(["page", "page-v2", "page-v3", "page-v4", "markdown-section-v1"]),
    };

    const pageHits = hits.filter((hit) => hitTypeMap["pages"].has(hit.type));
    const endpointHits = hits.filter((hit) => hitTypeMap["endpoints"].has(hit.type));

    return { pageHits, endpointHits };
}
