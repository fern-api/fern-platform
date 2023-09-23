import { Icon } from "@blueprintjs/core";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import Link from "next/link";
import { useCallback } from "react";
import { Snippet } from "react-instantsearch-hooks-web";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useSearchContext } from "../search-context/useSearchContext";
import type { SearchRecord } from "./types";

export declare namespace SearchHit {
    export interface Props {
        setRef?: (elem: HTMLAnchorElement | null) => void;
        hit: SearchRecord;
        isHovered: boolean;
        onMouseEnter: () => void;
        onMouseLeave: () => void;
    }
}

export const SearchHit: React.FC<SearchHit.Props> = ({ setRef, hit, isHovered, onMouseEnter, onMouseLeave }) => {
    const { navigateToPath } = useDocsContext();
    const { closeSearchDialog } = useSearchContext();

    const handleClick = useCallback(() => {
        closeSearchDialog();
        navigateToPath(hit.path);
    }, [closeSearchDialog, navigateToPath, hit.path]);

    const { versionSlug, path } = hit;
    const href = `/${versionSlug != null ? `${versionSlug}/` : ""}${path}`;

    return (
        <Link
            ref={(elem) => setRef?.(elem)}
            className={classNames("flex w-full items-center space-x-4 space-y-1 rounded-md px-3 py-2 !no-underline", {
                "bg-background-secondary-light dark:bg-background-secondary-dark": isHovered,
            })}
            onClick={handleClick}
            href={href}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="border-border-default-light dark:border-border-default-dark flex flex-col items-center justify-center rounded-md border p-1">
                <Icon
                    className={classNames({
                        "!text-text-muted-light dark:!text-text-muted-dark": !isHovered,
                        "!text-text-primary-light dark:!text-text-primary-dark": isHovered,
                    })}
                    size={14}
                    icon={visitDiscriminatedUnion(hit, "type")._visit({
                        endpoint: () => "code",
                        page: () => "document",
                        _other: () => "document",
                    })}
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
                        {visitDiscriminatedUnion(hit, "type")._visit({
                            page: () => "Page",
                            endpoint: () => "Endpoint",
                            _other: () => null,
                        })}
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
        </Link>
    );
};
