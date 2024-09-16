import { createSearchPlaceholderWithVersion } from "@fern-ui/search-utils";
import * as Dialog from "@radix-ui/react-dialog";
import { SearchClient } from "algoliasearch";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactElement, useMemo, useRef } from "react";
import { InstantSearch, useInstantSearch } from "react-instantsearch";
import {
    CURRENT_VERSION_ATOM,
    IS_MOBILE_SCREEN_ATOM,
    POSITION_SEARCH_DIALOG_OVER_HEADER_ATOM,
    SEARCH_DIALOG_OPEN_ATOM,
    useIsSearchDialogOpen,
    useSidebarNodes,
} from "../../atoms";
import { SearchHits } from "../SearchHits";
import { SearchBox } from "./SearchBox";
import { useAlgoliaSearchClient } from "./useAlgoliaSearchClient";

export function AlgoliaSearchDialog(): ReactElement | null {
    const inputRef = useRef<HTMLInputElement>(null);
    const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);
    const fromHeader = useAtomValue(POSITION_SEARCH_DIALOG_OVER_HEADER_ATOM);

    const isSearchDialogOpen = useIsSearchDialogOpen();
    const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
    const algoliaSearchClient = useAlgoliaSearchClient();
    if (algoliaSearchClient == null || isMobileScreen) {
        if (algoliaSearchClient == null) {
            captureSentryError(new Error("Algolia search client is null"), {
                context: "AlgoliaSearchClient",
                errorSource: "AlgoliaSearchDialog",
                errorDescription: "Algolia search client is null, when attempting to use search.",
            });
        }
        return null;
    }
    const [searchClient, index] = algoliaSearchClient;
    return (
        <Dialog.Root open={isSearchDialogOpen} onOpenChange={setSearchDialogState}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-background/50 fixed inset-0 z-0 backdrop-blur-sm max-sm:hidden" />
                <Dialog.Content
                    className={clsx(
                        "md:max-w-content-width fixed inset-x-0 top-0 z-10 mx-6 my-[10vh] flex max-h-[80vh] flex-col md:mx-auto",
                        { "mt-4": fromHeader },
                    )}
                >
                    <FernInstantSearch searchClient={searchClient} indexName={index} inputRef={inputRef} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

interface FernInstantSearchProps {
    searchClient: SearchClient;
    indexName: string;
    inputRef: React.RefObject<HTMLInputElement>;
}

import { ReactNode } from "react";
import { captureSentryError } from "../../analytics/sentry";

function NoResultsBoundary({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
    const { results } = useInstantSearch();

    if (!results.__isArtificial && results.nbHits === 0) {
        return (
            <>
                {fallback}
                <div hidden>{children}</div>
            </>
        );
    }

    return children;
}

function NoResults() {
    return (
        <div className="justify t-muted flex w-full flex-col items-center py-3">
            <p>No results found.</p>
        </div>
    );
}

function FernInstantSearch({ searchClient, indexName, inputRef }: FernInstantSearchProps) {
    const sidebar = useSidebarNodes();
    const activeVersion = useAtomValue(CURRENT_VERSION_ATOM);
    const placeholder = useMemo(
        () => createSearchPlaceholderWithVersion(activeVersion?.id, sidebar),
        [activeVersion, sidebar],
    );
    return (
        <InstantSearch searchClient={searchClient} indexName={indexName}>
            <div className="bg-search-dialog border-default flex h-auto min-h-0 shrink flex-col overflow-hidden rounded-xl border text-left align-middle shadow-2xl backdrop-blur-lg">
                <SearchBox
                    ref={inputRef}
                    placeholder={placeholder}
                    className="flex-1"
                    inputClassName="form-input w-full text-base t-muted placeholder:t-muted !p-5 form-input !border-none !bg-transparent !outline-none !ring-0"
                />
                <NoResultsBoundary fallback={<NoResults />}>
                    <SearchHits />
                </NoResultsBoundary>
            </div>
        </InstantSearch>
    );
}
