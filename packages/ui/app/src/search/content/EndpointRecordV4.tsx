import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import cn from "clsx";
import { LongArrowDownLeft } from "iconoir-react";
import type { Hit } from "instantsearch.js";
import { HttpMethodTag } from "../../components/HttpMethodTag";
import { AlgoliaSnippet } from "../algolia/AlgoliaSnippet";
import { SearchHitBreadCrumbsV3 } from "./SearchHitBreadCrumbsV3";

export declare namespace EndpointRecordV4 {
    export interface Props {
        hit: Hit<
            (Algolia.AlgoliaRecord.EndpointV4 | Algolia.AlgoliaRecord.WebsocketV4 | Algolia.AlgoliaRecord.WebhookV4) &
                Record<string, unknown>
        >;
        isHovered: boolean;
    }
}

export const EndpointRecordV4: React.FC<EndpointRecordV4.Props> = ({ hit, isHovered }) => {
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <div
                    className={cn("line-clamp-1 flex gap-1 items-center text-sm text-start", {
                        "t-muted": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    <HttpMethodTag
                        method={
                            hit.type === "websocket-v4"
                                ? "WSS"
                                : hit.type === "endpoint-v4" && hit.isResponseStream
                                  ? "STREAM"
                                  : hit.method
                        }
                        active={isHovered}
                    />
                    <div className="space-x-0.5 font-mono">
                        {hit.endpointPath
                            .filter((p) => p.type !== "literal" || p.value !== "")
                            .map((p, idx) =>
                                visitDiscriminatedUnion(p, "type")._visit({
                                    literal: (part) => <span key={idx}>{part.value}</span>,
                                    pathParameter: (part) => (
                                        <span
                                            className={cn(
                                                "items-center justify-center mx-0.5 rounded px-1 py-0.5 text-sm",
                                                {
                                                    "bg-tag-default": !isHovered,
                                                    "bg-white/20 dark:bg-black/20": isHovered,
                                                },
                                                {
                                                    "t-muted": !isHovered,
                                                    "t-accent-aaa": isHovered,
                                                },
                                            )}
                                            key={idx}
                                        >
                                            :{part.value}
                                        </span>
                                    ),
                                    _other: () => null,
                                }),
                            )}
                    </div>
                </div>
                <div
                    className={cn("text-sm tracking-wide", {
                        "t-muted": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    Endpoint
                </div>
            </div>
            {
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                        <span
                            className={cn("line-clamp-1 text-start text-xs", {
                                "t-accent-aaa": isHovered,
                                "t-muted": !isHovered,
                            })}
                        >
                            <AlgoliaSnippet hit={hit} />
                        </span>
                    </div>
                </div>
            }
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
