import { FernScrollArea } from "@fern-ui/components";
import { useKeyboardPress } from "@fern-ui/react-commons";
import { Hit } from "instantsearch.js";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteHits, useInstantSearch } from "react-instantsearch";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useCloseSearchDialog } from "../sidebar/atom";
import { SearchHit } from "./SearchHit";
import type { SearchRecord } from "./types";
import { getFullPathForSearchRecord } from "./util";

export const EmptyStateView: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="justify t-muted flex h-24 w-full flex-col items-center py-3">{children}</div>;
};

export const SearchHits: React.FC = () => {
    const { basePath } = useDocsContext();
    const { hits } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();
    const [hoveredSearchHitId, setHoveredSearchHitId] = useState<string | null>(null);
    const router = useRouter();
    const closeSearchDialog = useCloseSearchDialog();

    const getFullPathForHit = useCallback(
        (hit: Hit<SearchRecord>) => {
            return getFullPathForSearchRecord(hit, basePath);
        },
        [basePath],
    );

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
        if (hoveredSearchHit == null && firstHit != null) {
            setHoveredSearchHitId(firstHit.objectID);
        }
    }, [hits, hoveredSearchHit]);

    useKeyboardPress({
        key: "Up",
        onPress: () => {
            if (hoveredSearchHit == null) {
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
            if (hoveredSearchHit == null) {
                return;
            }
            const nextHit = hits[hoveredSearchHit.index + 1];
            if (nextHit != null) {
                setHoveredSearchHitId(nextHit.objectID);
                const ref = refs.current.get(nextHit.objectID);
                ref?.requestPointerLock();
                ref?.focus();
            }
        },
        capture: true,
    });

    useKeyboardPress({
        key: "Enter",
        onPress: async () => {
            if (hoveredSearchHit == null) {
                return;
            }
            const fullPath = getFullPathForHit(hoveredSearchHit.record);
            void router.replace(`/${fullPath}`, undefined, {
                shallow: false,
            });
            closeSearchDialog();
        },
        preventDefault: true,
        capture: true,
    });

    if (hits.length === 0 || search.results.query.length === 0) {
        return null;
    }

    return (
        <FernScrollArea rootClassName="border-default min-h-0 flex-1 shrink border-t" className="p-2">
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
    const { hits } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();

    const refs = useRef(new Map<string, HTMLAnchorElement>());

    if (search.results.query.length === 0) {
        // fallback to the default view
        return <>{children}</>;
    }

    if (hits.length === 0) {
        return <div className="justify t-muted flex w-full flex-col items-center py-3">No results found</div>;
    }

    return (
        <FernScrollArea className="mask-grad-top-4 px-2 pt-4">
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
