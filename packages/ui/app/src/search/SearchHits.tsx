import { Spinner, SpinnerSize } from "@blueprintjs/core";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import React, { PropsWithChildren, useMemo, useState } from "react";
import { useInfiniteHits, useInstantSearch } from "react-instantsearch-hooks-web";
import { SearchHit } from "./SearchHit";
import type { SearchRecord } from "./types";

type Progress = "error" | "pending" | "success";

export const EmptyStateView: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="t-muted justify flex h-24 w-full flex-col items-center py-3">{children}</div>;
};

export const SearchHits: React.FC = () => {
    const { hits } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();
    const [hoveredSearchHitId, setHoveredSearchHitId] = useState<string | null>(null);

    const progress = useMemo((): Progress => {
        switch (search.status) {
            case "idle":
                return "success";
            case "stalled":
            case "loading":
                return "pending";
            case "error":
                return "error";
        }
    }, [search]);

    if (search.results.query.length === 0) {
        return null;
    }

    return (
        <div
            className={classNames("max-h-80 overflow-y-auto p-2", {
                "border-border-default-light/10 dark:border-border-default-dark/10 border-t":
                    (progress === "success" || progress === "pending") && hits.length > 0,
            })}
        >
            <div
                className={classNames(
                    "t-muted flex w-full flex-col items-center",
                    progress === "success" && hits.length > 0 ? "min-h-[6rem]" : "min-h-[3rem]"
                )}
            >
                {visitDiscriminatedUnion({ progress }, "progress")._visit<React.ReactNode>({
                    pending: () => <Spinner size={SpinnerSize.SMALL} />,
                    error: () => "An unexpected error has occurred while loading the results.",
                    success: () =>
                        hits.length > 0
                            ? hits.map((hit) => (
                                  <SearchHit
                                      key={hit.objectID}
                                      hit={hit}
                                      isHovered={hoveredSearchHitId === hit.objectID}
                                      onMouseEnter={() => setHoveredSearchHitId(hit.objectID)}
                                      onMouseLeave={() => setHoveredSearchHitId(null)}
                                  />
                              ))
                            : "No results",
                    _other: () => null,
                })}
            </div>
        </div>
    );
};
