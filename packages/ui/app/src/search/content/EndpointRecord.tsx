import { Icon } from "@blueprintjs/core";
import classNames from "classnames";
import { Snippet } from "react-instantsearch-hooks-web";
import type { SearchRecord } from "../types";

export declare namespace EndpointRecord {
    export interface Props {
        hit: SearchRecord;
        isHovered: boolean;
    }
}

export const EndpointRecord: React.FC<EndpointRecord.Props> = ({ hit, isHovered }) => {
    return (
        <>
            <div
                className={classNames("flex flex-col items-center justify-center rounded-md border p-1", {
                    "border-border-default-light dark:border-border-default-dark": !isHovered,
                    "border-white bg-white text-black": isHovered,
                })}
            >
                <Icon
                    className={classNames({
                        "text-text-muted-light dark:text-text-muted-dark": !isHovered,
                        "text-accent-primary dark:text-accent-primary-dark": isHovered,
                    })}
                    size={14}
                    icon="code"
                />
            </div>

            <div className="flex w-full flex-col space-y-1.5">
                <div className="flex justify-between">
                    <Snippet
                        className={classNames("line-clamp-1 text-start", {
                            "text-text-default-light dark:text-text-default-dark": !isHovered,
                            "text-white dark:text-black": isHovered,
                        })}
                        attribute="title"
                        highlightedTagName="span"
                        hit={hit}
                    />
                    <div
                        className={classNames("text-sm uppercase tracking-widest", {
                            "text-text-disabled-light dark:text-text-disabled-dark": !isHovered,
                            "text-white dark:text-black": isHovered,
                        })}
                    >
                        Endpoint
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <Snippet
                        className={classNames("line-clamp-1 text-start", {
                            "text-white dark:text-black": isHovered,
                            "t-muted": !isHovered,
                        })}
                        attribute="subtitle"
                        highlightedTagName="span"
                        hit={hit}
                    />
                </div>
            </div>
        </>
    );
};
