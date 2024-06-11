import { Algolia } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { CornerDownLeft } from "react-feather";
import { SearchHitBreadCrumbsV2 } from "./SearchHitBreadCrumbsV2";

export declare namespace PageRecordV2 {
    export interface Props {
        hit: Algolia.AlgoliaPageRecordV3;
        isHovered: boolean;
    }
}

export const PageRecordV2: React.FC<PageRecordV2.Props> = ({ hit, isHovered }) => {
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <span
                    className={cn("line-clamp-1 text-sm text-start", {
                        "t-default": !isHovered,
                        "t-accent-contrast": isHovered,
                    })}
                >
                    {hit.title}
                </span>
                <div
                    className={cn("text-sm tracking-wide", {
                        "t-muted": !isHovered,
                        "t-accent-contrast": isHovered,
                    })}
                >
                    Page
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span
                    className={cn("line-clamp-1 text-start text-xs", {
                        "t-accent-contrast": isHovered,
                        "t-muted": !isHovered,
                    })}
                >
                    <SearchHitBreadCrumbsV2 breadcrumbs={hit.breadcrumbs} />
                </span>

                <CornerDownLeft
                    className={cn("size-3", {
                        "t-accent-contrast": isHovered,
                        "t-muted": !isHovered,
                    })}
                />
            </div>
        </div>
    );
};
