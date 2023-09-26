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
            <div className="border-border-default-light dark:border-border-default-dark flex flex-col items-center justify-center rounded-md border p-1">
                <Icon
                    className={classNames({
                        "!text-text-muted-light dark:!text-text-muted-dark": !isHovered,
                        "!text-text-primary-light dark:!text-text-primary-dark": isHovered,
                    })}
                    size={14}
                    icon="code"
                />
            </div>

            <div className="flex w-full flex-col space-y-1.5">
                <div className="flex justify-between">
                    <Snippet
                        className="text-text-primary-light dark:text-text-primary-dark line-clamp-1 text-start"
                        attribute="title"
                        highlightedTagName="span"
                        hit={hit}
                    />
                    <div
                        className={classNames("text-xs uppercase tracking-widest", {
                            "text-text-disabled-light dark:text-text-disabled-dark": !isHovered,
                            "text-text-primary-light dark:text-text-primary-dark": isHovered,
                        })}
                    >
                        Endpoint
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <Snippet
                        className={classNames("line-clamp-1 text-start", {
                            "text-text-primary-light dark:text-text-primary-dark": isHovered,
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
