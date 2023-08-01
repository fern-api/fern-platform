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
            className="group flex w-full items-center space-x-4 space-y-1 rounded-md px-3 py-2 hover:bg-neutral-800/50 hover:no-underline"
            onClick={() => {
                closeSearchDialog();
                navigateToPath(hit.path);
            }}
            href={`/${hit.path}`}
        >
            <div className="border-border-concealed flex flex-col items-center justify-center rounded-md border p-1">
                <Icon
                    className="!text-text-default group-hover:!text-text-stark"
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
                        className="text-text-stark group-hover:text-text-stark line-clamp-1 text-start"
                        attribute="title"
                        highlightedTagName="span"
                        hit={hit}
                    />
                    <div className="group-hover:text-text-stark text-xs uppercase tracking-widest text-[#666]">
                        {visitDiscriminatedUnion(hit, "type")._visit({
                            page: () => "Page",
                            endpoint: () => "Endpoint",
                            _other: () => null,
                        })}
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <Snippet
                        className="text-text-default group-hover:text-text-stark line-clamp-1 text-start"
                        attribute="subtitle"
                        highlightedTagName="span"
                        hit={hit}
                    />
                </div>
            </div>
        </Link>
    );
};
