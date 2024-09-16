import { FernNavigation } from "@fern-api/fdr-sdk";
import { FernScrollArea } from "@fern-ui/components";
import { useKeyboardPress } from "@fern-ui/react-utils";
import { getSlugForSearchRecord, type SearchRecord } from "@fern-ui/search-utils";
import { useSetAtom } from "jotai";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteHits, useInstantSearch } from "react-instantsearch";
import { COHERE_ASK_AI, COHERE_INITIAL_MESSAGE, useBasePath, useCloseSearchDialog, useFeatureFlags } from "../atoms";
import { useToHref } from "../hooks/useHref";
import { SearchHit } from "./SearchHit";
import { AskCohereHit } from "./cohere/AskCohereHit";

export const EmptyStateView: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="justify t-muted hits-center flex h-24 w-full flex-col py-3">{children}</div>;
};

const COHERE_AI_HIT_ID = "cohere-ai-hit";

export const SearchHits: React.FC = () => {
    const { isAiChatbotEnabledInPreview } = useFeatureFlags();
    const basePath = useBasePath();
    const { hits } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();
    const [hoveredSearchHitId, setHoveredSearchHitId] = useState<string | null>(null);
    const router = useRouter();
    const closeSearchDialog = useCloseSearchDialog();

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

    const hoveredSearchHit = useMemo(() => {
        return hits
            .map((hit, index) => ({ record: hit, index }))
            .find(({ record }) => record.objectID === hoveredSearchHitId);
    }, [hits, hoveredSearchHitId]);

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

            const previousHit = hits[hoveredSearchHit.index - 1];
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
                setHoveredSearchHitId(hits[0]?.objectID ?? null);
                return;
            }

            if (hoveredSearchHit == null && isAiChatbotEnabledInPreview) {
                setHoveredSearchHitId(COHERE_AI_HIT_ID);
                return;
            }
            const nextHit = hits[hoveredSearchHit != null ? hoveredSearchHit.index + 1 : 0];
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
            {hits.map((hit) => (
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
        </FernScrollArea>
    );
};

export const SearchMobileHits: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAiChatbotEnabledInPreview } = useFeatureFlags();
    const { hits } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();

    const refs = useRef(new Map<string, HTMLAnchorElement>());

    if (search.results.query.length === 0) {
        // fallback to the default view
        return <>{children}</>;
    }

    if (hits.length === 0) {
        return <div className="justify t-muted hits-center flex w-full flex-col py-3">No results found</div>;
    }

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
            {hits.map((hit) => (
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
        </FernScrollArea>
    );
};
