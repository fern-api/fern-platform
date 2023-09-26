import { Icon } from "@blueprintjs/core";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { ArrowUTurnRightIcon } from "../../commons/icons/ArrowUTurnRightIcon";
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
        <>
            <div
                className={classNames("flex flex-col items-center justify-center rounded-md border p-1", {
                    "border-border-default-light dark:border-border-default-dark": !isHovered,
                    "border-white bg-white": isHovered,
                })}
            >
                <Icon
                    className={classNames({
                        "!text-text-muted-light dark:!text-text-muted-dark": !isHovered,
                        "!text-accent-primary": isHovered,
                    })}
                    size={14}
                    icon="code"
                />
            </div>

            <div className="flex w-full flex-col space-y-1.5">
                <div className="flex justify-between">
                    <div
                        className={classNames("line-clamp-1 flex space-x-1 items-center text-xs text-start", {
                            "t-muted": !isHovered,
                            "text-white": isHovered,
                        })}
                    >
                        <div
                            className={classNames(
                                "flex font-mono shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-xs uppercase",
                                {
                                    "bg-tag-default-light dark:bg-tag-default-dark": !isHovered,
                                    "bg-white": isHovered,
                                },
                                {
                                    "t-muted": !isHovered,
                                    "text-accent-primary": isHovered,
                                }
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
                                                    "items-center justify-center mx-0.5 rounded px-1 py-0.5 text-xs",
                                                    {
                                                        "bg-tag-default-light dark:bg-tag-default-dark": !isHovered,
                                                        "bg-white": isHovered,
                                                    },
                                                    {
                                                        "t-muted": !isHovered,
                                                        "text-accent-primary": isHovered,
                                                    }
                                                )}
                                                key={idx}
                                            >
                                                :{part.value}
                                            </span>
                                        ),
                                        _other: () => null,
                                    })
                                )}
                        </div>
                    </div>
                    <div
                        className={classNames("text-xs tracking-wide", {
                            "t-muted": !isHovered,
                            "text-white": isHovered,
                        })}
                    >
                        Endpoint
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span
                        className={classNames("line-clamp-1 text-start text-xs", {
                            "text-white": isHovered,
                            "t-muted": !isHovered,
                        })}
                    >
                        {breadcrumbs}
                    </span>

                    <ArrowUTurnRightIcon
                        className={classNames("h-3 w-3 rotate-180", {
                            "text-white": isHovered,
                            "t-muted": !isHovered,
                        })}
                    />
                </div>
            </div>
        </>
    );
};
