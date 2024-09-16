import { visitDiscriminatedUnion } from "@fern-platform/core-utils";
import type { EndpointSearchRecordV2 } from "@fern-ui/search-utils";
import clsx from "clsx";
import { LongArrowDownLeft } from "iconoir-react";
import { SearchHitBreadCrumbs } from "./SearchHitBreadCrumbs";

export declare namespace EndpointRecordV2 {
    export interface Props {
        hit: EndpointSearchRecordV2;
        isHovered: boolean;
    }
}

export const EndpointRecordV2: React.FC<EndpointRecordV2.Props> = ({ hit, isHovered }) => {
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <div
                    className={clsx("line-clamp-1 flex items-center space-x-1 text-start text-sm", {
                        "t-muted": !isHovered,
                        "t-accent": isHovered,
                    })}
                >
                    <div
                        className={clsx(
                            "flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5 font-mono text-sm uppercase",
                            {
                                "bg-tag-default": !isHovered,
                                "bg-white/20 dark:bg-black/20": isHovered,
                            },
                            {
                                "t-muted": !isHovered,
                                "t-accent-aaa": isHovered,
                            },
                        )}
                    >
                        {hit.endpoint.method}
                    </div>
                    <div className="space-x-0.5 font-mono">
                        {hit.endpoint.path.parts
                            .filter((p) => p.type !== "literal" || p.value !== "")
                            .map((p, idx) =>
                                visitDiscriminatedUnion(p, "type")._visit({
                                    literal: (part) => <span key={idx}>{part.value}</span>,
                                    pathParameter: (part) => (
                                        <span
                                            className={clsx(
                                                "mx-0.5 items-center justify-center rounded px-1 py-0.5 text-sm",
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
                    className={clsx("text-sm tracking-wide", {
                        "t-muted": !isHovered,
                        "t-accent-aaa": isHovered,
                    })}
                >
                    Endpoint
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span
                    className={clsx("line-clamp-1 text-start text-xs", {
                        "t-accent-aaa": isHovered,
                        "t-muted": !isHovered,
                    })}
                >
                    <SearchHitBreadCrumbs parts={hit.path.parts} />
                </span>

                <LongArrowDownLeft
                    className={clsx("size-4", {
                        "t-accent-aaa": isHovered,
                        "t-muted": !isHovered,
                    })}
                />
            </div>
        </div>
    );
};
