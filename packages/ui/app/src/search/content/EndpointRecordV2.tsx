import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { CornerDownLeft } from "react-feather";
import type { EndpointSearchRecordV2 } from "../types";

export declare namespace EndpointRecordV2 {
    export interface Props {
        hit: EndpointSearchRecordV2;
        isHovered: boolean;
    }
}

export const EndpointRecordV2: React.FC<EndpointRecordV2.Props> = ({ hit, isHovered }) => {
    const breadcrumbs = hit.path.parts.map((p) => p.name).join(" > ");
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <div
                    className={classNames("line-clamp-1 flex space-x-1 items-center text-sm text-start", {
                        "t-muted": !isHovered,
                        "text-white dark:text-black": isHovered,
                    })}
                >
                    <div
                        className={classNames(
                            "flex font-mono shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-sm uppercase",
                            {
                                "bg-tag-default-light dark:bg-tag-default-dark": !isHovered,
                                "bg-tag-default-dark dark:bg-tag-default-light": isHovered,
                            },
                            {
                                "t-muted": !isHovered,
                                "text-accent-primary-contrast-contrast": isHovered,
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
                                            className={classNames(
                                                "items-center justify-center mx-0.5 rounded px-1 py-0.5 text-sm",
                                                {
                                                    "bg-tag-default-light dark:bg-tag-default-dark": !isHovered,
                                                    "bg-tag-default-dark dark:bg-tag-default-light": isHovered,
                                                },
                                                {
                                                    "t-muted": !isHovered,
                                                    "text-accent-primary-contrast-contrast": isHovered,
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
                    className={classNames("text-sm tracking-wide", {
                        "t-muted": !isHovered,
                        "text-white dark:text-black": isHovered,
                    })}
                >
                    Endpoint
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span
                    className={classNames("line-clamp-1 text-start text-xs", {
                        "text-white dark:text-black": isHovered,
                        "t-muted": !isHovered,
                    })}
                >
                    {breadcrumbs}
                </span>

                <CornerDownLeft
                    className={classNames("size-3", {
                        "text-white dark:text-black": isHovered,
                        "t-muted": !isHovered,
                    })}
                />
            </div>
        </div>
    );
};
