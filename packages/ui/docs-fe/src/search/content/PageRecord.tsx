import type { SearchRecord } from "@fern-ui/search-utils";
import clsx from "clsx";
import { Page } from "iconoir-react";
import { Snippet } from "react-instantsearch";

export declare namespace PageRecord {
    export interface Props {
        hit: SearchRecord;
        isHovered: boolean;
    }
}

export const PageRecord: React.FC<PageRecord.Props> = ({ hit, isHovered }) => {
    return (
        <>
            <div
                className={clsx("flex flex-col items-center justify-center rounded-md border p-1", {
                    "border-default": !isHovered,
                    "border-white bg-white text-black dark:border-black dark:bg-black": isHovered,
                })}
            >
                <Page
                    className={clsx("size-4", {
                        "!t-muted": !isHovered,
                        "!t-accent": isHovered,
                    })}
                />
            </div>

            <div className="flex w-full flex-col space-y-1.5">
                <div className="flex justify-between">
                    <Snippet
                        className={clsx("line-clamp-1 text-start", {
                            "t-default": !isHovered,
                            "text-white dark:text-black": isHovered,
                        })}
                        attribute="title"
                        highlightedTagName="span"
                        hit={hit}
                    />
                    <div
                        className={clsx("text-sm uppercase tracking-widest", {
                            "text-text-disabled": !isHovered,
                            "text-white dark:text-black": isHovered,
                        })}
                    >
                        Page
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <Snippet
                        className={clsx("line-clamp-1 text-start", {
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
