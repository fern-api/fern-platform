import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import cn from "clsx";
import { LongArrowDownLeft } from "iconoir-react";
import type { BaseHit, Hit } from "instantsearch.js";
import { Snippet } from "react-instantsearch";
import { SearchHitBreadCrumbsV3 } from "./SearchHitBreadCrumbsV3";

export declare namespace FieldRecordV1 {
    export interface Props {
        hit: Hit<
            (
                | Algolia.AlgoliaRecord.EndpointFieldV1
                | Algolia.AlgoliaRecord.WebsocketFieldV1
                | Algolia.AlgoliaRecord.WebhookFieldV1
            ) &
                BaseHit
        >;
        isHovered: boolean;
    }
}

export const FieldRecordV1: React.FC<FieldRecordV1.Props> = ({ hit, isHovered }) => {
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <div
                    className={cn("line-clamp-1 flex gap-1 items-center text-sm text-start", {
                        "t-muted": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    {/* <HttpMethodTag
                        method={
                            hit.type === "websocket-field-v1"
                                ? "WSS"
                                : hit.type === "endpoint-field-v1" && hit.isResponseStream
                                  ? "STREAM"
                                  : hit.method
                        }
                        active={isHovered}
                    /> */}
                    <div>
                        <span
                        // className={cn("line-clamp-1 text-sm text-start", {
                        //     "t-default": !isHovered,
                        //     "t-accent-aaa": isHovered,
                        // })}
                        >
                            {hit.title}
                        </span>
                    </div>
                </div>
                <div
                    className={cn("text-sm tracking-wide", {
                        "t-muted": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    Field
                </div>
            </div>
            {hit.description && (
                <div className="flex items-center justify-between">
                    <span
                        className={cn("line-clamp-1 text-start text-xs", {
                            "t-accent-aaa": isHovered,
                            "t-muted": !isHovered,
                        })}
                    >
                        <Snippet
                            attribute="description"
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
                    <SearchHitBreadCrumbsV3 breadcrumbs={hit.breadcrumbs} />
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
