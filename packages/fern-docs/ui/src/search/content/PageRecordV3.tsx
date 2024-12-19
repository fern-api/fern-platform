import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import cn from "clsx";
import { LongArrowDownLeft } from "iconoir-react";
import { SearchHitBreadCrumbsV2 } from "./SearchHitBreadCrumbsV2";

export declare namespace PageRecordV3 {
    export interface Props {
        hit: Algolia.AlgoliaPageRecordV3;
        isHovered: boolean;
    }
}

export const PageRecordV3: React.FC<PageRecordV3.Props> = ({
    hit,
    isHovered,
}) => {
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
                    Page
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span
                    className={cn("line-clamp-1 text-start text-xs", {
                        "t-accent-aaa": isHovered,
                        "t-muted": !isHovered,
                    })}
                >
                    <SearchHitBreadCrumbsV2 breadcrumb={hit.breadcrumbs} />
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
