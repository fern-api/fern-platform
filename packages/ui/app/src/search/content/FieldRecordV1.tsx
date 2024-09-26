import { visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import cn from "clsx";
import { LongArrowDownLeft } from "iconoir-react";
import type { BaseHit, Hit } from "instantsearch.js";
import { Snippet } from "react-instantsearch";
import { BreadcrumbsInfo } from "../../../../../fdr-sdk/src/client/FdrAPI";
import { HttpMethodTag } from "../../components/HttpMethodTag";
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

const filterBreadcrumbParts = (breadcrumbs: BreadcrumbsInfo[]) => {
    const slicedBreadcrumbs = breadcrumbs.filter((breadcrumb) => !breadcrumb.slug.includes("#"));

    const relativelyQualifiedField = breadcrumbs
        .slice(slicedBreadcrumbs.length)
        .map((part) => part.title)
        .join(".");

    return {
        slicedBreadcrumbs,
        relativelyQualifiedField,
    };
};

export const FieldRecordV1: React.FC<FieldRecordV1.Props> = ({ hit, isHovered }) => {
    const breadcrumbParts = filterBreadcrumbParts(hit.breadcrumbs);
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <div
                    className={cn("line-clamp-1 flex gap-1 items-center text-sm text-start", {
                        "t-muted": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    <div>
                        <span>{breadcrumbParts.relativelyQualifiedField}</span>
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
            <div className="flex items-center justify-between">
                <div
                    className={cn("line-clamp-1 flex gap-1 items-center text-sm text-start", {
                        "t-muted": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    <HttpMethodTag
                        method={
                            hit.type === "websocket-field-v1"
                                ? "WSS"
                                : hit.type === "endpoint-field-v1" && hit.isResponseStream
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
                    <SearchHitBreadCrumbsV3
                        breadcrumb={isHovered ? hit.breadcrumbs : breadcrumbParts.slicedBreadcrumbs}
                    />
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
