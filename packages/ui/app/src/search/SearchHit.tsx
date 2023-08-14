import { Icon } from "@blueprintjs/core";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import Link from "next/link";
import { Snippet } from "react-instantsearch-hooks-web";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useSearchContext } from "../search-context/useSearchContext";
import type { SearchRecord } from "./types";

export declare namespace SearchHit {
    export interface Props {
        hit: SearchRecord;
    }
}

export const SearchHit: React.FC<SearchHit.Props> = ({ hit }) => {
    const { navigateToPath } = useDocsContext();
    const { closeSearchDialog } = useSearchContext();

    return (
        <Link
            className="hover:bg-background-secondary-light hover:dark:bg-background-secondary-dark group flex w-full items-center space-x-4 space-y-1 rounded-md px-3 py-2 hover:no-underline"
            onClick={() => {
                closeSearchDialog();
                navigateToPath(hit.path);
            }}
            href={`/${hit.path}`}
        >
            <div className="border-border-default-light dark:border-border-default-dark flex flex-col items-center justify-center rounded-md border p-1">
                <Icon
                    className="!text-text-muted-light dark:!text-text-muted-dark group-hover:!text-text-primary-light group-hover:dark:!text-text-primary-dark"
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
                        className="text-text-primary-light dark:text-text-primary-dark group-hover:text-text-primary-light group-hover:dark:text-text-primary-dark line-clamp-1 text-start"
                        attribute="title"
                        highlightedTagName="span"
                        hit={hit}
                    />
                    <div className="group-hover:text-text-primary-light group-hover:dark:text-text-primary-dark text-text-disabled-light dark:text-text-disabled-dark text-xs uppercase tracking-widest">
                        {visitDiscriminatedUnion(hit, "type")._visit({
                            page: () => "Page",
                            endpoint: () => "Endpoint",
                            _other: () => null,
                        })}
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <Snippet
                        className="t-muted group-hover:text-text-primary-light group-hover:dark:text-text-primary-dark line-clamp-1 text-start"
                        attribute="subtitle"
                        highlightedTagName="span"
                        hit={hit}
                    />
                </div>
            </div>
        </Link>
    );
};
