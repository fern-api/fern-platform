import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import cn from "clsx";
import { LongArrowDownLeft } from "iconoir-react";
import { BaseHit, Hit } from "instantsearch.js";
import { Snippet } from "react-instantsearch";
import { SearchHitBreadCrumbsV3 } from "./SearchHitBreadCrumbsV3";

export declare namespace MarkdownSectionRecordV1 {
    export interface Props {
        hit: Hit<Algolia.AlgoliaMarkdownSectionRecordV1 & BaseHit>;
        isHovered: boolean;
    }
}

export const MarkdownSectionRecordV1: React.FC<MarkdownSectionRecordV1.Props> = ({ hit, isHovered }) => {
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <span
                    className={cn("line-clamp-1 text-sm text-start", {
                        "t-default": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    {hit.title}
                </span>
                <div
                    className={cn("text-sm tracking-wide", {
                        "t-muted": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    Section
                </div>
            </div>
            {hit.content && (
                <div className="flex items-center justify-between">
                    <span
                        className={cn("line-clamp-1 text-start text-xs", {
                            "t-accent-aaa": isHovered,
                            "t-muted": !isHovered,
                        })}
                    >
                        <Snippet
                            attribute="content"
                            hit={hit}
                            className={cn("line-clamp-1 text-start text-xs", {
                                "t-accent-aaa": isHovered,
                                "t-muted": !isHovered,
                            })}
                            classNames={{ highlighted: "fern-highlight" }}
                        />
                    </span>
                </div>
            )}
            <div className="flex items-center justify-between">
                <span
                    className={cn("line-clamp-1 text-start text-xs", {
                        "t-accent-aaa": isHovered,
                        "t-muted": !isHovered,
                    })}
                >
                    <SearchHitBreadCrumbsV3 breadcrumb={hit.breadcrumbs} />
                </span>

                <LongArrowDownLeft
                    className={cn("size-4", {
                        "t-accent-aaa": isHovered,
                        "t-muted": !isHovered,
                    })}
                />
            </div>
        </div>
    );
};
